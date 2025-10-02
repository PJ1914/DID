"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { ensureSmartWallet, getStoredSmartWallet, resolveSmartWalletAddress } from '@/lib/smart-wallet';
import { useIdentity } from './useIdentity';

export const useAutoSmartWallet = () => {
    const { address, isConnected } = useAccount();
    const { identity, isLoading, registerIdentity, refetch } = useIdentity();
    const [status, setStatus] = useState<'idle' | 'creating' | 'error' | 'complete'>('idle');
    const errorRef = useRef<Error | null>(null);

    const reset = useCallback(() => {
        setStatus('idle');
        errorRef.current = null;
    }, []);

    useEffect(() => {
        if (!isConnected || !address) {
            reset();
            return;
        }

        if (isLoading) return;
        if (identity || status === 'creating' || status === 'complete') return;

        let cancelled = false;

        const run = async () => {
            setStatus('creating');
            try {
                const smartWallet = await ensureSmartWallet(address as `0x${string}`);
                await registerIdentity({
                    ownerAddress: smartWallet,
                    metadata: {
                        createdBy: 'auto-smart-wallet',
                        smartWallet,
                        createdAt: new Date().toISOString()
                    }
                });
                if (!cancelled) {
                    setStatus('complete');
                    await refetch();
                }
            } catch (error) {
                console.error('Auto smart wallet registration failed', error);
                errorRef.current = error instanceof Error ? error : new Error('Unknown smart wallet error');
                if (!cancelled) {
                    setStatus('error');
                }
            }
        };

        const stored = getStoredSmartWallet(address as `0x${string}`);
        if (!stored) {
            resolveSmartWalletAddress(address as `0x${string}`).catch(() => null);
        }

        run();

        return () => {
            cancelled = true;
        };
    }, [address, identity, isConnected, isLoading, registerIdentity, refetch, reset, status]);

    return {
        status,
        error: errorRef.current
    };
};
