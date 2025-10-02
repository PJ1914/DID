import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/lib/addresses';
import { ZKProofManagerABI } from '@/lib/abis';
import { Address } from 'viem';

export type ProofType = 'age_gte' | 'age_lte' | 'attr_equals' | 'income_gte';

export interface ZKProof {
    a: [bigint, bigint];
    b: [[bigint, bigint], [bigint, bigint]];
    c: [bigint, bigint];
    publicSignals: bigint[];
}

export function useZKProof() {
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

    // Read operations
    const { data: isVerifierRegistered } = useReadContract({
        address: CONTRACT_ADDRESSES.zkProofManager,
        abi: ZKProofManagerABI,
        functionName: 'isVerifierRegistered',
        args: ['age_gte'], // Default check
    });

    const getVerifierAddress = (proofType: ProofType) => {
        return useReadContract({
            address: CONTRACT_ADDRESSES.zkProofManager,
            abi: ZKProofManagerABI,
            functionName: 'getVerifier',
            args: [proofType],
        });
    };

    const isNullifierUsed = (nullifier: bigint) => {
        return useReadContract({
            address: CONTRACT_ADDRESSES.zkProofManager,
            abi: ZKProofManagerABI,
            functionName: 'isNullifierUsed',
            args: [nullifier],
        });
    };

    // Write operations
    const verifyProof = (
        proofType: ProofType,
        proof: ZKProof,
        nullifier: bigint
    ) => {
        writeContract({
            address: CONTRACT_ADDRESSES.zkProofManager,
            abi: ZKProofManagerABI,
            functionName: 'verifyProof',
            args: [
                proofType,
                proof.a,
                proof.b,
                proof.c,
                proof.publicSignals,
                nullifier,
            ],
        });
    };

    const verifyAgeGte = (proof: ZKProof, nullifier: bigint) => {
        verifyProof('age_gte', proof, nullifier);
    };

    const verifyAgeLte = (proof: ZKProof, nullifier: bigint) => {
        verifyProof('age_lte', proof, nullifier);
    };

    const verifyAttrEquals = (proof: ZKProof, nullifier: bigint) => {
        verifyProof('attr_equals', proof, nullifier);
    };

    const verifyIncomeGte = (proof: ZKProof, nullifier: bigint) => {
        verifyProof('income_gte', proof, nullifier);
    };

    return {
        // State
        isVerifierRegistered,

        // Query helpers
        getVerifierAddress,
        isNullifierUsed,

        // Actions
        verifyProof,
        verifyAgeGte,
        verifyAgeLte,
        verifyAttrEquals,
        verifyIncomeGte,

        // Transaction state
        isPending,
        isConfirming,
        isSuccess,
        hash,
    };
}
