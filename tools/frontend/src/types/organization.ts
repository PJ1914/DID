export enum OrganizationStatus {
    Pending = 0,
    Active = 1,
    Suspended = 2,
    Archived = 3
}

export type Organization = {
    id: string;
    admin: `0x${string}`;
    name: string;
    metadataURI: string;
    status: OrganizationStatus;
    createdAt: number;
    updatedAt: number;
};

export type OrganizationMember = {
    organizationId: string;
    address: `0x${string}`;
    roles: string[];
};
