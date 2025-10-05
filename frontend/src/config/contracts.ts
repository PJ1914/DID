// Contract addresses for Sepolia testnet
export const SEPOLIA_CHAIN_ID = 11155111;

export const CONTRACT_ADDRESSES = {
  [SEPOLIA_CHAIN_ID]: {
    // Core Contracts
    identityRegistry: "0xA8CF7e4431F686c14B24922Fd77c7712d8dB443d",
    verificationLogger: "0xC448566f13519081F95E8D4373d62C2ec026a65d",
    trustScore: "0xFA1d8AADfd0B0bDf95163639F92f98748CbA6EE2",
    
    // Verification
    verificationManager: "0x642CE985a191D7Db3c6b2244c1b7b1fBF7446aa4",
    zkProofManager: "0x955C277406bAFd63161883595a91A7c15FaFFE84",
    
    // Organizations & Certificates
    organizationManager: "0x3946DD79d8300462F50316AbA1089041Dc1C591C",
    
    // ZK Verifiers
    zkVerifiers: {
      ageGte: "0x39A9bBCA132f45a33a2a2cb32C8DA2D592A0218B",
      ageLte: "0x4B480879fE1F7dba559fE1993b30bF3C282A5155",
      attrEquals: "0x9aDBA6058349B63337242Be26Dd5eea39F865260",
      incomeGte: "0x7E0cbf9d54a08Ec31Ee6DD6c8e5343Bb62f33B19",
    },
  },
} as const;

export function getContractAddress(
  chainId: number,
  contractName: keyof typeof CONTRACT_ADDRESSES[typeof SEPOLIA_CHAIN_ID]
): string {
  const addresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
  if (!addresses) {
    throw new Error(`No contract addresses found for chain ID: ${chainId}`);
  }
  
  const address = addresses[contractName];
  if (!address) {
    throw new Error(`Contract ${contractName} not found for chain ID: ${chainId}`);
  }
  
  return address as string;
}

// Helper to get all addresses for current chain
export function getAllAddresses(chainId: number) {
  return CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES];
}
