// Shared certificate links management using localStorage

export interface SharedLink {
  id: string
  certificateHash: string
  certificateMetadata: string
  created: string // ISO string
  expiresAt: string // ISO string
  views: number
  shareUrl: string
  disclosureFields?: string[]
}

function getStorageKey(address: string): string {
  return `shared-links-${address}`
}

export function saveSharedLink(
  address: string,
  certificateHash: string,
  certificateMetadata: string,
  expirationDays: number,
  shareUrl: string,
  disclosureFields?: string[]
): SharedLink {
  try {
    const links = getSharedLinks(address)
    
    const newLink: SharedLink = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      certificateHash,
      certificateMetadata,
      created: new Date().toISOString(),
      expiresAt: new Date(Date.now() + expirationDays * 86400000).toISOString(),
      views: 0,
      shareUrl,
      disclosureFields,
    }
    
    const updatedLinks = [newLink, ...links]
    localStorage.setItem(getStorageKey(address), JSON.stringify(updatedLinks))
    
    return newLink
  } catch (error) {
    console.error('Failed to save shared link:', error)
    throw error
  }
}

export function getSharedLinks(address: string): SharedLink[] {
  try {
    const stored = localStorage.getItem(getStorageKey(address))
    if (!stored) return []
    
    const links = JSON.parse(stored)
    // Filter out expired links
    const now = new Date()
    const activeLinks = Array.isArray(links) 
      ? links.filter((link: SharedLink) => new Date(link.expiresAt) > now)
      : []
    
    // Save filtered list back
    if (activeLinks.length !== (links?.length || 0)) {
      localStorage.setItem(getStorageKey(address), JSON.stringify(activeLinks))
    }
    
    return activeLinks
  } catch (error) {
    console.error('Failed to load shared links:', error)
    return []
  }
}

export function revokeSharedLink(address: string, linkId: string): void {
  try {
    const links = getSharedLinks(address)
    const updatedLinks = links.filter(link => link.id !== linkId)
    localStorage.setItem(getStorageKey(address), JSON.stringify(updatedLinks))
  } catch (error) {
    console.error('Failed to revoke shared link:', error)
  }
}

export function incrementLinkViews(address: string, linkId: string): void {
  try {
    const links = getSharedLinks(address)
    const updatedLinks = links.map(link => 
      link.id === linkId 
        ? { ...link, views: link.views + 1 }
        : link
    )
    localStorage.setItem(getStorageKey(address), JSON.stringify(updatedLinks))
  } catch (error) {
    console.error('Failed to increment link views:', error)
  }
}
