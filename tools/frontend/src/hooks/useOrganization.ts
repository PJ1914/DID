import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, ADMIN_ADDRESS } from '@/lib/addresses';
import { OrganizationManagerABI } from '@/lib/abis';
import { Address } from 'viem';

export function useOrganization() {
    const { address } = useAccount();
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

    // Read operations
    const { data: organizationCount } = useReadContract({
        address: CONTRACT_ADDRESSES.organizationManager,
        abi: OrganizationManagerABI,
        functionName: 'getOrganizationCount',
    });

    const { data: userOrganizations } = useReadContract({
        address: CONTRACT_ADDRESSES.organizationManager,
        abi: OrganizationManagerABI,
        functionName: 'getUserOrganizations',
        args: address ? [address] : undefined,
    });

    const getOrganization = (orgId: bigint) => {
        return useReadContract({
            address: CONTRACT_ADDRESSES.organizationManager,
            abi: OrganizationManagerABI,
            functionName: 'getOrganization',
            args: [orgId],
        });
    };

    const isOrganizationActive = (orgId: bigint) => {
        return useReadContract({
            address: CONTRACT_ADDRESSES.organizationManager,
            abi: OrganizationManagerABI,
            functionName: 'isActive',
            args: [orgId],
        });
    };

    const hasRole = (orgId: bigint, userAddress: Address, role: string) => {
        return useReadContract({
            address: CONTRACT_ADDRESSES.organizationManager,
            abi: OrganizationManagerABI,
            functionName: 'hasRole',
            args: [orgId, userAddress, role],
        });
    };

    const getOrganizationMembers = (orgId: bigint) => {
        return useReadContract({
            address: CONTRACT_ADDRESSES.organizationManager,
            abi: OrganizationManagerABI,
            functionName: 'getMembers',
            args: [orgId],
        });
    };

    // Write operations
    const createOrganization = (name: string, metadataURI: string) => {
        writeContract({
            address: CONTRACT_ADDRESSES.organizationManager,
            abi: OrganizationManagerABI,
            functionName: 'createOrganization',
            args: [name, metadataURI],
        });
    };

    const addMember = (orgId: bigint, memberAddress: Address, role: string) => {
        writeContract({
            address: CONTRACT_ADDRESSES.organizationManager,
            abi: OrganizationManagerABI,
            functionName: 'addMember',
            args: [orgId, memberAddress, role],
        });
    };

    const removeMember = (orgId: bigint, memberAddress: Address) => {
        writeContract({
            address: CONTRACT_ADDRESSES.organizationManager,
            abi: OrganizationManagerABI,
            functionName: 'removeMember',
            args: [orgId, memberAddress],
        });
    };

    const updateOrganizationMetadata = (orgId: bigint, metadataURI: string) => {
        writeContract({
            address: CONTRACT_ADDRESSES.organizationManager,
            abi: OrganizationManagerABI,
            functionName: 'updateMetadata',
            args: [orgId, metadataURI],
        });
    };

    const deactivateOrganization = (orgId: bigint) => {
        writeContract({
            address: CONTRACT_ADDRESSES.organizationManager,
            abi: OrganizationManagerABI,
            functionName: 'deactivateOrganization',
            args: [orgId],
        });
    };

    const reactivateOrganization = (orgId: bigint) => {
        writeContract({
            address: CONTRACT_ADDRESSES.organizationManager,
            abi: OrganizationManagerABI,
            functionName: 'reactivateOrganization',
            args: [orgId],
        });
    };

    return {
        // State
        organizationCount,
        userOrganizations,
        isAdmin,

        // Query helpers
        getOrganization,
        isOrganizationActive,
        hasRole,
        getOrganizationMembers,

        // Actions
        createOrganization,
        addMember,
        removeMember,
        updateOrganizationMetadata,
        deactivateOrganization,
        reactivateOrganization,

        // Transaction state
        isPending,
        isConfirming,
        isSuccess,
        hash,
    };
}
