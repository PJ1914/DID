export const contractAddresses = {
  // Sepolia Testnet
  11155111: {
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
  },
  // Localhost
  31337: {
    identityRegistry: "0x",
    trustScore: "0x",
    verificationLogger: "0x",
    verificationManager: "0x",
    zkProofManager: "0x",
    organizationManager: "0x",
    certificateManager: "0x",
    aaWalletManager: "0x",
    guardianManager: "0x",
    recoveryManager: "0x",
    sessionKeyManager: "0x",
    alchemyGasManager: "0x",
  },
} as const

export type SupportedChainId = keyof typeof contractAddresses

export function getContractAddress(
  chainId: SupportedChainId,
  contract: keyof (typeof contractAddresses)[SupportedChainId]
): `0x${string}` {
  return contractAddresses[chainId][contract] as `0x${string}`
}
