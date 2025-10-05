export enum IdentityStatus {
  Pending = 0,
  Active = 1,
  Suspended = 2,
  Revoked = 3,
}

export enum OrganizationStatus {
  Pending = 0,
  Active = 1,
  Suspended = 2,
}

export enum VerificationStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Expired = 3,
}

export interface Identity {
  owner: `0x${string}`
  metadataURI: string
  status: IdentityStatus
  trustScore: number
  createdAt: number
  updatedAt: number
}

export interface TrustScoreHistory {
  identityId: string
  delta: bigint
  newScore: bigint
  reason: string
  timestamp: number
  blockNumber: bigint
  transactionHash: `0x${string}`
}

export interface Verification {
  id: string
  identityId: string
  templateId: string
  provider: `0x${string}`
  evidenceURI: string
  status: VerificationStatus
  createdAt: number
  expiresAt: number
}

export interface Organization {
  admin: `0x${string}`
  name: string
  metadataURI: string
  status: OrganizationStatus
  createdAt: number
  updatedAt: number
}

export interface Certificate {
  tokenId: bigint
  organizationId: string
  identityId: string
  issuedBy: `0x${string}`
  recipient: `0x${string}`
  metadataURI: string
  issuedAt: number
  revoked: boolean
}

export interface Guardian {
  address: `0x${string}`
  addedAt: number
}

export interface Recovery {
  id: bigint
  wallet: `0x${string}`
  currentOwner: `0x${string}`
  newOwner: `0x${string}`
  initiator: `0x${string}`
  requestedAt: number
  executeAfter: number
  confirmations: number
  totalGuardians: number
  status: "Pending" | "Executed" | "Cancelled"
}

export interface SessionKey {
  address: `0x${string}`
  validUntil: number
  spendingLimit: bigint
  spent: bigint
  active: boolean
  allowedFunctions: string[]
  allowedContracts: `0x${string}`[]
}
