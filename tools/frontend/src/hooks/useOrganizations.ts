"use client";

import { useAccount, useWriteContract } from 'wagmi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPublicClient } from '@wagmi/core';
import type { Hex } from 'viem';
import { contracts } from '@/lib/contracts';
import { organizationManagerAbi } from '@/lib/abis';
import { wagmiConfig } from '@/lib/wagmi';
import { Organization, OrganizationStatus } from '@/types/organization';
import { uploadJsonToIPFS } from '@/lib/ipfs';

const mapOrganization = (id: string, data: any): Organization => ({
    id,
    admin: data.admin,
    name: data.name,
    metadataURI: data.metadataURI,
    status: Number(data.status) as OrganizationStatus,
    createdAt: Number(data.createdAt ?? 0),
    updatedAt: Number(data.updatedAt ?? 0)
});

export const useOrganizations = () => {
    const { address } = useAccount();
    const queryClient = useQueryClient();
    const writeContract = useWriteContract();

    const fetchOrganizations = async (): Promise<Organization[]> => {
        if (!contracts.organizationManager) return [];
        const publicClient = getPublicClient(wagmiConfig);
        const logs = await publicClient.getContractEvents({
            address: contracts.organizationManager,
            abi: organizationManagerAbi,
            eventName: 'OrganizationRegistered',
            fromBlock: 0n
        });

        type OrganizationLog = typeof logs[number];

        const organizationIds = Array.from(
            new Set(
                logs
                    .map((log: OrganizationLog) => log.args?.organizationId as Hex | undefined)
                    .filter((id: Hex | undefined): id is Hex => Boolean(id))
            )
        );

        if (!organizationIds.length) return [];

        const organizations = await Promise.all(
            organizationIds.map(async (organizationId) => {
                const data = await publicClient.readContract({
                    address: contracts.organizationManager!,
                    abi: organizationManagerAbi,
                    functionName: 'getOrganization',
                    args: [organizationId]
                });
                return mapOrganization(organizationId as string, data);
            })
        );

        return organizations.sort((a, b) => b.createdAt - a.createdAt);
    };

    const organizationsQuery = useQuery({
        queryKey: ['organizations'],
        queryFn: fetchOrganizations,
        enabled: Boolean(contracts.organizationManager)
    });

    const registerMutation = useMutation({
        mutationFn: async ({ name, metadata }: { name: string; metadata: Record<string, unknown> }) => {
            if (!address) throw new Error('Connect wallet to register organization');
            if (!contracts.organizationManager) throw new Error('Organization manager contract not configured');
            const { uri } = await uploadJsonToIPFS(metadata);
            const hash = await writeContract.writeContractAsync({
                address: contracts.organizationManager,
                abi: organizationManagerAbi,
                functionName: 'registerOrganization',
                args: [name, uri]
            });
            return hash;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['organizations'] });
        }
    });

    const updateMetadataMutation = useMutation({
        mutationFn: async ({ organizationId, metadata }: { organizationId: string; metadata: Record<string, unknown> }) => {
            if (!contracts.organizationManager) throw new Error('Organization manager contract not configured');
            const { uri } = await uploadJsonToIPFS(metadata);
            const hash = await writeContract.writeContractAsync({
                address: contracts.organizationManager,
                abi: organizationManagerAbi,
                functionName: 'updateOrganizationMetadata',
                args: [organizationId as Hex, uri]
            });
            return hash;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['organizations'] });
        }
    });

    const setStatusMutation = useMutation({
        mutationFn: async ({ organizationId, status }: { organizationId: string; status: OrganizationStatus }) => {
            if (!contracts.organizationManager) throw new Error('Organization manager contract not configured');
            const hash = await writeContract.writeContractAsync({
                address: contracts.organizationManager,
                abi: organizationManagerAbi,
                functionName: 'setOrganizationStatus',
                args: [organizationId as Hex, status]
            });
            return hash;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['organizations'] });
        }
    });

    return {
        organizations: organizationsQuery.data ?? [],
        isLoading: organizationsQuery.isLoading,
        refetch: organizationsQuery.refetch,
        registerOrganization: registerMutation.mutateAsync,
        updateOrganizationMetadata: updateMetadataMutation.mutateAsync,
        setOrganizationStatus: setStatusMutation.mutateAsync
    };
};
