// Verification history management using localStorage

export interface VerificationRecord {
  id: string
  certificateHash: string
  holder: string
  issuer: string
  metadata: string
  timestamp: string // ISO string
  status: "valid" | "invalid" | "revoked" | "not-found"
  verificationMethod: "single" | "bulk"
  issuedAt?: string // ISO string
}

const HISTORY_KEY = "bc-cvs-verification-history"
const MAX_HISTORY_ITEMS = 100 // Limit to prevent localStorage overflow

export function saveVerification(record: Omit<VerificationRecord, "id" | "timestamp">): void {
  try {
    const history = getVerificationHistory()
    
    const newRecord: VerificationRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    }
    
    // Add to beginning and limit total items
    const updatedHistory = [newRecord, ...history].slice(0, MAX_HISTORY_ITEMS)
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory))
  } catch (error) {
    console.error("Failed to save verification to history:", error)
  }
}

export function getVerificationHistory(): VerificationRecord[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    if (!stored) return []
    
    const history = JSON.parse(stored)
    return Array.isArray(history) ? history : []
  } catch (error) {
    console.error("Failed to load verification history:", error)
    return []
  }
}

export function clearVerificationHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch (error) {
    console.error("Failed to clear verification history:", error)
  }
}

export function getVerificationStats() {
  const history = getVerificationHistory()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todayVerifications = history.filter(
    (record) => new Date(record.timestamp) >= today
  )
  
  return {
    total: history.length,
    verifiedToday: todayVerifications.length,
    valid: history.filter((r) => r.status === "valid").length,
    invalid: history.filter((r) => r.status === "invalid" || r.status === "not-found").length,
    revoked: history.filter((r) => r.status === "revoked").length,
    bulkVerifications: history.filter((r) => r.verificationMethod === "bulk").length,
  }
}
