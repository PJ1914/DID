import { useReadContract, useWatchContractEvent } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/addresses';
import { VerificationLoggerABI } from '@/lib/abis';
import { Address } from 'viem';
import { useState, useEffect } from 'react';

export interface VerificationLog {
    user: Address;
    verificationType: string;
    success: boolean;
    timestamp: bigint;
    blockNumber: bigint;
}

export function useVerificationLogger() {
    const [recentLogs, setRecentLogs] = useState<VerificationLog[]>([]);

    // Read operations
    const { data: logCount } = useReadContract({
        address: CONTRACT_ADDRESSES.verificationLogger,
        abi: VerificationLoggerABI,
        functionName: 'getLogCount',
    });

    const { data: logs } = useReadContract({
        address: CONTRACT_ADDRESSES.verificationLogger,
        abi: VerificationLoggerABI,
        functionName: 'getLogs',
        args: [BigInt(0), logCount || BigInt(100)], // Get all logs or last 100
    });

    const getUserLogs = (userAddress: Address) => {
        return useReadContract({
            address: CONTRACT_ADDRESSES.verificationLogger,
            abi: VerificationLoggerABI,
            functionName: 'getUserLogs',
            args: [userAddress],
        });
    };

    const getLogsByType = (verificationType: string) => {
        return useReadContract({
            address: CONTRACT_ADDRESSES.verificationLogger,
            abi: VerificationLoggerABI,
            functionName: 'getLogsByType',
            args: [verificationType],
        });
    };

    const getSuccessCount = (userAddress: Address) => {
        return useReadContract({
            address: CONTRACT_ADDRESSES.verificationLogger,
            abi: VerificationLoggerABI,
            functionName: 'getSuccessCount',
            args: [userAddress],
        });
    };

    const getFailureCount = (userAddress: Address) => {
        return useReadContract({
            address: CONTRACT_ADDRESSES.verificationLogger,
            abi: VerificationLoggerABI,
            functionName: 'getFailureCount',
            args: [userAddress],
        });
    };

    // Watch for new verification events
    useWatchContractEvent({
        address: CONTRACT_ADDRESSES.verificationLogger,
        abi: VerificationLoggerABI,
        eventName: 'VerificationAttempt',
        onLogs(newLogs) {
            const formattedLogs = newLogs.map((log: any) => ({
                user: log.args.user as Address,
                verificationType: log.args.verificationType as string,
                success: log.args.success as boolean,
                timestamp: log.args.timestamp as bigint,
                blockNumber: log.blockNumber,
            }));
            setRecentLogs(prev => [...formattedLogs, ...prev].slice(0, 100)); // Keep last 100
        },
    });

    // Initialize recent logs from fetched data
    useEffect(() => {
        if (logs && Array.isArray(logs)) {
            setRecentLogs(logs.slice(-100).reverse()); // Get last 100 in reverse order
        }
    }, [logs]);

    return {
        // State
        logCount,
        logs,
        recentLogs,

        // Query helpers
        getUserLogs,
        getLogsByType,
        getSuccessCount,
        getFailureCount,
    };
}
