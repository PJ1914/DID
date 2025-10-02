export enum VerificationStatus {
    Pending = 0,
    Approved = 1,
    Rejected = 2,
    Revoked = 3
}

export type VerificationRecord = {
    id: string;
    identityId: string;
    templateId: string;
    provider: `0x${string}`;
    status: VerificationStatus;
    evidenceURI: string;
    issuedAt: number;
    expiresAt: number;
};

export type VerificationTemplate = {
    id: string;
    name: string;
    description: string;
    schema: Array<{
        name: string;
        type: 'string' | 'number' | 'date' | 'file';
        required?: boolean;
        options?: string[];
    }>;
};

export type Provider = {
    address: `0x${string}`;
    name: string;
    metadataURI?: string;
    active: boolean;
    addedAt: number;
};
