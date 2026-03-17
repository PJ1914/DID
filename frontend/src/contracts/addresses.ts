export const contractAddresses = {
  // Sepolia Testnet
  11155111: {
    // Existing DID System Contracts
    identityRegistry: process.env.NEXT_PUBLIC_IDENTITY_REGISTRY || "0x",
    trustScore: process.env.NEXT_PUBLIC_TRUST_SCORE || "0x",
    verificationLogger: process.env.NEXT_PUBLIC_VERIFICATION_LOGGER || "0x",
    verificationManager: process.env.NEXT_PUBLIC_VERIFICATION_MANAGER || "0x",
    zkProofManager: process.env.NEXT_PUBLIC_ZK_PROOF_MANAGER || "0x",
    organizationManager: process.env.NEXT_PUBLIC_ORGANIZATION_MANAGER || "0x",
    certificateManager: process.env.NEXT_PUBLIC_CERTIFICATE_MANAGER || "0x",
    aaWalletManager: process.env.NEXT_PUBLIC_AA_WALLET_MANAGER || "0x",
    guardianManager: process.env.NEXT_PUBLIC_GUARDIAN_MANAGER || "0x",
    recoveryManager: process.env.NEXT_PUBLIC_RECOVERY_MANAGER || "0x",
    sessionKeyManager: process.env.NEXT_PUBLIC_SESSION_KEY_MANAGER || "0x",
    alchemyGasManager: process.env.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER || "0x",
    // Sajjan System Contracts
    bloomFilter: process.env.NEXT_PUBLIC_BLOOM_FILTER || "0x",
    revocationRegistry: process.env.NEXT_PUBLIC_REVOCATION_REGISTRY || "0x",
    validatorConsensus: process.env.NEXT_PUBLIC_VALIDATOR_CONSENSUS || "0x",
    certificateHashRegistry: process.env.NEXT_PUBLIC_CERTIFICATE_HASH_REGISTRY || "0x",
  },
  // Localhost Anvil
  31337: {
    // Existing DID System Contracts
    identityRegistry: process.env.NEXT_PUBLIC_IDENTITY_REGISTRY || "0x",
    trustScore: process.env.NEXT_PUBLIC_TRUST_SCORE || "0x",
    verificationLogger: process.env.NEXT_PUBLIC_VERIFICATION_LOGGER || "0x",
    verificationManager: process.env.NEXT_PUBLIC_VERIFICATION_MANAGER || "0x",
    zkProofManager: process.env.NEXT_PUBLIC_ZK_PROOF_MANAGER || "0x",
    organizationManager: process.env.NEXT_PUBLIC_ORGANIZATION_MANAGER || "0x",
    certificateManager: process.env.NEXT_PUBLIC_CERTIFICATE_MANAGER || "0x",
    aaWalletManager: process.env.NEXT_PUBLIC_AA_WALLET_MANAGER || "0x",
    guardianManager: process.env.NEXT_PUBLIC_GUARDIAN_MANAGER || "0x",
    recoveryManager: process.env.NEXT_PUBLIC_RECOVERY_MANAGER || "0x",
    sessionKeyManager: process.env.NEXT_PUBLIC_SESSION_KEY_MANAGER || "0x",
    alchemyGasManager: process.env.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER || "0x",
    // Sajjan System Contracts
    bloomFilter: process.env.NEXT_PUBLIC_BLOOM_FILTER || "0x",
    revocationRegistry: process.env.NEXT_PUBLIC_REVOCATION_REGISTRY || "0x",
    validatorConsensus: process.env.NEXT_PUBLIC_VALIDATOR_CONSENSUS || "0x",
    certificateHashRegistry: process.env.NEXT_PUBLIC_CERTIFICATE_HASH_REGISTRY || "0x",
  },
  // Localhost Ganache
  1337: {
    // Existing DID System Contracts
    identityRegistry: process.env.NEXT_PUBLIC_IDENTITY_REGISTRY || "0x",
    trustScore: process.env.NEXT_PUBLIC_TRUST_SCORE || "0x",
    verificationLogger: process.env.NEXT_PUBLIC_VERIFICATION_LOGGER || "0x",
    verificationManager: process.env.NEXT_PUBLIC_VERIFICATION_MANAGER || "0x",
    zkProofManager: process.env.NEXT_PUBLIC_ZK_PROOF_MANAGER || "0x",
    organizationManager: process.env.NEXT_PUBLIC_ORGANIZATION_MANAGER || "0x",
    certificateManager: process.env.NEXT_PUBLIC_CERTIFICATE_MANAGER || "0x",
    aaWalletManager: process.env.NEXT_PUBLIC_AA_WALLET_MANAGER || "0x",
    guardianManager: process.env.NEXT_PUBLIC_GUARDIAN_MANAGER || "0x",
    recoveryManager: process.env.NEXT_PUBLIC_RECOVERY_MANAGER || "0x",
    sessionKeyManager: process.env.NEXT_PUBLIC_SESSION_KEY_MANAGER || "0x",
    alchemyGasManager: process.env.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER || "0x",
    // Sajjan System Contracts
    bloomFilter: process.env.NEXT_PUBLIC_BLOOM_FILTER || "0x",
    revocationRegistry: process.env.NEXT_PUBLIC_REVOCATION_REGISTRY || "0x",
    validatorConsensus: process.env.NEXT_PUBLIC_VALIDATOR_CONSENSUS || "0x",
    certificateHashRegistry: process.env.NEXT_PUBLIC_CERTIFICATE_HASH_REGISTRY || "0x",
  },
} as const

export type SupportedChainId = keyof typeof contractAddresses

export function getContractAddress(
  chainId: SupportedChainId,
  contract: keyof (typeof contractAddresses)[SupportedChainId]
): `0x${string}` {
  const addresses = contractAddresses[chainId]
  if (!addresses) {
    console.warn(`Unsupported chain ID: ${chainId}. Returning zero address.`)
    return "0x0000000000000000000000000000000000000000"
  }
  return addresses[contract] as `0x${string}`
}
