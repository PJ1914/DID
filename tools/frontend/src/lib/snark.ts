import type { Proof } from '@/types/zk';
import { env } from './env';

export type CircuitArtifacts = {
    wasmUrl: string;
    zkeyUrl: string;
    verificationKeyUrl: string;
};

type ProofGenerationResult = {
    proof: Proof;
    publicSignals: string[];
};

const circuitCache = new Map<string, CircuitArtifacts>();

const circuitConfig: Record<string, CircuitArtifacts> = {
    age_check: {
        wasmUrl: `${env.NEXT_PUBLIC_ZK_CIRCUITS_BASE_PATH}/age_check/circuit.wasm`,
        zkeyUrl: `${env.NEXT_PUBLIC_ZK_CIRCUITS_BASE_PATH}/age_check/circuit_final.zkey`,
        verificationKeyUrl: `${env.NEXT_PUBLIC_ZK_CIRCUITS_BASE_PATH}/age_check/verification_key.json`
    },
    age_max_check: {
        wasmUrl: `${env.NEXT_PUBLIC_ZK_CIRCUITS_BASE_PATH}/age_max_check/circuit.wasm`,
        zkeyUrl: `${env.NEXT_PUBLIC_ZK_CIRCUITS_BASE_PATH}/age_max_check/circuit_final.zkey`,
        verificationKeyUrl: `${env.NEXT_PUBLIC_ZK_CIRCUITS_BASE_PATH}/age_max_check/verification_key.json`
    },
    attr_equals: {
        wasmUrl: `${env.NEXT_PUBLIC_ZK_CIRCUITS_BASE_PATH}/attr_equals/circuit.wasm`,
        zkeyUrl: `${env.NEXT_PUBLIC_ZK_CIRCUITS_BASE_PATH}/attr_equals/circuit_final.zkey`,
        verificationKeyUrl: `${env.NEXT_PUBLIC_ZK_CIRCUITS_BASE_PATH}/attr_equals/verification_key.json`
    },
    income_check: {
        wasmUrl: `${env.NEXT_PUBLIC_ZK_CIRCUITS_BASE_PATH}/income_check/circuit.wasm`,
        zkeyUrl: `${env.NEXT_PUBLIC_ZK_CIRCUITS_BASE_PATH}/income_check/circuit_final.zkey`,
        verificationKeyUrl: `${env.NEXT_PUBLIC_ZK_CIRCUITS_BASE_PATH}/income_check/verification_key.json`
    }
};

const loadCircuitArtifacts = async (name: string) => {
    if (circuitCache.has(name)) {
        return circuitCache.get(name)!;
    }

    const config = circuitConfig[name];
    if (!config) {
        throw new Error(`Circuit configuration not found for ${name}`);
    }

    circuitCache.set(name, config);
    return config;
};

export const generateGroth16Proof = async (
    circuitName: keyof typeof circuitConfig,
    input: Record<string, unknown>
): Promise<ProofGenerationResult> => {
    if (typeof window === 'undefined') {
        throw new Error('Proof generation can only run in the browser');
    }

    const snarkjs = await import('snarkjs');
    const { wasmUrl, zkeyUrl } = await loadCircuitArtifacts(circuitName);
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmUrl, zkeyUrl);

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
        publicSignals
    };
};

export const verifyGroth16Proof = async (
    circuitName: keyof typeof circuitConfig,
    proof: Proof,
    publicSignals: string[]
): Promise<boolean> => {
    const snarkjs = await import('snarkjs');
    const { verificationKeyUrl } = await loadCircuitArtifacts(circuitName);
    const verificationKey = await fetch(verificationKeyUrl).then((res) => res.json());
    return snarkjs.groth16.verify(verificationKey, publicSignals, proof);
};
