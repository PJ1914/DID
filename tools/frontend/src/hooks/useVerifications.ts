"use client";

import { useAccount, useWriteContract } from 'wagmi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPublicClient } from '@wagmi/core';
import type { Hex } from 'viem';
import { contracts } from '@/lib/contracts';
import { verificationManagerAbi } from '@/lib/abis';
import { wagmiConfig } from '@/lib/wagmi';
import { VerificationRecord, VerificationStatus } from '@/types/verification';
import { uploadJsonToIPFS } from '@/lib/ipfs';

const NULL_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';

const toVerificationRecord = (data: any): VerificationRecord => ({
    id: data.id,
    identityId: data.identityId,
    templateId: data.templateId,
    provider: data.provider,
    status: Number(data.status) as VerificationStatus,
    evidenceURI: data.evidenceURI,
    issuedAt: Number(data.issuedAt ?? 0),
    expiresAt: Number(data.expiresAt ?? 0)
});

export const useVerifications = (identityId?: string) => {
    const { address } = useAccount();
    const queryClient = useQueryClient();
    const writeContract = useWriteContract();

    const fetchVerifications = async (): Promise<VerificationRecord[]> => {
        if (!identityId || !contracts.verificationManager) return [];
        const publicClient = getPublicClient(wagmiConfig);

        const logs = await publicClient.getContractEvents({
            address: contracts.verificationManager,
            abi: verificationManagerAbi,
            eventName: 'VerificationRecorded',
            args: {
                identityId: identityId as Hex
            },
            fromBlock: 0n
        });

        type VerificationLog = typeof logs[number];

        const verificationIds = logs
            .map((log: VerificationLog) => log.args?.verificationId as Hex | undefined)
            .filter((id: Hex | undefined): id is Hex => Boolean(id) && id !== NULL_BYTES32);

        const uniqueVerificationIds = Array.from(new Set<Hex>(verificationIds));

        if (!uniqueVerificationIds.length) return [];

        const records = await Promise.all(
            uniqueVerificationIds.map(async (verificationId) => {
                const record = await publicClient.readContract({
                    address: contracts.verificationManager!,
                    abi: verificationManagerAbi,
                    functionName: 'getVerification',
                    args: [verificationId]
                });
                return toVerificationRecord(record);
            })
        );

        return records.sort((a, b) => b.issuedAt - a.issuedAt);
    };

    const verificationsQuery = useQuery({
        queryKey: ['verifications', identityId],
        queryFn: fetchVerifications,
        enabled: Boolean(identityId && contracts.verificationManager)
    });

    const recordVerificationMutation = useMutation({
        mutationFn: async ({
            identityId: targetIdentityId,
            templateId,
            metadata,
            expiresAt
        }: {
            identityId: string;
            templateId: string;
            metadata: Record<string, unknown>;
            expiresAt: number;
        }) => {
            if (!address) throw new Error('Connect wallet to record verification');
            if (!contracts.verificationManager) throw new Error('Verification manager contract not configured');
            const { uri } = await uploadJsonToIPFS(metadata);
            const hash = await writeContract.writeContractAsync({
                address: contracts.verificationManager,
                abi: verificationManagerAbi,
                functionName: 'recordVerification',
                args: [targetIdentityId as Hex, templateId as Hex, uri, BigInt(expiresAt)]
            });
            return hash;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['verifications', identityId] });
        }
    });

    const setVerificationStatusMutation = useMutation({
        mutationFn: async ({ verificationId, status }: { verificationId: string; status: VerificationStatus }) => {
            if (!contracts.verificationManager) throw new Error('Verification manager contract not configured');
            const hash = await writeContract.writeContractAsync({
                address: contracts.verificationManager,
                abi: verificationManagerAbi,
                functionName: 'setVerificationStatus',
                args: [verificationId as Hex, status]
            });
            return hash;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['verifications', identityId] });
        }
    });

    return {
        verifications: verificationsQuery.data ?? [],
        isLoading: verificationsQuery.isLoading,
        refetch: verificationsQuery.refetch,
        recordVerification: recordVerificationMutation.mutateAsync,
        setVerificationStatus: setVerificationStatusMutation.mutateAsync
    };
};
