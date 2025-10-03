// Contracts main export
export * from './abis';
export * from './addresses';

// Re-export key types and utilities
export type { ContractName } from './addresses';
export type { ContractABI } from './abis';

// Contract configuration object combining addresses and ABIs
export const getContractConfig = async (contractName: string) => {
    try {
        const { getContractAddress } = await import('./addresses');
        const { getContractABI } = await import('./abis');

        const address = getContractAddress(contractName as any);
        const abi = await getContractABI(contractName as any);

        return {
            address,
            abi,
        };
    } catch (error) {
        console.error(`Failed to get contract config for ${contractName}:`, error);
        throw error;
    }
};

// Validation helper
export const validateContractConfig = (config: { address: string; abi: any[] }) => {
    if (!config.address || !config.address.startsWith('0x') || config.address.length !== 42) {
        throw new Error('Invalid contract address');
    }

    if (!config.abi || !Array.isArray(config.abi) || config.abi.length === 0) {
        throw new Error('Invalid contract ABI');
    }

    return true;
};