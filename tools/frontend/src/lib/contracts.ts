import { env } from './env';
import { deploymentConfig, parseCircuitFiles } from './deployment';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as const;

const resolveAddress = (value?: string | null, fallback?: `0x${string}`, label?: string): `0x${string}` => {
    const candidate = value && value.trim() ? (value.trim() as `0x${string}`) : fallback;
    if (!candidate) {
        if (label) {
            console.warn(`Missing contract address for ${label}. Falling back to zero address.`);
        }
        return ZERO_ADDRESS;
    }
    return candidate;
};

export const contracts = {
    identityRegistry: resolveAddress(
        env.NEXT_PUBLIC_IDENTITY_REGISTRY_ADDRESS,
        deploymentConfig.core?.identityRegistry,
        'IdentityRegistry'
    ),
    trustScore: resolveAddress(
        env.NEXT_PUBLIC_TRUST_SCORE_ADDRESS,
        deploymentConfig.core?.trustScore,
        'TrustScore'
    ),
    verificationManager: resolveAddress(
        env.NEXT_PUBLIC_VERIFICATION_MANAGER_ADDRESS,
        deploymentConfig.verification?.manager,
        'VerificationManager'
    ),
    zkProofManager: resolveAddress(
        env.NEXT_PUBLIC_ZK_PROOF_MANAGER_ADDRESS,
        deploymentConfig.zk?.manager,
        'ZKProofManager'
    ),
    verificationLogger: resolveAddress(
        env.NEXT_PUBLIC_VERIFICATION_LOGGER_ADDRESS,
        deploymentConfig.core?.verificationLogger,
        'VerificationLogger'
    ),
    organizationManager: resolveAddress(
        env.NEXT_PUBLIC_ORGANIZATION_MANAGER_ADDRESS,
        deploymentConfig.organizations?.manager,
        'OrganizationManager'
    )
} as const;

export const zkVerifiers = deploymentConfig.zk?.verifiers ?? {};
export const deployedNetwork = deploymentConfig.network;
export const circuitFiles = parseCircuitFiles(env.NEXT_PUBLIC_ZK_CIRCUIT_FILES);

const verifierCircuitMap: Record<string, string> = {
    age_gte: 'age_check',
    age_lte: 'age_max_check',
    attr_equals: 'attr_equals',
    income_gte: 'income_check'
};

export const resolveCircuitKey = (verifierKey: string): string => {
    return verifierCircuitMap[verifierKey] ?? verifierKey;
};
