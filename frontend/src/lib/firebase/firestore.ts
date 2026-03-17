import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore"
import { db, FIREBASE_ENABLED } from "./config"

// Collections
export const COLLECTIONS = {
  USERS: "users",
  CERTIFICATES: "certificates",
  OTP_CODES: "otp_codes",
  SESSIONS: "sessions",
  INSTITUTIONS: "institutions",
  VERIFICATION_LOGS: "verification_logs",
  NOTIFICATIONS: "notifications",
} as const

// Types
export interface FirebaseUser {
  id: string
  email: string
  walletAddress?: string
  role: "institute" | "student" | "verifier"
  name?: string
  institutionName?: string
  mfaEnabled: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Certificate {
  id: string
  blockchainHash: string
  studentName: string
  studentEmail: string
  studentWallet: string
  institutionName: string
  institutionWallet: string
  degree: string
  fieldOfStudy: string
  issueDate: Timestamp
  expiryDate?: Timestamp
  grade?: string
  certificatePdfUrl?: string
  certificateImageUrl?: string
  metadata: Record<string, any>
  isRevoked: boolean
  revokedAt?: Timestamp
  revokedReason?: string
  createdAt: Timestamp
}

export interface OTPCode {
  id: string
  userId: string
  email: string
  code: string
  expiresAt: Timestamp
  verified: boolean
  createdAt: Timestamp
}

// User operations
export const createUser = async (
  userId: string,
  userData: Omit<FirebaseUser, "id" | "createdAt" | "updatedAt">
) => {
  if (!FIREBASE_ENABLED || !db) {
    throw new Error("Firebase not configured")
  }
  
  // Filter out undefined values (Firestore doesn't accept them)
  const cleanData = Object.fromEntries(
    Object.entries(userData).filter(([_, value]) => value !== undefined)
  )
  
  const userRef = doc(db, COLLECTIONS.USERS, userId)
  await setDoc(userRef, {
    ...cleanData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const getUserById = async (userId: string): Promise<FirebaseUser | null> => {
  if (!FIREBASE_ENABLED || !db) {
    return null
  }
  const userRef = doc(db, COLLECTIONS.USERS, userId)
  const userSnap = await getDoc(userRef)
  return userSnap.exists() ? ({ id: userSnap.id, ...userSnap.data() } as FirebaseUser) : null
}

export const getUserByEmail = async (email: string): Promise<FirebaseUser | null> => {
  if (!FIREBASE_ENABLED || !db) {
    return null
  }
  const usersRef = collection(db, COLLECTIONS.USERS)
  const q = query(usersRef, where("email", "==", email), limit(1))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) return null

  const doc = querySnapshot.docs[0]
  return { id: doc.id, ...doc.data() } as FirebaseUser
}

export const getUserByWallet = async (walletAddress: string): Promise<FirebaseUser | null> => {
  if (!FIREBASE_ENABLED || !db) {
    return null
  }
  const usersRef = collection(db, COLLECTIONS.USERS)
  const q = query(usersRef, where("walletAddress", "==", walletAddress), limit(1))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) return null

  const doc = querySnapshot.docs[0]
  return { id: doc.id, ...doc.data() } as FirebaseUser
}

export const updateUser = async (userId: string, updates: Partial<FirebaseUser>) => {
  if (!FIREBASE_ENABLED || !db) {
    throw new Error("Firebase not configured")
  }
  const userRef = doc(db, COLLECTIONS.USERS, userId)
  await updateDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

// Certificate operations
export const createCertificate = async (certificateData: Omit<Certificate, "id" | "createdAt">) => {
  if (!FIREBASE_ENABLED || !db) {
    throw new Error("Firebase not configured")
  }
  const certificateRef = doc(collection(db, COLLECTIONS.CERTIFICATES))
  await setDoc(certificateRef, {
    ...certificateData,
    createdAt: serverTimestamp(),
  })
  return certificateRef.id
}

export const getCertificateByHash = async (blockchainHash: string): Promise<Certificate | null> => {
  if (!FIREBASE_ENABLED || !db) {
    return null
  }
  const certificatesRef = collection(db, COLLECTIONS.CERTIFICATES)
  const q = query(certificatesRef, where("blockchainHash", "==", blockchainHash), limit(1))
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) return null

  const doc = querySnapshot.docs[0]
  return { id: doc.id, ...doc.data() } as Certificate
}

export const getCertificatesByStudent = async (studentWallet: string): Promise<Certificate[]> => {
  if (!FIREBASE_ENABLED || !db) {
    return []
  }
  const certificatesRef = collection(db, COLLECTIONS.CERTIFICATES)
  const q = query(
    certificatesRef,
    where("studentWallet", "==", studentWallet),
    orderBy("issueDate", "desc")
  )
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Certificate))
}

export const getCertificatesByInstitution = async (
  institutionWallet: string
): Promise<Certificate[]> => {
  if (!FIREBASE_ENABLED || !db) {
    return []
  }
  const certificatesRef = collection(db, COLLECTIONS.CERTIFICATES)
  const q = query(
    certificatesRef,
    where("institutionWallet", "==", institutionWallet),
    orderBy("issueDate", "desc")
  )
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Certificate))
}

export const revokeCertificate = async (
  certificateId: string,
  reason: string
) => {
  if (!FIREBASE_ENABLED || !db) {
    throw new Error("Firebase not configured")
  }
  const certificateRef = doc(db, COLLECTIONS.CERTIFICATES, certificateId)
  await updateDoc(certificateRef, {
    isRevoked: true,
    revokedAt: serverTimestamp(),
    revokedReason: reason,
  })
}

// OTP operations
export const createOTPCode = async (otpData: Omit<OTPCode, "id" | "createdAt">) => {
  if (!FIREBASE_ENABLED || !db) {
    throw new Error("Firebase not configured")
  }
  const otpRef = doc(collection(db, COLLECTIONS.OTP_CODES))
  await setDoc(otpRef, {
    ...otpData,
    createdAt: serverTimestamp(),
  })
  return otpRef.id
}

export const getOTPByEmail = async (email: string): Promise<OTPCode | null> => {
  if (!FIREBASE_ENABLED || !db) {
    return null
  }
  const otpRef = collection(db, COLLECTIONS.OTP_CODES)
  
  // Simplified query without composite index requirement
  const q = query(
    otpRef,
    where("email", "==", email),
    where("verified", "==", false)
  )
  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) return null

  // Get the most recent OTP (sort in code instead of query)
  const otps = querySnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as OTPCode))
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())

  return otps[0] || null
}

export const verifyOTP = async (otpId: string) => {
  if (!FIREBASE_ENABLED || !db) {
    throw new Error("Firebase not configured")
  }
  const otpRef = doc(db, COLLECTIONS.OTP_CODES, otpId)
  await updateDoc(otpRef, {
    verified: true,
  })
}

export const deleteExpiredOTPs = async () => {
  if (!FIREBASE_ENABLED || !db) {
    return
  }
  const otpRef = collection(db, COLLECTIONS.OTP_CODES)
  const now = Timestamp.now()
  const q = query(otpRef, where("expiresAt", "<", now))
  const querySnapshot = await getDocs(q)

  const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref))
  await Promise.all(deletePromises)
}

// Verification logs
export interface VerificationLog {
  id: string
  certificateHash: string
  verifierWallet: string
  verifierName?: string
  result: "valid" | "invalid" | "revoked"
  timestamp: Timestamp
  ipAddress?: string
}

export interface VerificationNotification {
  id: string
  studentWallet: string
  certificateHash: string
  verifierWallet: string
  issuerWallet: string
  status: "valid" | "invalid" | "revoked" | "not-found"
  metadata?: string
  read: boolean
  createdAt: Timestamp
}

export const logVerification = async (logData: Omit<VerificationLog, "id">) => {
  if (!FIREBASE_ENABLED || !db) {
    return
  }
  const logRef = doc(collection(db, COLLECTIONS.VERIFICATION_LOGS))
  await setDoc(logRef, logData)
  return logRef.id
}

export const getVerificationLogs = async (certificateHash: string): Promise<VerificationLog[]> => {
  if (!FIREBASE_ENABLED || !db) {
    return []
  }
  const logsRef = collection(db, COLLECTIONS.VERIFICATION_LOGS)
  const q = query(
    logsRef,
    where("certificateHash", "==", certificateHash),
    orderBy("timestamp", "desc"),
    limit(50)
  )
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as VerificationLog))
}

export const createVerificationNotification = async (
  payload: Omit<VerificationNotification, "id" | "createdAt" | "read"> & { read?: boolean }
) => {
  if (!FIREBASE_ENABLED || !db) {
    return null
  }

  const notifRef = doc(collection(db, COLLECTIONS.NOTIFICATIONS))
  await setDoc(notifRef, {
    ...payload,
    read: payload.read ?? false,
    createdAt: serverTimestamp(),
  })

  return notifRef.id
}

export const subscribeToNotifications = (
  walletAddress: string,
  onData: (items: VerificationNotification[]) => void
): Unsubscribe => {
  if (!FIREBASE_ENABLED || !db || !walletAddress) {
    return () => undefined
  }

  const notifRef = collection(db, COLLECTIONS.NOTIFICATIONS)
  const q = query(
    notifRef,
    where("studentWallet", "==", walletAddress),
    limit(50)
  )

  return onSnapshot(q, (snap) => {
    const items = snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as VerificationNotification))
      .sort((a, b) => {
        const at = a.createdAt?.toMillis?.() ?? 0
        const bt = b.createdAt?.toMillis?.() ?? 0
        return bt - at
      })
    onData(items)
  })
}

export const markNotificationAsRead = async (notificationId: string) => {
  if (!FIREBASE_ENABLED || !db) {
    return
  }

  await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
    read: true,
  })
}
