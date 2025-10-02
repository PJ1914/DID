// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VerificationLogger} from "../../src/core/VerificationLogger.sol";
import {TrustScore} from "../../src/core/TrustScore.sol";
import {IdentityRegistry} from "../../src/core/IdentityRegistry.sol";
import {VerificationManager} from "../../src/verification/VerificationManager.sol";
import {OrganizationManager} from "../../src/organizations/OrganizationManager.sol";
import {CertificateManager} from "../../src/organizations/CertificateManager.sol";
import {VerificationTypes} from "../../src/libs/VerificationTypes.sol";
import {IdentityTypes} from "../../src/libs/IdentityTypes.sol";
import {OrganizationTypes} from "../../src/libs/OrganizationTypes.sol";
import {Roles} from "../../src/libs/Roles.sol";

contract VerificationOrganizationFlowTest is Test {
    VerificationLogger private logger;
    TrustScore private trustScore;
    IdentityRegistry private identityRegistry;
    VerificationManager private verificationManager;
    OrganizationManager private organizationManager;
    CertificateManager private certificateManager;

    address private constant PROVIDER = address(0xAAA1);
    address private constant ISSUER = address(0xAAA2);
    address private constant USER = address(0xA11CE);

    bytes32 private identityId;
    bytes32 private organizationId;

    function setUp() public {
        logger = new VerificationLogger(address(this));
        trustScore = new TrustScore(address(this));
        identityRegistry = new IdentityRegistry(
            address(this),
            address(trustScore)
        );
        verificationManager = new VerificationManager(
            address(this),
            address(identityRegistry),
            address(trustScore)
        );
        organizationManager = new OrganizationManager(address(this));
        certificateManager = new CertificateManager(
            address(this),
            address(organizationManager),
            address(identityRegistry),
            address(logger)
        );

        logger.grantLoggerRole(address(certificateManager));
        trustScore.grantRole(
            Roles.TRUST_SCORE_UPDATER,
            address(verificationManager)
        );

        verificationManager.registerProvider(
            PROVIDER,
            "Trusted Provider",
            "ipfs://provider"
        );
        organizationId = organizationManager.registerOrganization(
            "Acme Org",
            "ipfs://org"
        );
        organizationManager.setOrganizationStatus(
            organizationId,
            OrganizationTypes.OrganizationStatus.Active
        );
        organizationManager.assignRole(
            organizationId,
            ISSUER,
            Roles.ORGANIZATION_ISSUER
        );

        identityId = identityRegistry.registerIdentity(USER, "ipfs://user");
        identityRegistry.setIdentityStatus(
            identityId,
            IdentityTypes.IdentityStatus.Active
        );
    }

    function testEndToEndVerificationAndCertificateIssuance() public {
        // Provider completes verification
        vm.prank(PROVIDER);
        bytes32 verificationId = verificationManager.recordAadhaarVerification(
            identityId,
            "ipfs://aadhaar",
            uint64(block.timestamp + 30 days)
        );

        VerificationTypes.VerificationRecord memory record = verificationManager
            .getVerification(verificationId);
        assertEq(record.identityId, identityId, "identity id");
        assertEq(record.provider, PROVIDER, "provider address");
        assertEq(
            uint8(record.status),
            uint8(VerificationTypes.VerificationStatus.Approved),
            "status"
        );
        assertEq(trustScore.getScore(identityId), 10, "trust score updated");

        // Organization issues certificate
        vm.prank(ISSUER);
        uint256 certificateId = certificateManager.issueCertificate(
            organizationId,
            USER,
            identityId,
            "ipfs://certificates/1"
        );

        (
            CertificateManager.CertificateInfo memory cert,
            string memory uri
        ) = certificateManager.getCertificate(certificateId);
        assertEq(cert.organizationId, organizationId, "org id");
        assertEq(cert.identityId, identityId, "identity linkage");
        assertEq(cert.issuedBy, ISSUER, "issuer address");
        assertEq(cert.revoked, false, "revoked flag");
        assertEq(uri, "ipfs://certificates/1", "metadata uri");
        assertEq(
            certificateManager.ownerOf(certificateId),
            USER,
            "certificate owner"
        );
        assertEq(logger.logCount(), 1, "certificate log");
    }
}
