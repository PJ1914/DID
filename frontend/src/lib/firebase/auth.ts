import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
  sendEmailVerification,
  updatePassword,
} from "firebase/auth"
import { auth, FIREBASE_ENABLED } from "./config"
import { createUser, getUserByEmail, getUserById, updateUser } from "./firestore"

/**
 * Register a new user with email and password
 * @param email - User email
 * @param password - User password
 * @param role - User role (institute, student, verifier)
 * @param name - User display name
 * @returns UserCredential from Firebase Auth
 */
export const registerWithEmail = async (
  email: string,
  password: string,
  role: "institute" | "student" | "verifier",
  name?: string
): Promise<UserCredential> => {
  if (!FIREBASE_ENABLED || !auth) {
    throw new Error("Firebase not configured. See frontend/FIREBASE_SETUP.md")
  }

  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)

    // Update profile with display name
    if (name) {
      await updateProfile(userCredential.user, { displayName: name })
    }

    // Create Firestore user document
    await createUser(userCredential.user.uid, {
      email,
      role,
      name,
      mfaEnabled: false,
    })

    // Send email verification
    await sendEmailVerification(userCredential.user)

    return userCredential
  } catch (error: any) {
    console.error("Registration error:", error)
    throw new Error(getAuthErrorMessage(error.code))
  }
}

/**
 * Sign in with email and password
 * @param email - User email
 * @param password - User password
 * @returns UserCredential from Firebase Auth
 */
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  if (!FIREBASE_ENABLED || !auth) {
    throw new Error("Firebase not configured. See frontend/FIREBASE_SETUP.md")
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential
  } catch (error: any) {
    console.error("Login error:", error)
    throw new Error(getAuthErrorMessage(error.code))
  }
}

/**
 * Sign out the current user
 */
export const logout = async (): Promise<void> => {
  if (!FIREBASE_ENABLED || !auth) {
    return
  }
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Logout error:", error)
    throw error
  }
}

/**
 * Send password reset email
 * @param email - User email
 */
export const resetPassword = async (email: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !auth) {
    throw new Error("Firebase not configured")
  }
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (error: any) {
    console.error("Password reset error:", error)
    throw new Error(getAuthErrorMessage(error.code))
  }
}

/**
 * Update user password
 * @param user - Firebase user
 * @param newPassword - New password
 */
export const changePassword = async (user: User, newPassword: string): Promise<void> => {
  try {
    await updatePassword(user, newPassword)
  } catch (error: any) {
    console.error("Password change error:", error)
    throw new Error(getAuthErrorMessage(error.code))
  }
}

/**
 * Link wallet address to user account
 * @param userId - Firebase user ID
 * @param walletAddress - Ethereum wallet address
 */
export const linkWalletAddress = async (
  userId: string,
  walletAddress: string
): Promise<void> => {
  try {
    await updateUser(userId, { walletAddress })
  } catch (error) {
    console.error("Error linking wallet:", error)
    throw error
  }
}

/**
 * Update user profile
 * @param userId - Firebase user ID
 * @param updates - Profile updates
 */
export const updateUserProfile = async (
  userId: string,
  updates: {
    name?: string
    institutionName?: string
    mfaEnabled?: boolean
  }
): Promise<void> => {
  if (!FIREBASE_ENABLED || !auth) {
    throw new Error("Firebase not configured")
  }
  try {
    await updateUser(userId, updates)

    // Update Firebase Auth profile if name changed
    if (updates.name && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: updates.name })
    }
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}

/**
 * Get current Firebase Auth user
 * @returns Current user or null
 */
export const getCurrentUser = (): User | null => {
  if (!FIREBASE_ENABLED || !auth) {
    return null
  }
  return auth.currentUser
}

/**
 * Convert Firebase Auth error codes to user-friendly messages
 * @param errorCode - Firebase error code
 * @returns User-friendly error message
 */
function getAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "auth/email-already-in-use": "This email is already registered",
    "auth/invalid-email": "Invalid email address",
    "auth/operation-not-allowed": "Operation not allowed",
    "auth/weak-password": "Password is too weak. Use at least 6 characters",
    "auth/user-disabled": "This account has been disabled",
    "auth/user-not-found": "No account found with this email",
    "auth/wrong-password": "Incorrect password",
    "auth/too-many-requests": "Too many attempts. Please try again later",
    "auth/network-request-failed": "Network error. Please check your connection",
    "auth/requires-recent-login": "Please log in again to complete this action",
  }

  return errorMessages[errorCode] || "An error occurred. Please try again"
}

/**
 * Check if email is already registered
 * @param email - Email to check
 * @returns True if email exists
 */
export const checkEmailExists = async (email: string): Promise<boolean> => {
  const user = await getUserByEmail(email)
  return user !== null
}
