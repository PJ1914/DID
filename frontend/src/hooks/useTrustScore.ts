import { useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi'
import { getContractAddress } from '@/contracts/addresses'
import { TrustScoreABI } from '@/contracts/abis/TrustScore.json'
import { useNetwork } from 'wagmi'
import type { TrustScoreEvent } from '@/types'

export function useTrustScore() {
    const { chain } = useNetwork()
    const contractAddress = chain ? getContractAddress(chain.id, 'trustScore') : undefined

    const useGetScore = (identityId?: string) => {
        return useContractRead({
            address: contractAddress as `0x${string}`,
            abi: TrustScoreABI,
            functionName: 'getScore',
            args: identityId ? [identityId] : undefined,
            enabled: !!identityId && !!contractAddress,
            watch: true, // Enable real-time updates
        })
    }

    const useIncreaseScore = () => {
        const { config } = usePrepareContractWrite({
            address: contractAddress as `0x${string}`,
            abi: TrustScoreABI,
            functionName: 'increaseScore',
        })
        return useContractWrite(config)
    }

    const useDecreaseScore = () => {
        const { config } = usePrepareContractWrite({
            address: contractAddress as `0x${string}`,
            abi: TrustScoreABI,
            functionName: 'decreaseScore',
        })
        return useContractWrite(config)
    }

    const useSetScore = () => {
        const { config } = usePrepareContractWrite({
            address: contractAddress as `0x${string}`,
            abi: TrustScoreABI,
            functionName: 'setScore',
        })
        return useContractWrite(config)
    }

    return {
        contractAddress,
        useGetScore,
        useIncreaseScore,
        useDecreaseScore,
        useSetScore,
    }
}