"use client";

import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { getPublicClient } from '@wagmi/core';
import { useAccount, useWriteContract } from 'wagmi';
import type { Hex } from 'viem';
import { contracts } from '@/lib/contracts';
import { identityRegistryAbi, trustScoreAbi } from '@/lib/abis';
import { useIdentityStore } from '@/store/identity-store';
import { IdentityProfile, IdentityStatus } from '@/types/identity';
import { uploadJsonToIPFS } from '@/lib/ipfs';
import { wagmiConfig } from '@/lib/wagmi';
import { getStoredSmartWallet, resolveSmartWalletAddress } from '@/lib/smart-wallet';

const buildProfile = (identityId: string, data: any): IdentityProfile => ({
    id: identityId,
    owner: data.owner,
    metadataURI: data.metadataURI,
    status: Number(data.status) as IdentityStatus,
    trustScore: Number(data.trustScore ?? 0),
    createdAt: Number(data.createdAt ?? 0),
    updatedAt: Number(data.updatedAt ?? 0)
});

const waitForReceipt = async (hash: Hex) => {
    const publicClient = getPublicClient(wagmiConfig);
    return await publicClient.waitForTransactionReceipt({ hash });
};

export const useIdentity = () => {
    const { address } = useAccount();
    const queryClient = useQueryClient();
    const setIdentity = useIdentityStore((state) => state.setIdentity);

    const fetchIdentity = async (): Promise<IdentityProfile | undefined> => {
        if (!address) return undefined;
        const publicClient = getPublicClient(wagmiConfig);
        try {
            let lookupAddress = address;

            if (address) {
                const cachedSmartWallet = getStoredSmartWallet(address as `0x${string}`);
                if (cachedSmartWallet) {
                    lookupAddress = cachedSmartWallet;
                } else {
                    try {
                        const resolvedSmartWallet = await resolveSmartWalletAddress(address as `0x${string}`);
                        if (resolvedSmartWallet) {
                            lookupAddress = resolvedSmartWallet;
                        }
                    } catch (error) {
                        console.warn('Failed to resolve smart wallet address', error);
                    }
                }
            }

            const identityId = (await publicClient.readContract({
                address: contracts.identityRegistry,
                abi: identityRegistryAbi,
                functionName: 'resolveIdentity',
                args: [lookupAddress]
            })) as Hex;

            if (!identityId || identityId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
                setIdentity(undefined);
                return undefined;
            }

            const profileRaw = await publicClient.readContract({
                address: contracts.identityRegistry,
                abi: identityRegistryAbi,
                functionName: 'getIdentity',
                args: [identityId]
            });

            const profile = buildProfile(identityId, profileRaw);

            setIdentity(profile);
            return profile;
        } catch (error) {
            console.warn('Failed to fetch identity', error);
            setIdentity(undefined);
            return undefined;
        }
    };

    const identityQuery = useQuery({
        queryKey: ['identity', address],
        queryFn: fetchIdentity,
        enabled: Boolean(address)
    });

    const trustScoreQuery = useQuery({
        queryKey: ['trustScore', identityQuery.data?.id],
        queryFn: async () => {
            if (!identityQuery.data?.id) return 0;
            const publicClient = getPublicClient(wagmiConfig);
            const score = await publicClient.readContract({
                address: contracts.trustScore,
                abi: trustScoreAbi,
                functionName: 'getScore',
                args: [identityQuery.data.id as Hex]
            });
            return Number(score ?? 0);
        },
        enabled: Boolean(identityQuery.data?.id)
    });

    const writeContract = useWriteContract();

    const registerMutation = useMutation({
        mutationFn: async ({
            metadata,
            ownerAddress
        }: {
            metadata: Record<string, unknown>;
            ownerAddress?: `0x${string}`;
        }) => {
            const targetOwner = (ownerAddress ?? address) as `0x${string}` | undefined;
            if (!targetOwner) throw new Error('Connect wallet to register identity');
            const { uri } = await uploadJsonToIPFS(metadata);
            const hash = await writeContract.writeContractAsync({
                address: contracts.identityRegistry,
                abi: identityRegistryAbi,
                functionName: 'registerIdentity',
                args: [targetOwner, uri]
            });
            return hash;
        },
        onSuccess: async (hash: Hex) => {
            await waitForReceipt(hash);
            await queryClient.invalidateQueries({ queryKey: ['identity', address] });
        }
    });

    const updateMetadataMutation = useMutation({
        mutationFn: async ({ identityId, metadata }: { identityId: string; metadata: Record<string, unknown> }) => {
            const { uri } = await uploadJsonToIPFS(metadata);
            const hash = await writeContract.writeContractAsync({
                address: contracts.identityRegistry,
                abi: identityRegistryAbi,
                functionName: 'updateMetadata',
                args: [identityId as Hex, uri]
            });
            return hash;
        },
        onSuccess: async (hash: Hex) => {
            await waitForReceipt(hash);
            await queryClient.invalidateQueries({ queryKey: ['identity', address] });
        }
    });

    const setStatusMutation = useMutation({
        mutationFn: async ({ identityId, status }: { identityId: string; status: IdentityStatus }) => {
            const hash = await writeContract.writeContractAsync({
                address: contracts.identityRegistry,
                abi: identityRegistryAbi,
                functionName: 'setIdentityStatus',
                args: [identityId as Hex, status]
            });
            return hash;
        },
        onSuccess: async (hash: Hex) => {
            await waitForReceipt(hash);
            await queryClient.invalidateQueries({ queryKey: ['identity', address] });
        }
    });

    return {
        identity: identityQuery.data,
        trustScore: trustScoreQuery.data ?? identityQuery.data?.trustScore ?? 0,
        isLoading: identityQuery.isLoading,
        registerIdentity: registerMutation.mutateAsync,
        updateMetadata: updateMetadataMutation.mutateAsync,
        setStatus: setStatusMutation.mutateAsync,
        refetch: identityQuery.refetch
    };
};
