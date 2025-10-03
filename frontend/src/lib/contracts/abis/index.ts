// Contract ABIs Export
export { UserIdentityRegistryABI } from './UserIdentityRegistry';
export { TrustScoreABI } from './TrustScore';
export { VerificationManagerABI } from './VerificationManager';
export { CertificateManagerABI } from './CertificateManager';
export { GuardianManagerABI } from './GuardianManager';

// ABI type definitions
export type ContractABI = readonly any[];

// Contract ABI mapping
export const CONTRACT_ABIS = {
    UserIdentityRegistry: () => import('./UserIdentityRegistry').then(m => m.UserIdentityRegistryABI),
    TrustScore: () => import('./TrustScore').then(m => m.TrustScoreABI),
    VerificationManager: () => import('./VerificationManager').then(m => m.VerificationManagerABI),
    CertificateManager: () => import('./CertificateManager').then(m => m.CertificateManagerABI),
    GuardianManager: () => import('./GuardianManager').then(m => m.GuardianManagerABI),
} as const;

// Helper function to get ABI
export async function getContractABI(contractName: keyof typeof CONTRACT_ABIS): Promise<ContractABI> {
    const abiLoader = CONTRACT_ABIS[contractName];
    if (!abiLoader) {
        throw new Error(`ABI not found for contract: ${contractName}`);
    }
    return await abiLoader();
}