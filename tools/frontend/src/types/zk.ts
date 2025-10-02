export type Proof = {
    a: [string, string];
    b: [[string, string], [string, string]];
    c: [string, string];
};

export type ProofType = {
    id: number;
    name: string;
    verifier: `0x${string}`;
    active: boolean;
};

export type ProofRequest = {
    circuit: 'age_check' | 'age_max_check' | 'attr_equals' | 'income_check';
    params: Record<string, unknown>;
};
