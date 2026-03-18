// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../src/bc-cvs/CertificateHashRegistry.sol";
import "../../src/bc-cvs/BloomFilter.sol";
import "../../src/bc-cvs/RevocationRegistry.sol";
import "../../src/libs/Roles.sol";
import "../../src/libs/Errors.sol";

contract CertificateHashRegistryTest is Test {
    CertificateHashRegistry public registry;
    BloomFilter public bloomFilter;
    RevocationRegistry public revocationRegistry;

    address public admin = address(0x1);
    address public issuer1 = address(0x2);
    address public issuer2 = address(0x3);
    address public holder1 = address(0x4);
    address public holder2 = address(0x5);
    address public verifier = address(0x6);

    // Test data
    bytes32 public testHash1 = keccak256("certificate1");
    bytes32 public testHash2 = keccak256("certificate2");
    bytes public testSignature1 = hex"1234567890abcdef";
    bytes public testSignature2 = hex"abcdef1234567890";
    string public testMetadata = '{"name":"John Doe","course":"BlockchainDev","grade":"A"}';

    function setUp() public {
        vm.startPrank(admin);

        // Deploy contracts
        registry = new CertificateHashRegistry(admin);
        bloomFilter = new BloomFilter(admin);
        revocationRegistry = new RevocationRegistry(admin);

        // Link contracts
        registry.setBloomFilter(address(bloomFilter));
        registry.setRevocationRegistry(address(revocationRegistry));

        // Grant Bloom Filter Manager role to registry
        bloomFilter.grantManagerRole(address(registry));

        // Grant Certificate Issuer role to revocation registry
        revocationRegistry.grantRole(Roles.CERTIFICATE_ISSUER, address(registry));

        // Authorize issuers
        registry.authorizeIssuer(issuer1);
        registry.authorizeIssuer(issuer2);

        // Grant roles
        registry.grantHolderRole(holder1);
        registry.grantHolderRole(holder2);
        registry.grantVerifierRole(verifier);

        vm.stopPrank();
    }

    // ============================================
    // Constructor Tests
    // ============================================

    function test_Constructor() public {
        assertTrue(registry.hasRole(Roles.ADMINISTRATOR, admin));
        assertTrue(registry.hasRole(registry.DEFAULT_ADMIN_ROLE(), admin));
    }

    function test_Constructor_RevertZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        new CertificateHashRegistry(address(0));
    }

    // ============================================
    // Issue Certificate Tests
    // ============================================

    function test_IssueCertificate_Success() public {
        vm.startPrank(issuer1);

        vm.expectEmit(true, true, true, true);
        emit ICertificateHashRegistry.CertificateIssued(
            testHash1,
            issuer1,
            holder1,
            block.timestamp
        );

        registry.issueCertificate(testHash1, testSignature1, holder1, testMetadata);

        // Verify certificate was created
        (bool isValid, ICertificateHashRegistry.Certificate memory cert) = registry
            .verifyCertificate(testHash1);

        assertTrue(isValid);
        assertEq(cert.certificateHash, testHash1);
        assertEq(cert.issuer, issuer1);
        assertEq(cert.holder, holder1);
        assertTrue(cert.isValid);
        assertEq(cert.metadata, testMetadata);

        vm.stopPrank();
    }

    function test_IssueCertificate_UpdatesBloomFilter() public {
        vm.prank(issuer1);
        registry.issueCertificate(testHash1, testSignature1, holder1, testMetadata);

        // Check Bloom filter
        assertTrue(bloomFilter.check(testHash1));
    }

    function test_IssueCertificate_RevertInvalidHash() public {
        vm.prank(issuer1);
        vm.expectRevert(Errors.InvalidCertificateHash.selector);
        registry.issueCertificate(bytes32(0), testSignature1, holder1, testMetadata);
    }

    function test_IssueCertificate_RevertInvalidHolder() public {
        vm.prank(issuer1);
        vm.expectRevert(abi.encodeWithSelector(Errors.InvalidHolder.selector, address(0)));
        registry.issueCertificate(testHash1, testSignature1, address(0), testMetadata);
    }

    function test_IssueCertificate_RevertInvalidSignature() public {
        vm.prank(issuer1);
        vm.expectRevert(Errors.InvalidRSASignature.selector);
        registry.issueCertificate(testHash1, "", holder1, testMetadata);
    }

    function test_IssueCertificate_RevertEmptyMetadata() public {
        vm.prank(issuer1);
        vm.expectRevert(Errors.EmptyString.selector);
        registry.issueCertificate(testHash1, testSignature1, holder1, "");
    }

    function test_IssueCertificate_RevertDuplicate() public {
        vm.startPrank(issuer1);

        registry.issueCertificate(testHash1, testSignature1, holder1, testMetadata);

        vm.expectRevert(
            abi.encodeWithSelector(Errors.CertificateAlreadyExists.selector, testHash1)
        );
        registry.issueCertificate(testHash1, testSignature1, holder1, testMetadata);

        vm.stopPrank();
    }

    function test_IssueCertificate_RevertNotAuthorizedIssuer() public {
        vm.prank(holder1);
        vm.expectRevert();
        registry.issueCertificate(testHash1, testSignature1, holder1, testMetadata);
    }

    // ============================================
    // Revoke Certificate Tests
    // ============================================

    function test_RevokeCertificate_Success() public {
        // Issue certificate
        vm.prank(issuer1);
        registry.issueCertificate(testHash1, testSignature1, holder1, testMetadata);

        // Revoke certificate
        vm.prank(issuer1);
        vm.expectEmit(true, true, false, true);
        emit ICertificateHashRegistry.CertificateRevoked(
            testHash1,
            issuer1,
            block.timestamp,
            "Test revocation"
        );
        registry.revokeCertificate(testHash1, "Test revocation");

        // Verify certificate is invalid
        (bool isValid, ) = registry.verifyCertificate(testHash1);
        assertFalse(isValid);
    }

    function test_RevokeCertificate_RevertNotFound() public {
        vm.prank(issuer1);
        vm.expectRevert(abi.encodeWithSelector(Errors.CertificateNotFound.selector, testHash1));
        registry.revokeCertificate(testHash1, "Test revocation");
    }

    function test_RevokeCertificate_RevertNotIssuer() public {
        vm.prank(issuer1);
        registry.issueCertificate(testHash1, testSignature1, holder1, testMetadata);

        vm.prank(issuer2);
        vm.expectRevert(
            abi.encodeWithSelector(Errors.NotCertificateIssuer.selector, issuer2, issuer1)
        );
        registry.revokeCertificate(testHash1, "Test revocation");
    }

    // ============================================
    // Correct Certificate Tests
    // ============================================

    function test_CorrectCertificate_Success() public {
        // Issue original certificate
        vm.prank(issuer1);
        registry.issueCertificate(testHash1, testSignature1, holder1, testMetadata);

        // Correct certificate
        string memory newMetadata = '{"name":"John Doe","course":"BlockchainDev","grade":"A+"}';

        vm.prank(issuer1);
        vm.expectEmit(true, true, true, true);
        emit ICertificateHashRegistry.CertificateCorrected(
            testHash1,
            testHash2,
            issuer1,
            block.timestamp
        );
        registry.correctCertificate(testHash1, testHash2, testSignature2, newMetadata);

        // Verify old certificate is invalid
        (bool isValid1, ) = registry.verifyCertificate(testHash1);
        assertFalse(isValid1);

        // Verify new certificate is valid
        (bool isValid2, ICertificateHashRegistry.Certificate memory cert2) = registry
            .verifyCertificate(testHash2);
        assertTrue(isValid2);
        assertEq(cert2.certificateHash, testHash2);
        assertEq(cert2.holder, holder1);
        assertEq(cert2.metadata, newMetadata);
    }

    // ============================================
    // View Function Tests
    // ============================================

    function test_GetCertificate_Success() public {
        vm.prank(issuer1);
        registry.issueCertificate(testHash1, testSignature1, holder1, testMetadata);

        ICertificateHashRegistry.Certificate memory cert = registry.getCertificate(testHash1);

        assertEq(cert.certificateHash, testHash1);
        assertEq(cert.issuer, issuer1);
        assertEq(cert.holder, holder1);
    }

    function test_CertificateExists() public {
        assertFalse(registry.certificateExists(testHash1));

        vm.prank(issuer1);
        registry.issueCertificate(testHash1, testSignature1, holder1, testMetadata);

        assertTrue(registry.certificateExists(testHash1));
    }

    function test_GetCertificatesByIssuer() public {
        vm.startPrank(issuer1);
        registry.issueCertificate(testHash1, testSignature1, holder1, testMetadata);
        registry.issueCertificate(testHash2, testSignature2, holder2, testMetadata);
        vm.stopPrank();

        bytes32[] memory certs = registry.getCertificatesByIssuer(issuer1);
        assertEq(certs.length, 2);
        assertEq(certs[0], testHash1);
        assertEq(certs[1], testHash2);
    }

    function test_GetCertificatesByHolder() public {
        vm.prank(issuer1);
        registry.issueCertificate(testHash1, testSignature1, holder1, testMetadata);

        bytes32[] memory certs = registry.getCertificatesByHolder(holder1);
        assertEq(certs.length, 1);
        assertEq(certs[0], testHash1);
    }

    function test_GetTotalCertificates() public {
        assertEq(registry.getTotalCertificates(), 0);

        vm.startPrank(issuer1);
        registry.issueCertificate(testHash1, testSignature1, holder1, testMetadata);
        assertEq(registry.getTotalCertificates(), 1);

        registry.issueCertificate(testHash2, testSignature2, holder2, testMetadata);
        assertEq(registry.getTotalCertificates(), 2);
        vm.stopPrank();
    }

    // ============================================
    // Admin Function Tests
    // ============================================

    function test_AuthorizeIssuer_Success() public {
        address newIssuer = address(0x99);

        vm.prank(admin);
        registry.authorizeIssuer(newIssuer);

        assertTrue(registry.isAuthorizedIssuer(newIssuer));
        assertTrue(registry.hasRole(Roles.CERTIFICATE_ISSUER, newIssuer));
    }

    function test_AuthorizeIssuer_RevertNotAdmin() public {
        address newIssuer = address(0x99);

        vm.prank(issuer1);
        vm.expectRevert();
        registry.authorizeIssuer(newIssuer);
    }

    function test_RevokeIssuerAuthorization_Success() public {
        vm.prank(admin);
        registry.revokeIssuerAuthorization(issuer1);

        assertFalse(registry.isAuthorizedIssuer(issuer1));
        assertFalse(registry.hasRole(Roles.CERTIFICATE_ISSUER, issuer1));
    }
}
