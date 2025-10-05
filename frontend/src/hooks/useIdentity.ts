import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContractAddress } from '@/config/contracts';
import { IDENTITY_REGISTRY_ABI } from '@/config/abis';
import { useAccount } from 'wagmi';

export function useIdentity() {
  const { address, chainId } = useAccount();

  // Read identity data
  const { data: identity, isLoading, refetch } = useReadContract({
    address: chainId ? getContractAddress(chainId, 'identityRegistry') as `0x${string}` : undefined,
    abi: IDENTITY_REGISTRY_ABI,
    functionName: 'getIdentity',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!chainId,
    },
  });

  // Register identity
  const { writeContract: register, data: registerHash } = useWriteContract();
  
  const { isLoading: isRegistering, isSuccess: isRegistered } = useWaitForTransactionReceipt({
    hash: registerHash,
  });

  // Set metadata
  const { writeContract: setMetadata, data: metadataHash } = useWriteContract();
  
  const { isLoading: isSettingMetadata, isSuccess: isMetadataSet } = useWaitForTransactionReceipt({
    hash: metadataHash,
  });

  const registerIdentity = async (did: string) => {
    if (!chainId) throw new Error('No chain ID');
    
    register({
      address: getContractAddress(chainId, 'identityRegistry') as `0x${string}`,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: 'registerIdentity',
      args: [did],
    });
  };

  const updateMetadata = async (key: string, value: string) => {
    if (!chainId || !address) throw new Error('Not connected');
    
    setMetadata({
      address: getContractAddress(chainId, 'identityRegistry') as `0x${string}`,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: 'setMetadata',
      args: [address, key, value],
    });
  };

  return {
    identity,
    isLoading,
    refetch,
    registerIdentity,
    isRegistering,
    isRegistered,
    updateMetadata,
    isSettingMetadata,
    isMetadataSet,
  };
}
