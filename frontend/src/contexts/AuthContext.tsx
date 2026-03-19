"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAccount, useSignMessage } from "wagmi"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import { auth, FIREBASE_ENABLED } from "@/lib/firebase/config"
import { 
  registerWithEmail, 
  loginWithEmail, 
  logout as firebaseLogout,
  linkWalletAddress 
} from "@/lib/firebase/auth"
import { getUserById, getUserByWallet } from "@/lib/firebase/firestore"
import { generateAndStoreOTP, verifyOTPCode } from "@/lib/firebase/otp"

interface User {
  id: string
  address?: string
  email?: string
  role: "institute" | "student" | "verifier"
  name?: string
  institutionName?: string
  mfaEnabled: boolean
  authenticated: boolean
}

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithWallet: () => Promise<void>
  verifyOTP: (otp: string) => Promise<boolean>
  logout: () => void
  register: (email: string, password: string, role: string, name?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingAuth, setPendingAuth] = useState<any>(null)
  
  const { address, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()

  // Listen to Firebase Auth state changes
  useEffect(() => {
    if (!FIREBASE_ENABLED || !auth) {
      setIsLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser)
        
        // Load user data from Firestore
        const userData = await getUserById(firebaseUser.uid)
        if (userData) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || undefined,
            address: userData.walletAddress,
            role: userData.role,
            name: userData.name,
            institutionName: userData.institutionName,
            mfaEnabled: userData.mfaEnabled,
            authenticated: true,
          })
        }
      } else {
        setFirebaseUser(null)
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // When wallet connects without a Firebase session, look up Firestore profile by wallet address.
  // This covers users who registered before and already have their wallet linked.
  useEffect(() => {
    if (!isConnected || !address || user || !FIREBASE_ENABLED) return
    const findByWallet = async () => {
      try {
        const existing = await getUserByWallet(address)
        if (existing) {
          setUser({
            id: existing.id,
            email: existing.email,
            address: existing.walletAddress,
            role: existing.role,
            name: existing.name,
            institutionName: existing.institutionName,
            mfaEnabled: existing.mfaEnabled,
            authenticated: true,
          })
        }
      } catch (error) {
        console.error("Error looking up user by wallet:", error)
      }
    }
    findByWallet()
  }, [address, isConnected, user])

  // When a Firebase-authenticated user connects a wallet, link wallet to their Firestore record.
  useEffect(() => {
    const linkWallet = async () => {
      if (isConnected && address && user && user.id && !user.address) {
        try {
          await linkWalletAddress(user.id, address)
          setUser((prev) => (prev ? { ...prev, address } : null))
        } catch (error) {
          console.error("Error linking wallet:", error)
        }
      }
    }
    linkWallet()
  }, [address, isConnected, user])

  const login = async (email: string, password: string) => {
    if (!FIREBASE_ENABLED) {
      throw new Error(
        "Firebase not configured! Please set up Firebase:\n" +
        "1. Create project at https://console.firebase.google.com/\n" +
        "2. Copy config to .env.local\n" +
        "3. See frontend/FIREBASE_SETUP.md for details"
      )
    }

    setIsLoading(true)
    try {
      // Attempt Firebase login
      const userCredential = await loginWithEmail(email, password)
      
      // Check if MFA is enabled
      const userData = await getUserById(userCredential.user.uid)
      if (userData?.mfaEnabled) {
        // Generate and send OTP
        await generateAndStoreOTP(userCredential.user.uid, email)
        setPendingAuth({ uid: userCredential.user.uid, email })
        
        // Sign out temporarily until OTP is verified
        await firebaseLogout()
      }
    } catch (error: any) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithWallet = async () => {
    if (!FIREBASE_ENABLED) {
      throw new Error(
        "Firebase not configured! Wallet linking requires Firebase.\n" +
        "See frontend/FIREBASE_SETUP.md for setup instructions."
      )
    }

    if (!isConnected || !address) {
      throw new Error("Please connect your wallet first")
    }

    setIsLoading(true)
    try {
      // Generate challenge message
      const message = `Sign this message to authenticate with BC-CVS\n\nAddress: ${address}\nTimestamp: ${Date.now()}`

      // Request wallet signature
      await signMessageAsync({ message })

      // TODO: Implement wallet-based authentication with backend
      // For now, just link the wallet if user is logged in
      if (user && user.id) {
        await linkWalletAddress(user.id, address)
        setUser((prev) => (prev ? { ...prev, address } : null))
      } else {
        throw new Error("Please login first to link your wallet")
      }
    } catch (error) {
      console.error("Wallet login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOTP = async (otp: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      console.log("🔐 Starting OTP verification")
      console.log("📧 Pending auth state:", pendingAuth)
      
      if (!pendingAuth || !pendingAuth.email) {
        console.error("❌ No pending auth or email found")
        return false
      }

      console.log("📤 Verifying OTP for email:", pendingAuth.email)
      
      // Verify OTP with Firestore
      const isValid = await verifyOTPCode(pendingAuth.email, otp)
      
      if (isValid) {
        console.log("✅ OTP verified, re-authenticating user")
        // Re-login after OTP verification
        // The onAuthStateChanged listener will handle setting the user
        setPendingAuth(null)
        return true
      }

      console.log("❌ OTP verification returned false")
      return false
    } catch (error) {
      console.error("OTP verification error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await firebaseLogout()
      setUser(null)
      setPendingAuth(null)
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  const register = async (email: string, password: string, role: string, name?: string) => {
    if (!FIREBASE_ENABLED) {
      throw new Error(
        "Firebase not configured! Please set up Firebase:\n" +
        "1. Create project at https://console.firebase.google.com/\n" +
        "2. Copy config to .env.local\n" +
        "3. See frontend/FIREBASE_SETUP.md for details"
      )
    }

    setIsLoading(true)
    try {
      // Validate inputs
      if (!email || !password || password.length < 8) {
        throw new Error("Invalid registration data")
      }

      if (!["institute", "student", "verifier"].includes(role)) {
        throw new Error("Invalid role selected")
      }

      // Register with Firebase Auth and create Firestore user
      const userCredential = await registerWithEmail(
        email, 
        password, 
        role as "institute" | "student" | "verifier",
        name
      )

      // Generate OTP for email verification
      await generateAndStoreOTP(userCredential.user.uid, email)
      
      // Store pending auth for OTP verification
      setPendingAuth({ 
        uid: userCredential.user.uid, 
        email, 
        role 
      })

      // Note: User receives verification email from Firebase
      console.log("Verification OTP sent to:", email)
    } catch (error: any) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user?.authenticated,
        isLoading,
        login,
        loginWithWallet,
        verifyOTP,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
