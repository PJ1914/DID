import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/addresses';
import { IdentityRegistryABI } from '@/lib/abis';
import { Address } from 'viem';

export function useIdentityRegistry() {
    const { address } = useAccount();
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    // Read operations
    const { data: isRegistered } = useReadContract({
        address: CONTRACT_ADDRESSES.identityRegistry,
        abi: IdentityRegistryABI,
        functionName: 'isRegistered',
        args: address ? [address] : undefined,
    });

    const { data: identityData } = useReadContract({
        address: CONTRACT_ADDRESSES.identityRegistry,
        abi: IdentityRegistryABI,
        functionName: 'getIdentity',
        args: address ? [address] : undefined,
    });

    const { data: metadata } = useReadContract({
        address: CONTRACT_ADDRESSES.identityRegistry,
        abi: IdentityRegistryABI,
        functionName: 'getMetadata',
        args: address ? [address] : undefined,
    });

    const { data: isActive } = useReadContract({
        address: CONTRACT_ADDRESSES.identityRegistry,
        abi: IdentityRegistryABI,
        functionName: 'isActive',
        args: address ? [address] : undefined,
    });

    const { data: identityCount } = useReadContract({
        address: CONTRACT_ADDRESSES.identityRegistry,
        abi: IdentityRegistryABI,
        functionName: 'getIdentityCount',
    });

    // Write operations
    const registerIdentity = (identityHash: string, metadataURI: string) => {
        writeContract({
            address: CONTRACT_ADDRESSES.identityRegistry,
            abi: IdentityRegistryABI,
            functionName: 'registerIdentity',
            args: [identityHash, metadataURI],
        });
    };

    const updateMetadata = (metadataURI: string) => {
        writeContract({
            address: CONTRACT_ADDRESSES.identityRegistry,
            abi: IdentityRegistryABI,
            functionName: 'updateMetadata',
            args: [metadataURI],
        });
    };

    const revokeIdentity = (identityAddress: Address) => {
        writeContract({
            address: CONTRACT_ADDRESSES.identityRegistry,
            abi: IdentityRegistryABI,
            functionName: 'revokeIdentity',
            args: [identityAddress],
        });
    };

    const reactivateIdentity = (identityAddress: Address) => {
        writeContract({
            address: CONTRACT_ADDRESSES.identityRegistry,
            abi: IdentityRegistryABI,
            functionName: 'reactivateIdentity',
            args: [identityAddress],
        });
    };

    return {
        // State
        isRegistered,
        identityData,
        metadata,
        isActive,
        identityCount,

        // Actions
        registerIdentity,
        updateMetadata,
        revokeIdentity,
        reactivateIdentity,

        // Transaction state
        isPending,
        isConfirming,
        isSuccess,
        hash,
    };
}
