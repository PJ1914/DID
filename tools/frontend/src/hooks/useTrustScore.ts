"use client";

import { useQuery } from '@tanstack/react-query';
import { getPublicClient } from '@wagmi/core';
import type { Hex } from 'viem';
import { contracts } from '@/lib/contracts';
import { TrustScoreABI } from '@/lib/abis';
import { wagmiConfig } from '@/lib/wagmi';

export type TrustScoreEvent = {
    blockNumber: bigint;
    transactionHash: Hex;
    delta: bigint;
    newScore: bigint;
    reason: string;
    timestamp: number;
};

export const useTrustScoreHistory = (identityId?: string) => {
    return useQuery({
        queryKey: ['trustScoreHistory', identityId],
        queryFn: async (): Promise<TrustScoreEvent[]> => {
            if (!identityId || !contracts.trustScore) return [];
            const publicClient = getPublicClient(wagmiConfig);
            const logs = await publicClient.getContractEvents({
                address: contracts.trustScore,
                abi: TrustScoreABI,
                eventName: 'TrustScoreUpdated',
                args: {
                    identityId: identityId as Hex
                },
                fromBlock: 0n
            });

            const events = await Promise.all(
                logs.map(async (log): Promise<TrustScoreEvent> => {
                    const blockNumber = log.blockNumber ?? 0n;
                    const block = await publicClient.getBlock({ blockNumber });
                    return {
                        blockNumber,
                        transactionHash: log.transactionHash!,
                        delta: BigInt(log.args?.delta ?? 0n),
                        newScore: BigInt(log.args?.newScore ?? 0n),
                        reason: log.args?.reason ?? '',
                        timestamp: Number(block.timestamp)
                    } satisfies TrustScoreEvent;
                })
            );

            return events.sort((a: TrustScoreEvent, b: TrustScoreEvent) => Number(b.blockNumber - a.blockNumber));
        },
        enabled: Boolean(identityId && contracts.trustScore)
    });
};
