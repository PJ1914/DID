"use client";

import { useAccount, useWriteContract } from 'wagmi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPublicClient } from '@wagmi/core';
import { contracts } from '@/lib/contracts';
import { zkProofManagerAbi } from '@/lib/abis';
import { wagmiConfig } from '@/lib/wagmi';
import { Proof, ProofRequest, ProofType } from '@/types/zk';
import { generateProof } from '@/lib/zk';
import type { Hex } from 'viem';

const toContractProof = (proof: Proof) => ({
    a: [BigInt(proof.a[0]), BigInt(proof.a[1])] as const,
    b: [
        [BigInt(proof.b[0][0]), BigInt(proof.b[0][1])] as const,
        [BigInt(proof.b[1][0]), BigInt(proof.b[1][1])] as const
    ] as const,
    c: [BigInt(proof.c[0]), BigInt(proof.c[1])] as const
});

const mapProofType = (id: number, data: any): ProofType => ({
    id,
    name: data.name,
    verifier: data.verifier,
    active: Boolean(data.active)
});

export const useZkProofs = () => {
    const { address } = useAccount();
    const queryClient = useQueryClient();
    const writeContract = useWriteContract();

    const proofTypesQuery = useQuery({
        queryKey: ['zk-proof-types'],
        queryFn: async (): Promise<ProofType[]> => {
            if (!contracts.zkProofManager) return [];
            const publicClient = getPublicClient(wagmiConfig);
            const list = await publicClient.readContract({
                address: contracts.zkProofManager,
                abi: zkProofManagerAbi,
                functionName: 'getAllProofTypes',
                args: []
            });

            if (!Array.isArray(list)) return [];

            return list.map((item, index) => mapProofType(index, item));
        },
        enabled: Boolean(contracts.zkProofManager)
    });

    const generateProofMutation = useMutation({
        mutationFn: async (request: ProofRequest) => {
            return generateProof(request);
        }
    });

    const anchorRootMutation = useMutation({
        mutationFn: async ({ root }: { root: Hex }) => {
            if (!address) throw new Error('Connect wallet to anchor proof root');
            if (!contracts.zkProofManager) throw new Error('ZK proof manager contract not configured');
            const hash = await writeContract.writeContractAsync({
                address: contracts.zkProofManager,
                abi: zkProofManagerAbi,
                functionName: 'anchorRoot',
                args: [root]
            });
            return hash;
        }
    });

    const revokeRootMutation = useMutation({
        mutationFn: async ({ root }: { root: Hex }) => {
            if (!contracts.zkProofManager) throw new Error('ZK proof manager contract not configured');
            const hash = await writeContract.writeContractAsync({
                address: contracts.zkProofManager,
                abi: zkProofManagerAbi,
                functionName: 'revokeRoot',
                args: [root]
            });
            return hash;
        }
    });

    const verifyProofMutation = useMutation({
        mutationFn: async ({
            typeId,
            root,
            nullifier,
            proof,
            publicSignals
        }: {
            typeId: number;
            root: Hex;
            nullifier: Hex;
            proof: Proof;
            publicSignals: bigint[];
        }) => {
            if (!contracts.zkProofManager) throw new Error('ZK proof manager contract not configured');
            const hash = await writeContract.writeContractAsync({
                address: contracts.zkProofManager,
                abi: zkProofManagerAbi,
                functionName: 'verifyProof',
                args: [BigInt(typeId), root, nullifier, toContractProof(proof), publicSignals]
            });
            return hash;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['zk-proof-types'] });
        }
    });

    return {
        proofTypes: proofTypesQuery.data ?? [],
        isLoading: proofTypesQuery.isLoading,
        refetchProofTypes: proofTypesQuery.refetch,
        generateProof: generateProofMutation.mutateAsync,
        anchorRoot: anchorRootMutation.mutateAsync,
        revokeRoot: revokeRootMutation.mutateAsync,
        verifyProof: verifyProofMutation.mutateAsync
    };
};
