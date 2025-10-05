import { useReadContract, useWriteContract } from 'wagmi'
import { useChainId } from 'wagmi'
import { getContractAddress } from '@/contracts/addresses'
import type { TrustScoreEvent } from '@/types'

// Mock ABI for now - replace with actual ABI when available
const TrustScoreABI = [] as const

export function useTrustScore() {
    const chainId = useChainId()
    const contractAddress = chainId ? getContractAddress(chainId, 'trustScore') : undefined

    const useGetScore = (identityId?: string) => {
        return useReadContract({
            address: contractAddress as `0x${string}`,
            abi: TrustScoreABI,
            functionName: 'getScore',
            args: identityId ? [identityId] : undefined,
        })
    }

    const useIncreaseScore = () => {
        return useWriteContract()
    }

    const useDecreaseScore = () => {
        return useWriteContract()
    }

    const useSetScore = () => {
        return useWriteContract()
    }

    return {
        contractAddress,
        useGetScore,
        useIncreaseScore,
        useDecreaseScore,
        useSetScore,
    }
}