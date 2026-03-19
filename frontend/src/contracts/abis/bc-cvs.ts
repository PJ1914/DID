/**
 * BC-CVS Contract ABIs
 * Using proper JSON ABI format for compatibility
 */

// CertificateHashRegistry Contract ABI
export const CertificateHashRegistryABI = [
  {
    name: 'certificateExists',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'certificateHash', type: 'bytes32' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'getTotalCertificates',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getCertificatesByIssuer',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'issuer', type: 'address' },
    ],
    outputs: [{ type: 'bytes32[]' }],
  },
  {
    name: 'getCertificatesByHolder',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'holder', type: 'address' },
    ],
    outputs: [{ type: 'bytes32[]' }],
  },
  {
    name: 'getCertificate',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'certificateHash', type: 'bytes32' },
    ],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'certificateHash', type: 'bytes32' },
          { name: 'rsaSignature', type: 'bytes' },
          { name: 'issuer', type: 'address' },
          { name: 'holder', type: 'address' },
          { name: 'issueDate', type: 'uint256' },
          { name: 'isValid', type: 'bool' },
          { name: 'metadata', type: 'string' },
        ],
      },
    ],
  },
  {
    name: 'hasRole',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'role', type: 'bytes32' },
      { name: 'account', type: 'address' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'isAuthorizedIssuer',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'issuer', type: 'address' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'issueCertificate',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'certificateHash', type: 'bytes32' },
      { name: 'rsaSignature', type: 'bytes' },
      { name: 'holder', type: 'address' },
      { name: 'metadata', type: 'string' },
    ],
    outputs: [],
  },
  {
    name: 'CertificateIssued',
    type: 'event',
    inputs: [
      { name: 'certificateHash', type: 'bytes32', indexed: true },
      { name: 'issuer', type: 'address', indexed: true },
      { name: 'holder', type: 'address', indexed: true },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
] as const

// ValidatorConsensus Contract ABI
export const ValidatorConsensusABI = [
  {
    name: 'getValidatorCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getProposalCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'isValidator',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'validator', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'proposeInstitution',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'institutionAddress', type: 'address' },
      { name: 'name', type: 'string' },
      { name: 'documentHash', type: 'bytes32' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'voteForInstitution',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'proposalId', type: 'uint256' }],
    outputs: [],
  },
] as const

// RevocationRegistry Contract ABI
export const RevocationRegistryABI = [
  {
    name: 'isRevoked',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'certificateHash', type: 'bytes32' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'getTotalRevocations',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getTotalCorrections',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getStatistics',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }, { type: 'uint256' }],
  },
] as const

// BloomFilter Contract ABI  
export const BloomFilterABI = [
  {
    name: 'check',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'certificateHash', type: 'bytes32' }],
    outputs: [{ type: 'bool' }],
  },
] as const

// Export all ABIs as a single object for easy imports
export const BC_CVS_ABIS = {
  CertificateHashRegistry: CertificateHashRegistryABI,
  ValidatorConsensus: ValidatorConsensusABI,
  RevocationRegistry: RevocationRegistryABI,
  BloomFilter: BloomFilterABI,
} as const

// Type helpers for TypeScript
export type CertificateData = {
  certificateHash: `0x${string}`
  rsaSignature: `0x${string}`
  issuer: `0x${string}`
  holder: `0x${string}`
  issuerPublicKey: `0x${string}`
  issuedAt: bigint
  isRevoked: boolean
  metadata: string
}

export type InstitutionProposal = {
  institutionAddress: `0x${string}`
  name: string
  documentHash: `0x${string}`
  proposer: `0x${string}`
  approvalCount: bigint
  totalValidatorsAtProposal: bigint
  proposedAt: bigint
  executed: boolean
  rejected: boolean
}

export type RevocationRecord = {
  certificateHash: `0x${string}`
  revoker: `0x${string}`
  reason: string
  timestamp: bigint
  replacementHash: `0x${string}`
}

export type CorrectionRecord = {
  originalHash: `0x${string}`
  replacementHash: `0x${string}`
  corrector: `0x${string}`
  reason: string
  timestamp: bigint
}
