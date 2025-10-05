import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContractAddress } from '@/config/contracts';
import { ORGANIZATION_MANAGER_ABI } from '@/config/abis';
import { useAccount } from 'wagmi';

export function useOrganizations() {
  const { chainId } = useAccount();

  // Get all organizations
  const { data: orgIds, isLoading: isLoadingIds, refetch } = useReadContract({
    address: chainId ? getContractAddress(chainId, 'organizationManager') as `0x${string}` : undefined,
    abi: ORGANIZATION_MANAGER_ABI,
    functionName: 'getAllOrganizations',
    query: {
      enabled: !!chainId,
    },
  });

  // Create organization
  const { writeContract: create, data: createHash } = useWriteContract();
  
  const { isLoading: isCreating, isSuccess: isCreated } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  // Join organization
  const { writeContract: join, data: joinHash } = useWriteContract();
  
  const { isLoading: isJoining, isSuccess: isJoined } = useWaitForTransactionReceipt({
    hash: joinHash,
  });

  const createOrganization = async (name: string, orgType: string) => {
    if (!chainId) throw new Error('No chain ID');
    
    create({
      address: getContractAddress(chainId, 'organizationManager') as `0x${string}`,
      abi: ORGANIZATION_MANAGER_ABI,
      functionName: 'createOrganization',
      args: [name, orgType],
    });
  };

  const joinOrganization = async (orgId: bigint) => {
    if (!chainId) throw new Error('No chain ID');
    
    join({
      address: getContractAddress(chainId, 'organizationManager') as `0x${string}`,
      abi: ORGANIZATION_MANAGER_ABI,
      functionName: 'joinOrganization',
      args: [orgId],
    });
  };

  return {
    organizationIds: orgIds,
    isLoadingIds,
    refetch,
    createOrganization,
    isCreating,
    isCreated,
    joinOrganization,
    isJoining,
    isJoined,
  };
}

// Hook to get single organization details
export function useOrganization(orgId?: bigint) {
  const { chainId } = useAccount();

  const { data: organization, isLoading } = useReadContract({
    address: chainId ? getContractAddress(chainId, 'organizationManager') as `0x${string}` : undefined,
    abi: ORGANIZATION_MANAGER_ABI,
    functionName: 'getOrganization',
    args: orgId !== undefined ? [orgId] : undefined,
    query: {
      enabled: !!chainId && orgId !== undefined,
    },
  });

  return {
    organization,
    isLoading,
  };
}
