export enum IdentityStatus {
    Pending = 0,
    Active = 1,
    Suspended = 2,
    Revoked = 3
}

export type IdentityProfile = {
    id: string;
    owner: `0x${string}`;
    metadataURI: string;
    status: IdentityStatus;
    trustScore: number;
    createdAt: number;
    updatedAt: number;
};

export type IdentityActivity = {
    id: string;
    tag: string;
    actor: `0x${string}`;
    timestamp: number;
    contentHash: string;
};
