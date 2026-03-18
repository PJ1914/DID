// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library Roles {
    // Legacy DID System Roles
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

    // Sajjan Specific Roles (as per PPT Architecture)
    /// @dev Administrator - Full system control
    bytes32 public constant ADMINISTRATOR = keccak256("ADMINISTRATOR");

    /// @dev Validator Institution - Can vote on new institution proposals
    bytes32 public constant VALIDATOR_INSTITUTION =
        keccak256("VALIDATOR_INSTITUTION");

    /// @dev Certificate Issuer - Can issue and revoke certificates
    bytes32 public constant CERTIFICATE_ISSUER =
        keccak256("CERTIFICATE_ISSUER");

    /// @dev Certificate Holder - Student who holds certificates
    bytes32 public constant CERTIFICATE_HOLDER =
        keccak256("CERTIFICATE_HOLDER");

    /// @dev Verifier - Employer/third-party who verifies certificates
    bytes32 public constant VERIFIER = keccak256("VERIFIER");

    /// @dev Bloom Filter Manager - Can update bloom filter (system role)
    bytes32 public constant BLOOM_FILTER_MANAGER =
        keccak256("BLOOM_FILTER_MANAGER");
}
