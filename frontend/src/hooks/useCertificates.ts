import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getContractAddress } from '@/config/contracts';
import { CERTIFICATE_MANAGER_ABI } from '@/config/abis';
import { useAccount } from 'wagmi';

export function useCertificates(userAddress?: `0x${string}`) {
  const { address, chainId } = useAccount();
  const targetAddress = userAddress || address;

  // Get user certificates
  const { data: certIds, isLoading, refetch } = useReadContract({
    address: chainId ? getContractAddress(chainId, 'organizationManager') as `0x${string}` : undefined,
    abi: CERTIFICATE_MANAGER_ABI,
    functionName: 'getUserCertificates',
    args: targetAddress ? [targetAddress] : undefined,
    query: {
      enabled: !!targetAddress && !!chainId,
    },
  });

  // Issue certificate
  const { writeContract: issue, data: issueHash } = useWriteContract();
  
  const { isLoading: isIssuing, isSuccess: isIssued } = useWaitForTransactionReceipt({
    hash: issueHash,
  });

  const issueCertificate = async (recipient: `0x${string}`, title: string, metadataURI: string) => {
    if (!chainId) throw new Error('No chain ID');
    
    issue({
      address: getContractAddress(chainId, 'organizationManager') as `0x${string}`,
      abi: CERTIFICATE_MANAGER_ABI,
      functionName: 'issueCertificate',
      args: [recipient, title, metadataURI],
    });
  };

  return {
    certificateIds: certIds,
    isLoading,
    refetch,
    issueCertificate,
    isIssuing,
    isIssued,
  };
}

// Hook to get single certificate details
export function useCertificate(certId?: bigint) {
  const { chainId } = useAccount();

  const { data: certificate, isLoading } = useReadContract({
    address: chainId ? getContractAddress(chainId, 'organizationManager') as `0x${string}` : undefined,
    abi: CERTIFICATE_MANAGER_ABI,
    functionName: 'getCertificate',
    args: certId !== undefined ? [certId] : undefined,
    query: {
      enabled: !!chainId && certId !== undefined,
    },
  });

  return {
    certificate,
    isLoading,
  };
}
