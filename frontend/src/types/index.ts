export interface IdentityProfile {
    id: string
    owner: string
    metadataURI: string
    status: IdentityStatus
    trustScore: number
    createdAt: number
    updatedAt: number
}

export enum IdentityStatus {
    Pending = 0,
    Active = 1,
    Suspended = 2,
    Revoked = 3,
}

export interface TrustScoreEvent {
    identityId: string
    delta: number
    newScore: number
    reason: string
    timestamp: number
    blockNumber: number
    transactionHash: string
}

export interface VerificationRecord {
    id: string
    identityId: string
    provider: string
    templateId: string
    status: VerificationStatus
    evidenceURI: string
    createdAt: number
    expiresAt: number
}

export enum VerificationStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Expired = 3,
}

export interface VerificationProvider {
    address: string
    name: string
    metadataURI: string
    active: boolean
    addedAt: number
}

export interface Organization {
    id: string
    admin: string
    name: string
    metadataURI: string
    status: OrganizationStatus
    createdAt: number
    updatedAt: number
}

export enum OrganizationStatus {
    Pending = 0,
    Active = 1,
    Suspended = 2,
}

export interface Certificate {
    tokenId: number
    organizationId: string
    identityId: string
    issuedBy: string
    recipient: string
    metadataURI: string
    issuedAt: number
    revoked: boolean
}

export interface WalletConfig {
    walletAddress: string
    owner: string
    walletType: WalletType
    status: WalletStatus
    createdAt: number
    lastUsed: number
    salt: string
    nonce: number
    isDeployed: boolean
    trustScoreThreshold: number
    signers: string[]
    signatureThreshold: number
    dailySpendingLimit: number
    spentToday: number
    lastResetDay: number
}

export enum WalletType {
    Basic = 0,
    Guardian = 1,
    MultiSig = 2,
    TrustBased = 3,
}

export enum WalletStatus {
    Active = 0,
    Locked = 1,
    Recovering = 2,
    Deprecated = 3,
}

export interface RecoveryDetails {
    id: number
    wallet: string
    currentOwner: string
    newOwner: string
    initiator: string
    requestedAt: number
    executeAfter: number
    confirmations: number
    totalGuardians: number
    status: RecoveryStatus
}

export enum RecoveryStatus {
    Pending = 0,
    Executed = 1,
    Cancelled = 2,
}

export interface SessionKeyConfig {
    active: boolean
    validUntil: number
    spendingLimit: number
    spent: number
    allowedFunctions: string[]
    allowedContracts: string[]
}

export interface ProofTypeInfo {
    name: string
    verifier: string
    active: boolean
}

export interface ZKProof {
    a: [string, string]
    b: [[string, string], [string, string]]
    c: [string, string]
}

export interface TransactionState {
    hash?: string
    status: 'idle' | 'preparing' | 'pending' | 'success' | 'error'
    error?: string
    confirmations?: number
}

export interface ContractAddresses {
    identityRegistry: string
    trustScore: string
    verificationLogger: string
    verificationManager: string
    zkProofManager: string
    organizationManager: string
    certificateManager: string
    aaWalletManager: string
    guardianManager: string
    recoveryManager: string
    sessionKeyManager: string
    alchemyGasManager: string
}

export interface NetworkConfig {
    chainId: number
    name: string
    rpcUrl: string
    blockExplorer: string
    contracts: ContractAddresses
}

export interface UserSettings {
    theme: 'light' | 'dark' | 'system'
    notifications: {
        transactions: boolean
        verifications: boolean
        certificates: boolean
        recovery: boolean
    }
    privacy: {
        showAddress: boolean
        showTrustScore: boolean
    }
}

export interface DashboardStats {
    totalIdentities: number
    totalVerifications: number
    totalCertificates: number
    totalOrganizations: number
    averageTrustScore: number
    recentActivity: ActivityItem[]
}

export interface ActivityItem {
    id: string
    type: 'identity' | 'verification' | 'certificate' | 'recovery' | 'organization'
    title: string
    description: string
    timestamp: number
    status: 'success' | 'pending' | 'failed'
    txHash?: string
}