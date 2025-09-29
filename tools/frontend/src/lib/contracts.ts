import type { JsonRpcProvider, Network } from "ethers";

export interface DeploymentConfig {
    network: {
        chainId: number;
        name: string;
    };
    core: {
        verificationLogger: string;
        trustScore: string;
        userIdentityRegistry: string;
    };
    verification: Record<string, string>;
    organizations: Record<string, string>;
    identity: Record<string, string>;
    governance: Record<string, string>;
    zk: {
        manager: string;
        verifiers: Record<string, string>;
    };
}

export const identityRegistryAbi = [
    "function resolveIdentity(address owner) view returns (bytes32)",
    "function getIdentity(bytes32 identityId) view returns (tuple(address owner,string metadataURI,uint8 status,uint64 createdAt,uint64 updatedAt,uint96 trustScore))"
];

export const trustScoreAbi = [
    "function getScore(bytes32 identityId) view returns (uint256)"
];

export async function fetchDeploymentConfig(): Promise<DeploymentConfig> {
    const response = await fetch("/config/deployment.json", { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Unable to load deployment config (${response.status})`);
    }
    return (await response.json()) as DeploymentConfig;
}

export function formatAddress(address: string): string {
    if (!address) return "0x0";
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function ensureNetwork(provider: JsonRpcProvider, expectedChainId: number): Promise<void> {
    return provider.getNetwork().then((network: Network) => {
        if (Number(network.chainId) !== expectedChainId) {
            throw new Error(
                `Connected provider is on chain ${network.chainId}, expected ${expectedChainId}`
            );
        }
    });
}
