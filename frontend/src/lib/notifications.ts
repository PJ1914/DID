import {
  createVerificationNotification,
  markNotificationAsRead,
  subscribeToNotifications,
  type VerificationNotification,
} from "@/lib/firebase/firestore"

const LOCAL_KEY_PREFIX = "sajjan-notifications-"

export type AppNotification = VerificationNotification & {
  id: string
}

function key(wallet: string): string {
  return `${LOCAL_KEY_PREFIX}${wallet.toLowerCase()}`
}

export function saveLocalNotification(wallet: string, notification: AppNotification): void {
  try {
    const existing = getLocalNotifications(wallet)
    existing.unshift(notification)
    localStorage.setItem(key(wallet), JSON.stringify(existing.slice(0, 200)))
  } catch (error) {
    console.error("Failed to save local notification:", error)
  }
}

export function getLocalNotifications(wallet: string): AppNotification[] {
  try {
    const raw = localStorage.getItem(key(wallet))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function pushVerificationNotification(payload: {
  studentWallet: string
  certificateHash: string
  verifierWallet: string
  issuerWallet: string
  status: "valid" | "invalid" | "revoked" | "not-found"
  metadata?: string
}): Promise<void> {
  await createVerificationNotification({
    studentWallet: payload.studentWallet,
    certificateHash: payload.certificateHash,
    verifierWallet: payload.verifierWallet,
    issuerWallet: payload.issuerWallet,
    status: payload.status,
    metadata: payload.metadata ?? "",
  })
}

export function listenToNotifications(
  wallet: string,
  onData: (items: AppNotification[]) => void
): () => void {
  return subscribeToNotifications(wallet, onData)
}

export async function markAsRead(notificationId: string): Promise<void> {
  await markNotificationAsRead(notificationId)
}
