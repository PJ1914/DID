import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, ADMIN_ADDRESS } from '@/lib/addresses';
import { VerificationManagerABI } from '@/lib/abis';
import { Address } from 'viem';

export function useVerificationManager() {
    const { address } = useAccount();
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

    // Read operations
    const { data: isVerified } = useReadContract({
        address: CONTRACT_ADDRESSES.verificationManager,
        abi: VerificationManagerABI,
        functionName: 'isVerified',
        args: address ? [address, 'email'] : undefined, // Default to email type
    });

    const { data: verificationStatus } = useReadContract({
        address: CONTRACT_ADDRESSES.verificationManager,
        abi: VerificationManagerABI,
        functionName: 'getVerificationStatus',
        args: address ? [address] : undefined,
    });

    const { data: verificationTypes } = useReadContract({
        address: CONTRACT_ADDRESSES.verificationManager,
        abi: VerificationManagerABI,
        functionName: 'getVerificationTypes',
        args: address ? [address] : undefined,
    });

    const { data: verificationLevel } = useReadContract({
        address: CONTRACT_ADDRESSES.verificationManager,
        abi: VerificationManagerABI,
        functionName: 'getVerificationLevel',
        args: address ? [address] : undefined,
    });

    const checkVerificationType = (userAddress: Address, verificationType: string) => {
        return useReadContract({
            address: CONTRACT_ADDRESSES.verificationManager,
            abi: VerificationManagerABI,
            functionName: 'isVerified',
            args: [userAddress, verificationType],
        });
    };

    // Write operations
    const submitVerification = (verificationType: string, proof: `0x${string}`) => {
        writeContract({
            address: CONTRACT_ADDRESSES.verificationManager,
            abi: VerificationManagerABI,
            functionName: 'submitVerification',
            args: [verificationType, proof],
        });
    };

    const approveVerification = (userAddress: Address, verificationType: string) => {
        if (!isAdmin) {
            throw new Error('Only admin can approve verifications');
        }
        writeContract({
            address: CONTRACT_ADDRESSES.verificationManager,
            abi: VerificationManagerABI,
            functionName: 'approveVerification',
            args: [userAddress, verificationType],
        });
    };

    const revokeVerification = (userAddress: Address, verificationType: string) => {
        if (!isAdmin) {
            throw new Error('Only admin can revoke verifications');
        }
        writeContract({
            address: CONTRACT_ADDRESSES.verificationManager,
            abi: VerificationManagerABI,
            functionName: 'revokeVerification',
            args: [userAddress, verificationType],
        });
    };

    const addVerificationType = (newType: string) => {
        if (!isAdmin) {
            throw new Error('Only admin can add verification types');
        }
        writeContract({
            address: CONTRACT_ADDRESSES.verificationManager,
            abi: VerificationManagerABI,
            functionName: 'addVerificationType',
            args: [newType],
        });
    };

    return {
        // State
        isVerified,
        verificationStatus,
        verificationTypes,
        verificationLevel,
        isAdmin,

        // Query helpers
        checkVerificationType,

        // Actions
        submitVerification,
        approveVerification,
        revokeVerification,
        addVerificationType,

        // Transaction state
        isPending,
        isConfirming,
        isSuccess,
        hash,
    };
}
