import { env } from './env';
import type { Proof, ProofRequest } from '@/types/zk';

export type ProofGenerationResult = {
    proof: Proof;
    publicSignals: string[];
};

const coerceInput = (params: Record<string, unknown>): Record<string, unknown> => {
    return Object.entries(params).reduce<Record<string, unknown>>((acc, [key, value]) => {
        if (typeof value === 'bigint') {
            acc[key] = value.toString();
        } else if (Array.isArray(value)) {
            acc[key] = value.map((item) => (typeof item === 'bigint' ? item.toString() : item));
        } else {
            acc[key] = value;
        }
        return acc;
    }, {});
};

export const generateProof = async (request: ProofRequest): Promise<ProofGenerationResult> => {
    const { groth16 } = await import('snarkjs');
    const basePath = env.NEXT_PUBLIC_ZK_CIRCUITS_BASE_PATH ?? '/circuits';
    const circuitPath = `${basePath}/${request.circuit}`;
    const wasmPath = `${circuitPath}/circuit.wasm`;
    const zkeyPath = `${circuitPath}/circuit_final.zkey`;

    const input = coerceInput(request.params);
    const { proof, publicSignals } = await groth16.fullProve(input, wasmPath, zkeyPath);

    if (!Array.isArray(proof.pi_a) || proof.pi_a.length < 2) {
        throw new Error('Invalid proof structure: expected pi_a with at least two elements');
    }

    if (!Array.isArray(proof.pi_b) || proof.pi_b.length < 2 || !proof.pi_b.every(Array.isArray)) {
        throw new Error('Invalid proof structure: expected pi_b with at least two pairs');
    }

    if (!Array.isArray(proof.pi_c) || proof.pi_c.length < 2) {
        throw new Error('Invalid proof structure: expected pi_c with at least two elements');
    }

    const formattedProof: Proof = {
        a: [proof.pi_a[0], proof.pi_a[1]],
        b: [
            [proof.pi_b[0][0], proof.pi_b[0][1]],
            [proof.pi_b[1][0], proof.pi_b[1][1]]
        ],
        c: [proof.pi_c[0], proof.pi_c[1]]
    };

    return {
        proof: formattedProof,
        publicSignals: publicSignals.map((signal: unknown) => signal?.toString?.() ?? String(signal))
    };
};
