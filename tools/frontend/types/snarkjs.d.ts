declare module 'snarkjs' {
    export namespace groth16 {
        function fullProve(
            input: Record<string, unknown>,
            wasmPath: string,
            zkeyPath: string
        ): Promise<{
            proof: {
                pi_a: string[];
                pi_b: string[][];
                pi_c: string[];
            };
            publicSignals: string[];
        }>;

        function verify(
            verificationKey: unknown,
            publicSignals: string[],
            proof: unknown
        ): Promise<boolean>;
    }
}
