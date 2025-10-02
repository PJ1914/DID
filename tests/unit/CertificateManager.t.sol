// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {CertificateManager} from "../../src/organizations/CertificateManager.sol";
import {VerificationLogger} from "../../src/core/VerificationLogger.sol";
import {TrustScore} from "../../src/core/TrustScore.sol";
import {IdentityRegistry} from "../../src/core/IdentityRegistry.sol";
import {OrganizationManager} from "../../src/organizations/OrganizationManager.sol";
import {OrganizationTypes} from "../../src/libs/OrganizationTypes.sol";
import {IdentityTypes} from "../../src/libs/IdentityTypes.sol";
import {Roles} from "../../src/libs/Roles.sol";
import {Errors} from "../../src/libs/Errors.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IAccessControl} from "@openzeppelin/contracts/access/IAccessControl.sol";

contract CertificateManagerTest is Test {
    VerificationLogger private logger;
    TrustScore private trustScore;
    IdentityRegistry private identityRegistry;
    OrganizationManager private organizationManager;
    CertificateManager private certificateManager;

    address private constant RECIPIENT = address(0xCAFE);
    address private constant ISSUER = address(0x1337);
    address private constant OTHER_ACCOUNT = address(0xBEEF);

    function setUp() public {
        logger = new VerificationLogger(address(this));
        trustScore = new TrustScore(address(this));
        identityRegistry = new IdentityRegistry(
            address(this),
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
    }

    function testIssueCertificateByOrganizationIssuer() public {
        bytes32 orgId = _createActiveOrganization();
        bytes32 identityId = _registerActiveIdentity(RECIPIENT);

        organizationManager.assignRole(
            orgId,
            ISSUER,
            Roles.ORGANIZATION_ISSUER
        );

        vm.prank(ISSUER);
        uint256 tokenId = certificateManager.issueCertificate(
            orgId,
            RECIPIENT,
            identityId,
            "ipfs://cert/1"
        );

        assertEq(certificateManager.ownerOf(tokenId), RECIPIENT, "owner");

        (
            CertificateManager.CertificateInfo memory info,
            string memory uri
        ) = certificateManager.getCertificate(tokenId);
        assertEq(info.organizationId, orgId, "org id");
        assertEq(info.identityId, identityId, "identity");
        assertEq(info.issuedBy, ISSUER, "issuer");
        assertEq(info.revoked, false, "revoked flag");
        assertEq(uri, "ipfs://cert/1", "uri");
        assertEq(logger.logCount(), 1, "log count");
    }

    function testIssueCertificateRevertsIfOrganizationInactive() public {
        bytes32 orgId = organizationManager.registerOrganization(
            "Dormant Org",
            "ipfs://org"
        );
        organizationManager.assignRole(
            orgId,
            ISSUER,
            Roles.ORGANIZATION_ISSUER
        );
        bytes32 identityId = _registerActiveIdentity(RECIPIENT);

        vm.expectRevert(CertificateManager.OrganizationInactive.selector);
        vm.prank(ISSUER);
        certificateManager.issueCertificate(orgId, RECIPIENT, identityId, "");
    }

    function testIssueCertificateRevertsOnIdentityMismatch() public {
        bytes32 orgId = _createActiveOrganization();
        _registerActiveIdentity(RECIPIENT);
        bytes32 otherIdentity = _registerActiveIdentity(OTHER_ACCOUNT);

        organizationManager.assignRole(
            orgId,
            ISSUER,
            Roles.ORGANIZATION_ISSUER
        );

        vm.expectRevert(Errors.IdentityNotFound.selector);
        vm.prank(ISSUER);
        certificateManager.issueCertificate(
            orgId,
            RECIPIENT,
            otherIdentity,
            ""
        );

        // sanity: passing zero lets contract resolve automatically
        vm.prank(ISSUER);
        certificateManager.issueCertificate(
            orgId,
            RECIPIENT,
            bytes32(0),
            "ipfs://cert/auto"
        );
    }

    function testRevokeCertificateByOriginalIssuer() public {
        bytes32 orgId = _createActiveOrganization();
        bytes32 identityId = _registerActiveIdentity(RECIPIENT);
        organizationManager.assignRole(
            orgId,
            ISSUER,
            Roles.ORGANIZATION_ISSUER
        );

        vm.prank(ISSUER);
        uint256 tokenId = certificateManager.issueCertificate(
            orgId,
            RECIPIENT,
            identityId,
            "ipfs://cert/revoke"
        );

        vm.prank(ISSUER);
        certificateManager.revokeCertificate(tokenId);

        (
            CertificateManager.CertificateInfo memory info,
            string memory uri
        ) = certificateManager.getCertificate(tokenId);
        assertTrue(info.revoked, "revoked status");
        assertEq(uri, "ipfs://cert/revoke", "stored uri");

        vm.expectRevert(
            abi.encodeWithSignature("ERC721NonexistentToken(uint256)", tokenId)
        );
        certificateManager.ownerOf(tokenId);
    }

    function testRevokeCertificateRequiresAuthorization() public {
        bytes32 orgId = _createActiveOrganization();
        bytes32 identityId = _registerActiveIdentity(RECIPIENT);
        organizationManager.assignRole(
            orgId,
            ISSUER,
            Roles.ORGANIZATION_ISSUER
        );

        vm.prank(ISSUER);
        uint256 tokenId = certificateManager.issueCertificate(
            orgId,
            RECIPIENT,
            identityId,
            "ipfs://cert"
        );

        vm.expectRevert(CertificateManager.NotAuthorizedIssuer.selector);
        vm.prank(OTHER_ACCOUNT);
        certificateManager.revokeCertificate(tokenId);
    }

    function testManagerRoleCanIssueWithoutOrgRole() public {
        bytes32 orgId = _createActiveOrganization();
        bytes32 identityId = _registerActiveIdentity(RECIPIENT);

        uint256 tokenId = certificateManager.issueCertificate(
            orgId,
            RECIPIENT,
            identityId,
            "ipfs://cert/manager"
        );

        assertEq(certificateManager.ownerOf(tokenId), RECIPIENT, "owner");
    }

    function testOrganizationAdminCanRevokeCertificate() public {
        bytes32 orgId = _createActiveOrganization();
        bytes32 identityId = _registerActiveIdentity(RECIPIENT);
        organizationManager.assignRole(
            orgId,
            ISSUER,
            Roles.ORGANIZATION_ISSUER
        );

        vm.prank(ISSUER);
        uint256 tokenId = certificateManager.issueCertificate(
            orgId,
            RECIPIENT,
            identityId,
            "ipfs://cert/admin-revoke"
        );

        certificateManager.revokeCertificate(tokenId);
        (
            CertificateManager.CertificateInfo memory info,
            string memory storedUri
        ) = certificateManager.getCertificate(tokenId);
        assertTrue(info.revoked, "revoked flag");
        assertEq(storedUri, "ipfs://cert/admin-revoke", "metadata");
    }

    function testIssueCertificateRejectsZeroRecipient() public {
        bytes32 orgId = _createActiveOrganization();
        organizationManager.assignRole(
            orgId,
            ISSUER,
            Roles.ORGANIZATION_ISSUER
        );
        bytes32 identityId = _registerActiveIdentity(RECIPIENT);

        vm.expectRevert(CertificateManager.InvalidRecipient.selector);
        vm.prank(ISSUER);
        certificateManager.issueCertificate(
            orgId,
            address(0),
            identityId,
            ""
        );
    }

    function testSupportsInterfaceReturnsExpectedValues() public view {
        assertTrue(
            certificateManager.supportsInterface(type(IERC721).interfaceId),
            "erc721"
        );
        assertTrue(
            certificateManager.supportsInterface(
                type(IAccessControl).interfaceId
            ),
            "access control"
        );
    }

    function _createActiveOrganization() internal returns (bytes32 orgId) {
        orgId = organizationManager.registerOrganization("Org", "ipfs://org");
        organizationManager.setOrganizationStatus(
            orgId,
            OrganizationTypes.OrganizationStatus.Active
        );
    }

    function _registerActiveIdentity(
        address owner
    ) internal returns (bytes32 identityId) {
        identityId = identityRegistry.registerIdentity(
            owner,
            "ipfs://identity"
        );
        identityRegistry.setIdentityStatus(
            identityId,
            IdentityTypes.IdentityStatus.Active
        );
    }
}
