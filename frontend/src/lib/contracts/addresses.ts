// Auto-generated contract addresses
// Generated on: 2025-10-03T11:21:04.094Z

export const CONTRACT_ADDRESSES = {
  deployer: '0x7cA2331B559Ab659AC7a4A7573fADD3DFB91f19c' as const,
  VerificationLogger: '0xc448566f13519081f95e8d4373d62c2ec026a65d' as const,
  TrustScore: '0xfa1d8aadfd0b0bdf95163639f92f98748cba6ee2' as const,
  IdentityRegistry: '0xa8cf7e4431f686c14b24922fd77c7712d8db443d' as const,
  VerificationManager: '0x642ce985a191d7db3c6b2244c1b7b1fbf7446aa4' as const,
  OrganizationManager: '0x3946dd79d8300462f50316aba1089041dc1c591c' as const,
  LegacyGovernance: '0x20e9257e88412941ba3c1c40ae1b8aaa6bb3feec' as const,
  Groth16Verifier: '0x7e0cbf9d54a08ec31ee6dd6c8e5343bb62f33b19' as const,
  ZKProofManager: '0x955c277406bafd63161883595a91a7c15faffe84' as const,
} as const;

export type ContractName = keyof typeof CONTRACT_ADDRESSES;

// Sepolia testnet chain ID
export const CHAIN_ID = 11155111;

// Common contract name mappings
export const CONTRACTS = {
  // Core Identity Contracts
  UserIdentityRegistry: CONTRACT_ADDRESSES.UserIdentityRegistry || '',
  TrustScore: CONTRACT_ADDRESSES.TrustScore || '',
  VerificationLogger: CONTRACT_ADDRESSES.VerificationLogger || '',
  
  // Verification Managers
  VerificationManager: CONTRACT_ADDRESSES.VerificationManager || '',
  AadhaarVerificationManager: CONTRACT_ADDRESSES.AadhaarVerificationManager || '',
  FaceVerificationManager: CONTRACT_ADDRESSES.FaceVerificationManager || '',
  IncomeVerificationManager: CONTRACT_ADDRESSES.IncomeVerificationManager || '',
  OfflineVerificationManager: CONTRACT_ADDRESSES.OfflineVerificationManager || '',
  
  // Organizations
  OrganizationLogic: CONTRACT_ADDRESSES.OrganizationLogic || '',
  OrganizationRegistryProxy: CONTRACT_ADDRESSES.OrganizationRegistryProxy || '',
  OrganizationStorage: CONTRACT_ADDRESSES.OrganizationStorage || '',
  
  // Certificates
  CertificateManager: CONTRACT_ADDRESSES.CertificateManager || '',
  RecognitionManager: CONTRACT_ADDRESSES.RecognitionManager || '',
  
  // Account Abstraction
  IdentityAccountFactory: CONTRACT_ADDRESSES.IdentityAccountFactory || '',
  IdentityAccountDeployer: CONTRACT_ADDRESSES.IdentityAccountDeployer || '',
  IdentityModularAccount: CONTRACT_ADDRESSES.IdentityModularAccount || '',
  IdentityEntryPoint: CONTRACT_ADDRESSES.IdentityEntryPoint || '',
  
  // AA Modules
  SessionKeyModule: CONTRACT_ADDRESSES.SessionKeyModule || '',
  SubscriptionModule: CONTRACT_ADDRESSES.SubscriptionModule || '',
  BaseAccountModule: CONTRACT_ADDRESSES.BaseAccountModule || '',
  
  // AA Managers
  AAWalletManager: CONTRACT_ADDRESSES.AAWalletManager || '',
  SessionKeyManager: CONTRACT_ADDRESSES.SessionKeyManager || '',
  GuardianManager: CONTRACT_ADDRESSES.GuardianManager || '',
  RecoveryManager: CONTRACT_ADDRESSES.RecoveryManager || '',
  
  // Gas Management
  AlchemyGasManager: CONTRACT_ADDRESSES.AlchemyGasManager || '',
  PaymasterManager: CONTRACT_ADDRESSES.PaymasterManager || '',
  
  // ZK Proofs
  ZKProofManager: CONTRACT_ADDRESSES.ZKProofManager || '',
  
  // Governance & Migration
  DisputeResolution: CONTRACT_ADDRESSES.DisputeResolution || '',
  MigrationManager: CONTRACT_ADDRESSES.MigrationManager || '',
  
  // Stats & Interfaces
  WalletStatsManager: CONTRACT_ADDRESSES.WalletStatsManager || '',
  MobileVerificationInterface: CONTRACT_ADDRESSES.MobileVerificationInterface || '',
  
  // Registry
  ContractRegistry: CONTRACT_ADDRESSES.ContractRegistry || '',
} as const;

// Validation helper
export function validateContractAddress(contractName: string, address: string): boolean {
  return address && address.startsWith('0x') && address.length === 42;
}

// Get contract address with validation
export function getContractAddress(contractName: keyof typeof CONTRACTS): string {
  const address = CONTRACTS[contractName];
  if (!validateContractAddress(contractName, address)) {
    console.warn(`⚠️  Invalid or missing address for contract: ${contractName}`);
  }
  return address;
}
