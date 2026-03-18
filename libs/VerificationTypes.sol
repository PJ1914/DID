// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library VerificationTypes {
    bytes32 internal constant TEMPLATE_EMAIL = keccak256("EMAIL");
    bytes32 internal constant TEMPLATE_AADHAAR = keccak256("AADHAAR");
    bytes32 internal constant TEMPLATE_FACE = keccak256("FACE");
    bytes32 internal constant TEMPLATE_INCOME = keccak256("INCOME");

    enum VerificationStatus {
        Pending,
        Approved,
        Rejected,
        Expired
    }

    struct Provider {
        string name;
        string metadataURI;
        bool active;
        uint64 addedAt;
    }

    struct VerificationRecord {
        bytes32 id;
        bytes32 identityId;
        bytes32 templateId;
        address provider;
        VerificationStatus status;
        string evidenceURI;
        uint64 issuedAt;
        uint64 expiresAt;
    }

    function emailTemplateId() internal pure returns (bytes32) {
        return TEMPLATE_EMAIL;
    }

    function aadhaarTemplateId() internal pure returns (bytes32) {
        return TEMPLATE_AADHAAR;
    }

    function faceTemplateId() internal pure returns (bytes32) {
        return TEMPLATE_FACE;
    }

    function incomeTemplateId() internal pure returns (bytes32) {
        return TEMPLATE_INCOME;
    }
}
