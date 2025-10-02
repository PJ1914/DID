/**
 * Contract addresses for Sepolia testnet
 * Auto-generated from deployment.11155111.json
 */

export const SEPOLIA_CHAIN_ID = 11155111 as const;

export const CONTRACT_ADDRESSES = {
    // Core contracts
    verificationLogger: '0xC448566f13519081F95E8D4373d62C2ec026a65d' as const,
    trustScore: '0xFA1d8AADfd0B0bDf95163639F92f98748CbA6EE2' as const,
    identityRegistry: '0xA8CF7e4431F686c14B24922Fd77c7712d8dB443d' as const,

    // Verification
    verificationManager: '0x642CE985a191D7Db3c6b2244c1b7b1fBF7446aa4' as const,

    // Organizations
    organizationManager: '0x3946DD79d8300462F50316AbA1089041Dc1C591C' as const,

    // ZK
    zkProofManager: '0x955C277406bAFd63161883595a91A7c15FaFFE84' as const,
    zkVerifiers: {
        age_gte: '0x39A9bBCA132f45a33a2a2cb32C8DA2D592A0218B' as const,
        age_lte: '0x4B480879fE1F7dba559fE1993b30bF3C282A5155' as const,
        attr_equals: '0x9aDBA6058349B63337242Be26Dd5eea39F865260' as const,
        income_gte: '0x7E0cbf9d54a08Ec31Ee6DD6c8e5343Bb62f33B19' as const,
    },
} as const;

export type ContractName = keyof Omit<typeof CONTRACT_ADDRESSES, 'zkVerifiers'>;

// Deployer admin address
export const ADMIN_ADDRESS = '0x7cA2331B559Ab659AC7a4A7573fADD3DFB91f19c' as const;
