// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../src/bc-cvs/RevocationRegistry.sol";
import "../../src/libs/Roles.sol";
import "../../src/libs/Errors.sol";

contract RevocationRegistryTest is Test {
    RevocationRegistry public registry;

    address public admin = address(0x1);
    address public issuer = address(0x2);
    address public holder = address(0x3);
    address public verifier = address(0x4);

    bytes32 public certHash1 = keccak256("cert1");
    bytes32 public certHash2 = keccak256("cert2");
    bytes32 public certHash3 = keccak256("cert3");
    bytes32 public replacementHash1 = keccak256("replacement1");

    function setUp() public {
        vm.prank(admin);
        registry = new RevocationRegistry(admin);

        // Grant necessary roles
        vm.startPrank(admin);
        registry.grantRole(Roles.CERTIFICATE_ISSUER, issuer);
        registry.grantRole(Roles.ADMINISTRATOR, admin);
        vm.stopPrank();
    }

    // ============================================
    // Constructor Tests
    // ============================================

    function test_Constructor() public {
        assertTrue(registry.hasRole(Roles.ADMINISTRATOR, admin));
        assertEq(registry.getTotalRevocations(), 0);
        assertEq(registry.getTotalCorrections(), 0);
    }

    // ============================================
    // Revoke Certificate Tests
    // ============================================

    function test_RevokeCertificate_Success() public {
        vm.prank(issuer);
        vm.expectEmit(true, true, false, true);
        emit IRevocationRegistry.CertificateRevoked(
            certHash1,
            issuer,
            "Lost document",
            block.timestamp
        );
        registry.revokeCertificate(certHash1, "Lost document");

        assertTrue(registry.isRevoked(certHash1));

        IRevocationRegistry.RevocationRecord memory record = registry.getRevocationRecord(
            certHash1
        );
        assertEq(record.certificateHash, certHash1);
        assertEq(record.revoker, issuer);
        assertEq(record.reason, "Lost document");
        assertEq(record.timestamp, block.timestamp);
        assertEq(record.replacementHash, bytes32(0));

        assertEq(registry.getTotalRevocations(), 1);
    }

    function test_RevokeCertificate_RevertNotIssuer() public {
        vm.prank(holder);
        vm.expectRevert();
        registry.revokeCertificate(certHash1, "Reason");
    }

    function test_RevokeCertificate_RevertZeroHash() public {
        vm.prank(issuer);
        vm.expectRevert(Errors.InvalidCertificateHash.selector);
        registry.revokeCertificate(bytes32(0), "Reason");
    }

    function test_RevokeCertificate_RevertEmptyReason() public {
        vm.prank(issuer);
        vm.expectRevert(Errors.EmptyString.selector);
        registry.revokeCertificate(certHash1, "");
    }

    function test_RevokeCertificate_RevertAlreadyRevoked() public {
        vm.startPrank(issuer);
        registry.revokeCertificate(certHash1, "Lost document");

        vm.expectRevert(abi.encodeWithSelector(Errors.CertificateAlreadyRevoked.selector, certHash1));
        registry.revokeCertificate(certHash1, "Another reason");
        vm.stopPrank();
    }

    // ============================================
    // Correct Certificate Tests
    // ============================================

    function test_CorrectCertificate_Success() public {
        // First revoke the certificate
        vm.prank(issuer);
        registry.revokeCertificate(certHash1, "Contains errors");

        // Now correct it
        vm.prank(issuer);
        vm.expectEmit(true, true, false, true);
        emit IRevocationRegistry.CertificateCorrected(
            certHash1,
            replacementHash1,
            issuer,
            "Fixed date of birth",
            block.timestamp
        );
        registry.correctCertificate(certHash1, replacementHash1, "Fixed date of birth");

        assertTrue(registry.isCorrected(certHash1));
        assertEq(registry.getReplacementHash(certHash1), replacementHash1);

        IRevocationRegistry.CorrectionRecord memory record = registry.getCorrectionRecord(
            certHash1
        );
        assertEq(record.originalHash, certHash1);
        assertEq(record.replacementHash, replacementHash1);
        assertEq(record.corrector, issuer);
        assertEq(record.reason, "Fixed date of birth");
        assertEq(record.timestamp, block.timestamp);

        assertEq(registry.getTotalCorrections(), 1);
    }

    function test_CorrectCertificate_RevertNotIssuer() public {
        vm.prank(issuer);
        registry.revokeCertificate(certHash1, "Contains errors");

        vm.prank(holder);
        vm.expectRevert();
        registry.correctCertificate(certHash1, replacementHash1, "Reason");
    }

    function test_CorrectCertificate_RevertZeroHash() public {
        vm.prank(issuer);
        vm.expectRevert(Errors.InvalidCertificateHash.selector);
        registry.correctCertificate(bytes32(0), replacementHash1, "Reason");
    }

    function test_CorrectCertificate_RevertZeroReplacementHash() public {
        vm.prank(issuer);
        registry.revokeCertificate(certHash1, "Contains errors");

        vm.prank(issuer);
        vm.expectRevert(Errors.InvalidCertificateHash.selector);
        registry.correctCertificate(certHash1, bytes32(0), "Reason");
    }

    function test_CorrectCertificate_RevertEmptyReason() public {
        vm.prank(issuer);
        registry.revokeCertificate(certHash1, "Contains errors");

        vm.prank(issuer);
        vm.expectRevert(Errors.EmptyString.selector);
        registry.correctCertificate(certHash1, replacementHash1, "");
    }

    function test_CorrectCertificate_RevertNotRevoked() public {
        vm.prank(issuer);
        vm.expectRevert(abi.encodeWithSelector(Errors.CertificateNotRevoked.selector, certHash1));
        registry.correctCertificate(certHash1, replacementHash1, "Reason");
    }

    function test_CorrectCertificate_RevertAlreadyCorrected() public {
        // Revoke and correct
        vm.startPrank(issuer);
        registry.revokeCertificate(certHash1, "Contains errors");
        registry.correctCertificate(certHash1, replacementHash1, "Fixed date of birth");

        // Try to correct again
        vm.expectRevert(abi.encodeWithSelector(Errors.CertificateAlreadyCorrected.selector, certHash1));
        registry.correctCertificate(certHash1, keccak256("another_replacement"), "Another fix");
        vm.stopPrank();
    }

    // ============================================
    // Emergency Revoke Tests
    // ============================================

    function test_EmergencyRevoke_Success() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, true);
        emit IRevocationRegistry.EmergencyRevocation(
            certHash1,
            admin,
            "Security breach",
            block.timestamp
        );
        registry.emergencyRevoke(certHash1, "Security breach");

        assertTrue(registry.isRevoked(certHash1));
        assertEq(registry.getTotalRevocations(), 1);
    }

    function test_EmergencyRevoke_RevertNotAdmin() public {
        vm.prank(issuer);
        vm.expectRevert();
        registry.emergencyRevoke(certHash1, "Reason");
    }

    // ============================================
    // Batch Revoke Tests
    // ============================================

    function test_BatchRevokeCertificates_Success() public {
        bytes32[] memory hashes = new bytes32[](3);
        hashes[0] = certHash1;
        hashes[1] = certHash2;
        hashes[2] = certHash3;

        string[] memory reasons = new string[](3);
        reasons[0] = "Reason 1";
        reasons[1] = "Reason 2";
        reasons[2] = "Reason 3";

        vm.prank(issuer);
        vm.expectEmit(true, false, false, true);
        emit IRevocationRegistry.BatchRevocation(3, issuer, block.timestamp);
        registry.batchRevokeCertificates(hashes, reasons);

        assertTrue(registry.isRevoked(certHash1));
        assertTrue(registry.isRevoked(certHash2));
        assertTrue(registry.isRevoked(certHash3));
        assertEq(registry.getTotalRevocations(), 3);
    }

    function test_BatchRevokeCertificates_RevertLengthMismatch() public {
        bytes32[] memory hashes = new bytes32[](2);
        hashes[0] = certHash1;
        hashes[1] = certHash2;

        string[] memory reasons = new string[](3);
        reasons[0] = "Reason 1";
        reasons[1] = "Reason 2";
        reasons[2] = "Reason 3";

        vm.prank(issuer);
        vm.expectRevert(Errors.ArrayLengthMismatch.selector);
        registry.batchRevokeCertificates(hashes, reasons);
    }

    function test_BatchRevokeCertificates_RevertEmptyArray() public {
        bytes32[] memory hashes = new bytes32[](0);
        string[] memory reasons = new string[](0);

        vm.prank(issuer);
        vm.expectRevert(Errors.EmptyArray.selector);
        registry.batchRevokeCertificates(hashes, reasons);
    }

    // ============================================
    // View Function Tests
    // ============================================

    function test_GetRevocationsByIssuer() public {
        vm.startPrank(issuer);
        registry.revokeCertificate(certHash1, "Reason 1");
        registry.revokeCertificate(certHash2, "Reason 2");
        vm.stopPrank();

        bytes32[] memory revocations = registry.getRevocationsByIssuer(issuer, 0, 10);
        assertEq(revocations.length, 2);
        assertEq(revocations[0], certHash1);
        assertEq(revocations[1], certHash2);
    }

    function test_GetRevocationsByIssuer_WithPagination() public {
        vm.startPrank(issuer);
        registry.revokeCertificate(certHash1, "Reason 1");
        registry.revokeCertificate(certHash2, "Reason 2");
        registry.revokeCertificate(certHash3, "Reason 3");
        vm.stopPrank();

        bytes32[] memory page1 = registry.getRevocationsByIssuer(issuer, 0, 2);
        assertEq(page1.length, 2);
        assertEq(page1[0], certHash1);
        assertEq(page1[1], certHash2);

        bytes32[] memory page2 = registry.getRevocationsByIssuer(issuer, 2, 2);
        assertEq(page2.length, 1);
        assertEq(page2[0], certHash3);
    }

    function test_GetCorrectionsByIssuer() public {
        vm.startPrank(issuer);
        registry.revokeCertificate(certHash1, "Contains errors");
        registry.correctCertificate(certHash1, replacementHash1, "Fixed errors");
        vm.stopPrank();

        bytes32[] memory corrections = registry.getCorrectionsByIssuer(issuer, 0, 10);
        assertEq(corrections.length, 1);
        assertEq(corrections[0], certHash1);
    }

    function test_GetRevocationTimestamp() public {
        uint256 expectedTimestamp = block.timestamp;

        vm.prank(issuer);
        registry.revokeCertificate(certHash1, "Lost document");

        assertEq(registry.getRevocationTimestamp(certHash1), expectedTimestamp);
    }

    function test_GetRevocationTimestamp_NotRevoked() public {
        assertEq(registry.getRevocationTimestamp(certHash1), 0);
    }

    function test_GetAuditTrail() public {
        vm.startPrank(issuer);
        
        // Revoke
        registry.revokeCertificate(certHash1, "Contains errors");
        uint256 revocationTimestamp = block.timestamp;

        // Correct
        vm.warp(block.timestamp + 1 days);
        registry.correctCertificate(certHash1, replacementHash1, "Fixed errors");
        uint256 correctionTimestamp = block.timestamp;

        vm.stopPrank();

        (
            IRevocationRegistry.RevocationRecord memory revRecord,
            IRevocationRegistry.CorrectionRecord memory corrRecord,
            bool hasCorrection
        ) = registry.getAuditTrail(certHash1);

        assertEq(revRecord.certificateHash, certHash1);
        assertEq(revRecord.revoker, issuer);
        assertEq(revRecord.reason, "Contains errors");
        assertEq(revRecord.timestamp, revocationTimestamp);

        assertTrue(hasCorrection);
        assertEq(corrRecord.originalHash, certHash1);
        assertEq(corrRecord.replacementHash, replacementHash1);
        assertEq(corrRecord.corrector, issuer);
        assertEq(corrRecord.reason, "Fixed errors");
        assertEq(corrRecord.timestamp, correctionTimestamp);
    }

    function test_GetStatistics() public {
        vm.startPrank(issuer);
        registry.revokeCertificate(certHash1, "Reason 1");
        registry.revokeCertificate(certHash2, "Contains errors");
        registry.correctCertificate(certHash2, replacementHash1, "Fixed errors");
        vm.stopPrank();

        (uint256 totalRevocations, uint256 totalCorrections) = registry.getStatistics();

        assertEq(totalRevocations, 2);
        assertEq(totalCorrections, 1);
    }

    // ============================================
    // Integration Tests
    // ============================================

    function test_FullCorrectionWorkflow() public {
        vm.startPrank(issuer);

        // Step 1: Revoke certificate
        registry.revokeCertificate(certHash1, "Contains date error");
        assertTrue(registry.isRevoked(certHash1));

        // Step 2: Correct certificate
        registry.correctCertificate(certHash1, replacementHash1, "Corrected date of birth");
        assertTrue(registry.isCorrected(certHash1));
        assertEq(registry.getReplacementHash(certHash1), replacementHash1);

        // Step 3: Verify audit trail
        (
            IRevocationRegistry.RevocationRecord memory revRecord,
            IRevocationRegistry.CorrectionRecord memory corrRecord,
            bool hasCorrection
        ) = registry.getAuditTrail(certHash1);

        assertTrue(hasCorrection);
        assertEq(revRecord.reason, "Contains date error");
        assertEq(corrRecord.reason, "Corrected date of birth");
        assertEq(corrRecord.replacementHash, replacementHash1);

        vm.stopPrank();
    }

    function test_MultipleRevocations() public {
        vm.startPrank(issuer);

        registry.revokeCertificate(certHash1, "Lost");
        registry.revokeCertificate(certHash2, "Stolen");
        registry.revokeCertificate(certHash3, "Expired");

        vm.stopPrank();

        assertTrue(registry.isRevoked(certHash1));
        assertTrue(registry.isRevoked(certHash2));
        assertTrue(registry.isRevoked(certHash3));

        bytes32[] memory revocations = registry.getRevocationsByIssuer(issuer, 0, 10);
        assertEq(revocations.length, 3);
        assertEq(registry.getTotalRevocations(), 3);
    }
}
