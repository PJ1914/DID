import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getAuth, Auth } from "firebase/auth"
import { getFirestore, Firestore } from "firebase/firestore"
import { getStorage, FirebaseStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ""
  
  // Check if using placeholder values
  if (
    !apiKey ||
    apiKey.includes("Dummy") ||
    apiKey.includes("Replace") ||
    apiKey.includes("your-") ||
    apiKey === "AIzaSyDummyKeyForDevelopment_Replace_Me"
  ) {
    console.warn("⚠️ Firebase not configured! Using placeholder credentials.")
    console.warn("📖 Follow setup guide: frontend/FIREBASE_SETUP.md")
    console.warn("🔗 Create project: https://console.firebase.google.com/")
    return false
  }
  
  return true
}

export const FIREBASE_ENABLED = isFirebaseConfigured()

// Initialize Firebase (singleton pattern) only if properly configured
let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

if (FIREBASE_ENABLED) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
}

// Export with null checks
export { auth, db, storage }
export default app
