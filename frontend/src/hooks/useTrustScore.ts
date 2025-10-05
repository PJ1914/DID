import { useReadContract } from 'wagmi';
import { getContractAddress } from '@/config/contracts';
import { TRUST_SCORE_ABI } from '@/config/abis';
import { useAccount } from 'wagmi';

export function useTrustScore(userAddress?: `0x${string}`) {
  const { address, chainId } = useAccount();
  const targetAddress = userAddress || address;

  const { data: trustScore, isLoading, refetch } = useReadContract({
    address: chainId ? getContractAddress(chainId, 'trustScore') as `0x${string}` : undefined,
    abi: TRUST_SCORE_ABI,
    functionName: 'getTrustScore',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress && !!chainId,
    },
  });

  return {
    trustScore: trustScore ? Number(trustScore) : 0,
    isLoading,
    refetch,
  };
}
