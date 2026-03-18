// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library OrganizationTypes {
    enum OrganizationStatus {
        Pending,
        Active,
        Suspended,
        Revoked
    }

    struct Organization {
        address admin;
        string name;
        string metadataURI;
        OrganizationStatus status;
        uint64 createdAt;
        uint64 updatedAt;
        uint96 trustScore;
    }
}
