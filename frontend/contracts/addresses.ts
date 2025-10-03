// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
    // Ethereum Mainnet
    1: {
        identityRegistry: '0x...',
        trustScore: '0x...',
        verificationLogger: '0x...',
        verificationManager: '0x...',
        zkProofManager: '0x...',
        organizationManager: '0x...',
        certificateManager: '0x...',
        aaWalletManager: '0x...',
        guardianManager: '0x...',
        recoveryManager: '0x...',
        sessionKeyManager: '0x...',
        alchemyGasManager: '0x...',
    },
    // Sepolia Testnet
    11155111: {
        identityRegistry: '0x...',
        trustScore: '0x...',
        verificationLogger: '0x...',
        verificationManager: '0x...',
        zkProofManager: '0x...',
        organizationManager: '0x...',
        certificateManager: '0x...',
        aaWalletManager: '0x...',
        guardianManager: '0x...',
        recoveryManager: '0x...',
        sessionKeyManager: '0x...',
        alchemyGasManager: '0x...',
    },
    // Local development
    31337: {
        identityRegistry: '0x...',
        trustScore: '0x...',
        verificationLogger: '0x...',
        verificationManager: '0x...',
        zkProofManager: '0x...',
        organizationManager: '0x...',
        certificateManager: '0x...',
        aaWalletManager: '0x...',
        guardianManager: '0x...',
        recoveryManager: '0x...',
        sessionKeyManager: '0x...',
        alchemyGasManager: '0x...',
    },
} as const

export function getContractAddress(chainId: number, contractName: keyof typeof CONTRACT_ADDRESSES[1]): string {
    const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
    if (!addresses) {
        throw new Error(`Unsupported chain ID: ${chainId}`)
    }
    return addresses[contractName]
}