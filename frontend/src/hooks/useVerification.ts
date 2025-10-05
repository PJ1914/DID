import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContractAddress } from '@/config/contracts';
import { VERIFICATION_MANAGER_ABI, VerificationType } from '@/config/abis';
import { useAccount } from 'wagmi';

export function useVerification() {
  const { address, chainId } = useAccount();

  // Read verification status
  const { data: verificationStatus, isLoading, refetch } = useReadContract({
    address: chainId ? getContractAddress(chainId, 'verificationManager') as `0x${string}` : undefined,
    abi: VERIFICATION_MANAGER_ABI,
    functionName: 'getVerificationStatus',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!chainId,
    },
  });

  // Submit verification
  const { writeContract: submit, data: submitHash } = useWriteContract();
  
  const { isLoading: isSubmitting, isSuccess: isSubmitted } = useWaitForTransactionReceipt({
    hash: submitHash,
  });

  const submitVerification = async (type: VerificationType, proofData: string) => {
    if (!chainId || !address) throw new Error('Not connected');
    
    submit({
      address: getContractAddress(chainId, 'verificationManager') as `0x${string}`,
      abi: VERIFICATION_MANAGER_ABI,
      functionName: 'submitVerification',
      args: [address, type, proofData],
    });
  };

  // Check specific verification type
  const { data: isEmailVerified } = useReadContract({
    address: chainId ? getContractAddress(chainId, 'verificationManager') as `0x${string}` : undefined,
    abi: VERIFICATION_MANAGER_ABI,
    functionName: 'isVerified',
    args: address ? [address, VerificationType.EMAIL] : undefined,
    query: {
      enabled: !!address && !!chainId,
    },
  });

  const { data: isPhoneVerified } = useReadContract({
    address: chainId ? getContractAddress(chainId, 'verificationManager') as `0x${string}` : undefined,
    abi: VERIFICATION_MANAGER_ABI,
    functionName: 'isVerified',
    args: address ? [address, VerificationType.PHONE] : undefined,
    query: {
      enabled: !!address && !!chainId,
    },
  });

  const { data: isIdentityVerified } = useReadContract({
    address: chainId ? getContractAddress(chainId, 'verificationManager') as `0x${string}` : undefined,
    abi: VERIFICATION_MANAGER_ABI,
    functionName: 'isVerified',
    args: address ? [address, VerificationType.IDENTITY] : undefined,
    query: {
      enabled: !!address && !!chainId,
    },
  });

  const { data: isIncomeVerified } = useReadContract({
    address: chainId ? getContractAddress(chainId, 'verificationManager') as `0x${string}` : undefined,
    abi: VERIFICATION_MANAGER_ABI,
    functionName: 'isVerified',
    args: address ? [address, VerificationType.INCOME] : undefined,
    query: {
      enabled: !!address && !!chainId,
    },
  });

  return {
    verificationStatus,
    isLoading,
    refetch,
    submitVerification,
    isSubmitting,
    isSubmitted,
    verifications: {
      email: isEmailVerified ?? false,
      phone: isPhoneVerified ?? false,
      identity: isIdentityVerified ?? false,
      income: isIncomeVerified ?? false,
    },
  };
}
