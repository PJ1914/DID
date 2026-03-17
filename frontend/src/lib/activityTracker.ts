// Activity Tracker for Institute Dashboard
// Tracks certificate issuance, revocation, and verification actions

interface ActivityRecord {
  id: string
  type: "issued" | "revoked" | "verified"
  title: string
  description: string
  holder: string
  certificateHash?: string
  timestamp: string
  issuer: string // Institute address that performed the action
}

const STORAGE_KEY = "bc-cvs-institute-activity"
const MAX_ACTIVITIES = 50 // Limit to prevent localStorage overflow

export function saveActivity(
  issuer: string,
  type: "issued" | "revoked" | "verified",
  holder: string,
  description: string,
  certificateHash?: string
) {
  try {
    const activities = getActivities(issuer)
    
    const newActivity: ActivityRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title: type === "issued" 
        ? "Certificate Issued" 
        : type === "revoked" 
        ? "Certificate Revoked" 
        : "Certificate Verified",
      description,
      holder: `${holder.slice(0, 6)}...${holder.slice(-4)}`,
      certificateHash,
      timestamp: new Date().toISOString(),
      issuer,
    }

    // Add to beginning (newest first)
    activities.unshift(newActivity)

    // Keep only MAX_ACTIVITIES
    const trimmed = activities.slice(0, MAX_ACTIVITIES)

    localStorage.setItem(`${STORAGE_KEY}-${issuer}`, JSON.stringify(trimmed))
  } catch (error) {
    console.error("Error saving activity:", error)
  }
}

export function getActivities(issuer: string): ActivityRecord[] {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${issuer}`)
    if (!stored) return []

    const activities = JSON.parse(stored) as ActivityRecord[]
    return Array.isArray(activities) ? activities : []
  } catch (error) {
    console.error("Error getting activities:", error)
    return []
  }
}

export function getRecentActivities(issuer: string, limit: number = 10): ActivityRecord[] {
  const activities = getActivities(issuer)
  return activities.slice(0, limit)
}

export function getActivityStats(issuer: string) {
  const activities = getActivities(issuer)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  return {
    total: activities.length,
    today: activities.filter(a => new Date(a.timestamp) >= today).length,
    thisWeek: activities.filter(a => new Date(a.timestamp) >= thisWeek).length,
    thisMonth: activities.filter(a => new Date(a.timestamp) >= thisMonth).length,
    byType: {
      issued: activities.filter(a => a.type === "issued").length,
      revoked: activities.filter(a => a.type === "revoked").length,
      verified: activities.filter(a => a.type === "verified").length,
    },
  }
}

export function clearActivities(issuer: string) {
  try {
    localStorage.removeItem(`${STORAGE_KEY}-${issuer}`)
  } catch (error) {
    console.error("Error clearing activities:", error)
  }
}

export function formatActivityTime(timestamp: string): string {
  const now = new Date()
  const activityTime = new Date(timestamp)
  const diffMs = now.getTime() - activityTime.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  return activityTime.toLocaleDateString()
}
