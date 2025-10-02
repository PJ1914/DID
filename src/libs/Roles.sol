// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library Roles {
    bytes32 public constant SYSTEM_ADMIN = keccak256("SYSTEM_ADMIN");
    bytes32 public constant TRUST_SCORE_UPDATER =
        keccak256("TRUST_SCORE_UPDATER");
    bytes32 public constant IDENTITY_ADMIN = keccak256("IDENTITY_ADMIN");
    bytes32 public constant VERIFICATION_PROVIDER =
        keccak256("VERIFICATION_PROVIDER");
    bytes32 public constant ORGANIZATION_ADMIN =
        keccak256("ORGANIZATION_ADMIN");
    bytes32 public constant ORGANIZATION_ISSUER =
        keccak256("ORGANIZATION_ISSUER");
}
