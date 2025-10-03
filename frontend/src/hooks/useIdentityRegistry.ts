import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { CONTRACT_ADDRESSES, getContractAddress } from '@/contracts/addresses'
import { IdentityRegistryABI } from '@/contracts/abis/IdentityRegistry.json'
import { useNetwork } from 'wagmi'
import type { IdentityProfile, IdentityStatus } from '@/types'

export function useIdentityRegistry() {
    const { chain } = useNetwork()
    const contractAddress = chain ? getContractAddress(chain.id, 'identityRegistry') : undefined

    const useRegisterIdentity = () => {
        const { config } = usePrepareContractWrite({
            address: contractAddress as `0x${string}`,
            abi: IdentityRegistryABI,
            functionName: 'registerIdentity',
        })
        return useContractWrite(config)
    }

    const useGetIdentity = (identityId?: string) => {
        return useContractRead({
            address: contractAddress as `0x${string}`,
            abi: IdentityRegistryABI,
            functionName: 'getIdentity',
            args: identityId ? [identityId] : undefined,
            enabled: !!identityId && !!contractAddress,
        })
    }

    const useResolveIdentity = (owner?: string) => {
        return useContractRead({
            address: contractAddress as `0x${string}`,
            abi: IdentityRegistryABI,
            functionName: 'resolveIdentity',
            args: owner ? [owner] : undefined,
            enabled: !!owner && !!contractAddress,
        })
    }

    const useUpdateMetadata = () => {
        const { config } = usePrepareContractWrite({
            address: contractAddress as `0x${string}`,
            abi: IdentityRegistryABI,
            functionName: 'updateMetadata',
        })
        return useContractWrite(config)
    }

    const useSetIdentityStatus = () => {
        const { config } = usePrepareContractWrite({
            address: contractAddress as `0x${string}`,
            abi: IdentityRegistryABI,
            functionName: 'setIdentityStatus',
        })
        return useContractWrite(config)
    }

    return {
        contractAddress,
        useRegisterIdentity,
        useGetIdentity,
        useResolveIdentity,
        useUpdateMetadata,
        useSetIdentityStatus,
    }
}