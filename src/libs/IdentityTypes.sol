// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library IdentityTypes {
    enum IdentityStatus {
        Pending,
        Active,
        Suspended,
        Revoked
    }

    struct IdentityProfile {
        address owner;
        string metadataURI;
        IdentityStatus status;
        uint64 createdAt;
        uint64 updatedAt;
        uint96 trustScore;
    }
}
