// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../src/bc-cvs/CertificateHashRegistry.sol";
import "../../src/bc-cvs/BloomFilter.sol";
import "../../src/bc-cvs/RevocationRegistry.sol";
import "../../src/bc-cvs/ValidatorConsensus.sol";

/**
 * @title FullWorkflowTest
 * @notice Comprehensive integration test for complete Sajjan workflow
 * @dev Tests the entire lifecycle: Institution onboarding → Certificate issuance → Verification → Revocation
 */
contract FullWorkflowTest is Test {
    // Contract instances
    CertificateHashRegistry public registry;
    BloomFilter public bloomFilter;
    RevocationRegistry public revocationRegistry;
    ValidatorConsensus public consensus;
    
    // Test addresses
    address public admin = address(1);
    address public validator1 = address(2);
    address public validator2 = address(3);
    address public validator3 = address(4);
    address public institute = address(5);
    address public student = address(6);
    address public unauthorizedUser = address(7);
    
    // Events to test
    event CertificateIssued(
        bytes32 indexed certificateHash,
        address indexed issuer,
        address indexed holder,
        uint256 timestamp
    );
    
    event CertificateRevoked(
        bytes32 indexed certificateHash,
        address indexed issuer,
        address indexed holder,
        string reason,
        uint256 timestamp
    );
    
    event InstitutionProposed(
        uint256 indexed proposalId,
        address indexed institutionAddress,
        string name
    );
    
    event ValidatorVoted(
        uint256 indexed proposalId,
        address indexed validator,
        bool approved
    );
    
    event ProposalExecuted(
        uint256 indexed proposalId,
        bool approved
    );

    function setUp() public {
        // Start prank as admin
        vm.startPrank(admin);
        
        // Deploy all contracts in correct order
        bloomFilter = new BloomFilter();
        revocationRegistry = new RevocationRegistry();
        registry = new CertificateHashRegistry(
            address(bloomFilter),
            address(revocationRegistry)
        );
        consensus = new ValidatorConsensus();
        
        // Grant validator roles
        consensus.grantRole(consensus.VALIDATOR_ROLE(), validator1);
        consensus.grantRole(consensus.VALIDATOR_ROLE(), validator2);
        consensus.grantRole(consensus.VALIDATOR_ROLE(), validator3);
        
        // Grant admin roles to registry and bloom filter
        registry.grantRole(registry.INSTITUTE_ROLE(), institute);
        bloomFilter.grantRole(bloomFilter.INSTITUTE_ROLE(), institute);
        revocationRegistry.grantRole(revocationRegistry.INSTITUTE_ROLE(), institute);
        
        vm.stopPrank();
    }
    
    /**
     * @notice Test 1: Complete happy path workflow
     * @dev Tests institution proposal → voting → approval → certificate issuance → verification
     */
    function test_CompleteWorkflow() public {
        // ========== PHASE 1: INSTITUTION ONBOARDING ==========
        
        // Propose new institution
        vm.startPrank(admin);
        uint256 proposalId = consensus.proposeInstitution(institute, "Massachusetts Institute of Technology");
        vm.stopPrank();
        
        // Verify proposal created
        (
            address institutionAddr,
            string memory instName,
            uint256 votesFor,
            uint256 votesAgainst,
            bool executed,
            bool approved
        ) = consensus.getProposal(proposalId);
        
        assertEq(institutionAddr, institute, "Institution address mismatch");
        assertEq(instName, "Massachusetts Institute of Technology", "Institution name mismatch");
        assertEq(votesFor, 0, "Initial votes should be 0");
        assertEq(votesAgainst, 0, "Initial votes should be 0");
        assertFalse(executed, "Proposal should not be executed yet");
        assertFalse(approved, "Proposal should not be approved yet");
        
        // Validators vote
        vm.prank(validator1);
        vm.expectEmit(true, true, false, true);
        emit ValidatorVoted(proposalId, validator1, true);
        consensus.voteOnProposal(proposalId, true);
        
        vm.prank(validator2);
        consensus.voteOnProposal(proposalId, true);
        
        vm.prank(validator3);
        consensus.voteOnProposal(proposalId, true);
        
        // Verify unanimous consensus
        (, , votesFor, votesAgainst, , ) = consensus.getProposal(proposalId);
        assertEq(votesFor, 3, "All validators should approve");
        assertEq(votesAgainst, 0, "No rejections expected");
        
        // Execute proposal
        vm.prank(admin);
        vm.expectEmit(true, false, false, true);
        emit ProposalExecuted(proposalId, true);
        consensus.executeProposal(proposalId);
        
        // Verify execution
        (, , , , executed, approved) = consensus.getProposal(proposalId);
        assertTrue(executed, "Proposal should be executed");
        assertTrue(approved, "Proposal should be approved");
        
        // ========== PHASE 2: CERTIFICATE ISSUANCE ==========
        
        bytes32 certHash = keccak256("Bachelor of Science in Computer Science - Student ID: 12345");
        string memory metadata = "Bachelor of Science in Computer Science";
        bytes memory signature = new bytes(256); // Mock RSA signature
        
        // Fill signature with dummy data
        for (uint i = 0; i < 256; i++) {
            signature[i] = bytes1(uint8(i % 256));
        }
        
        // Issue certificate
        vm.prank(institute);
        vm.expectEmit(true, true, true, false);
        emit CertificateIssued(certHash, institute, student, block.timestamp);
        registry.issueCertificate(certHash, student, metadata, signature);
        
        // ========== PHASE 3: VERIFICATION ==========
        
        // Bloom filter check
        assertTrue(bloomFilter.mightContain(certHash), "Bloom filter should contain hash");
        
        // Full certificate verification
        (
            address issuer,
            address holder,
            uint256 timestamp,
            string memory meta,
            bool revoked
        ) = registry.getCertificate(certHash);
        
        assertEq(issuer, institute, "Issuer mismatch");
        assertEq(holder, student, "Holder mismatch");
        assertGt(timestamp, 0, "Timestamp should be set");
        assertEq(meta, metadata, "Metadata mismatch");
        assertFalse(revoked, "Certificate should not be revoked");
        
        // Verify certificate exists
        assertTrue(registry.certificateExists(certHash), "Certificate should exist");
        
        // ========== PHASE 4: REVOCATION ==========
        
        string memory revocationReason = "Incorrect GPA listed on certificate";
        
        // Revoke certificate
        vm.prank(institute);
        vm.expectEmit(true, true, true, false);
        emit CertificateRevoked(certHash, institute, student, revocationReason, block.timestamp);
        revocationRegistry.revokeCertificate(certHash, institute, student, revocationReason);
        
        // Verify revocation
        assertTrue(revocationRegistry.isRevoked(certHash), "Certificate should be revoked");
        
        // Check revocation history
        (
            address revokedIssuer,
            address revokedHolder,
            ,
            string memory reason,
            ,
        ) = revocationRegistry.getLatestRevocation(certHash);
        
        assertEq(revokedIssuer, institute, "Revoked issuer mismatch");
        assertEq(revokedHolder, student, "Revoked holder mismatch");
        assertEq(reason, revocationReason, "Revocation reason mismatch");
    }
    
    /**
     * @notice Test 2: Multiple certificates for same holder
     * @dev Ensures system can handle multiple certificates per student
     */
    function test_MultipleCertificates() public {
        bytes32 cert1 = keccak256("Bachelor Degree");
        bytes32 cert2 = keccak256("Master Degree");
        bytes32 cert3 = keccak256("PhD Degree");
        bytes memory signature = new bytes(256);
        
        // Issue three certificates
        vm.startPrank(institute);
        registry.issueCertificate(cert1, student, "Bachelor of Science", signature);
        registry.issueCertificate(cert2, student, "Master of Science", signature);
        registry.issueCertificate(cert3, student, "Doctor of Philosophy", signature);
        vm.stopPrank();
        
        // Verify all exist
        assertTrue(registry.certificateExists(cert1), "Cert 1 should exist");
        assertTrue(registry.certificateExists(cert2), "Cert 2 should exist");
        assertTrue(registry.certificateExists(cert3), "Cert 3 should exist");
        
        // Verify all in Bloom filter
        assertTrue(bloomFilter.mightContain(cert1), "Cert 1 in Bloom filter");
        assertTrue(bloomFilter.mightContain(cert2), "Cert 2 in Bloom filter");
        assertTrue(bloomFilter.mightContain(cert3), "Cert 3 in Bloom filter");
    }
    
    /**
     * @notice Test 3: Proposal rejection scenario
     * @dev Tests when validators reject an institution
     */
    function test_ProposalRejection() public {
        // Propose institution
        vm.prank(admin);
        uint256 proposalId = consensus.proposeInstitution(unauthorizedUser, "Fake University");
        
        // All validators reject
        vm.prank(validator1);
        consensus.voteOnProposal(proposalId, false);
        
        vm.prank(validator2);
        consensus.voteOnProposal(proposalId, false);
        
        vm.prank(validator3);
        consensus.voteOnProposal(proposalId, false);
        
        // Execute proposal
        vm.prank(admin);
        consensus.executeProposal(proposalId);
        
        // Verify rejection
        (, , , , bool executed, bool approved) = consensus.getProposal(proposalId);
        assertTrue(executed, "Proposal should be executed");
        assertFalse(approved, "Proposal should be rejected");
    }
    
    /**
     * @notice Test 4: Access control enforcement
     * @dev Ensures unauthorized users cannot perform restricted actions
     */
    function test_AccessControl() public {
        bytes32 certHash = keccak256("Test Certificate");
        bytes memory signature = new bytes(256);
        
        // Try to issue certificate without INSTITUTE_ROLE
        vm.prank(unauthorizedUser);
        vm.expectRevert();
        registry.issueCertificate(certHash, student, "Test", signature);
        
        // Try to revoke certificate without INSTITUTE_ROLE
        vm.prank(unauthorizedUser);
        vm.expectRevert();
        revocationRegistry.revokeCertificate(certHash, institute, student, "Test");
        
        // Try to propose institution without admin role
        vm.prank(unauthorizedUser);
        vm.expectRevert();
        consensus.proposeInstitution(address(10), "Test");
    }
    
    /**
     * @notice Test 5: Input validation
     * @dev Tests zero address and invalid input handling
     */
    function test_InputValidation() public {
        bytes32 certHash = keccak256("Valid Certificate");
        bytes memory signature = new bytes(256);
        
        // Zero address holder
        vm.prank(institute);
        vm.expectRevert();
        registry.issueCertificate(certHash, address(0), "Test", signature);
        
        // Zero hash
        vm.prank(institute);
        vm.expectRevert();
        registry.issueCertificate(bytes32(0), student, "Test", signature);
        
        // Empty metadata
        vm.prank(institute);
        vm.expectRevert();
        registry.issueCertificate(certHash, student, "", signature);
    }
    
    /**
     * @notice Test 6: Duplicate certificate prevention
     * @dev Ensures the same certificate cannot be issued twice
     */
    function test_DuplicatePrevention() public {
        bytes32 certHash = keccak256("Duplicate Test");
        bytes memory signature = new bytes(256);
        
        // Issue first time - should succeed
        vm.prank(institute);
        registry.issueCertificate(certHash, student, "First Issue", signature);
        
        // Try to issue again - should fail
        vm.prank(institute);
        vm.expectRevert();
        registry.issueCertificate(certHash, student, "Second Issue", signature);
    }
    
    /**
     * @notice Test 7: Revocation history tracking
     * @dev Tests multiple revocations and corrections
     */
    function test_RevocationHistory() public {
        bytes32 certHash = keccak256("History Test");
        bytes memory signature = new bytes(256);
        
        // Issue certificate
        vm.prank(institute);
        registry.issueCertificate(certHash, student, "Test Certificate", signature);
        
        // First revocation
        vm.prank(institute);
        revocationRegistry.revokeCertificate(certHash, institute, student, "Reason 1");
        
        // Second revocation (correction)
        vm.prank(institute);
        revocationRegistry.revokeCertificate(certHash, institute, student, "Reason 2");
        
        // Verify history
        uint256 count = revocationRegistry.getRevocationCount(certHash);
        assertEq(count, 2, "Should have 2 revocation entries");
        
        // Get latest revocation
        (, , , string memory latestReason, , ) = revocationRegistry.getLatestRevocation(certHash);
        assertEq(latestReason, "Reason 2", "Latest reason mismatch");
    }
    
    /**
     * @notice Test 8: Bloom filter false positive handling
     * @dev Verifies that Bloom filter pre-check + registry check work correctly
     */
    function test_BloomFilterFalsePositives() public {
        // Generate hash that doesn't exist
        bytes32 nonExistentHash = keccak256("Non-existent certificate");
        
        // Bloom filter should return false (or potentially true if false positive)
        bool mightExist = bloomFilter.mightContain(nonExistentHash);
        
        // But registry check should definitively return false
        assertFalse(registry.certificateExists(nonExistentHash), "Registry should confirm non-existence");
        
        // If Bloom filter says might exist but registry says doesn't exist,
        // that's a controlled false positive - acceptable
        if (mightExist) {
            assertFalse(registry.certificateExists(nonExistentHash), "False positive handled correctly");
        }
    }
    
    /**
     * @notice Test 9: Gas optimization check
     * @dev Ensures gas costs are within acceptable limits
     */
    function test_GasCosts() public {
        bytes32 certHash = keccak256("Gas Test");
        bytes memory signature = new bytes(256);
        
        // Measure issuance gas
        uint256 gasBefore = gasleft();
        vm.prank(institute);
        registry.issueCertificate(certHash, student, "Gas Test Certificate", signature);
        uint256 gasUsed = gasBefore - gasleft();
        
        // Assert gas usage is reasonable (< 200k as per audit)
        assertLt(gasUsed, 200000, "Issuance gas too high");
        
        // Measure verification gas
        gasBefore = gasleft();
        bloomFilter.mightContain(certHash);
        gasUsed = gasBefore - gasleft();
        
        // Bloom filter should be very cheap (< 30k)
        assertLt(gasUsed, 30000, "Bloom filter gas too high");
    }
    
    /**
     * @notice Test 10: Validator consensus threshold
     * @dev Tests unanimous approval requirement
     */
    function test_UnanimousConsensus() public {
        // Propose institution
        vm.prank(admin);
        uint256 proposalId = consensus.proposeInstitution(address(100), "Test University");
        
        // Only 2 out of 3 validators approve
        vm.prank(validator1);
        consensus.voteOnProposal(proposalId, true);
        
        vm.prank(validator2);
        consensus.voteOnProposal(proposalId, true);
        
        vm.prank(validator3);
        consensus.voteOnProposal(proposalId, false);
        
        // Execute - should be rejected due to lack of unanimous approval
        vm.prank(admin);
        consensus.executeProposal(proposalId);
        
        (, , , , , bool approved) = consensus.getProposal(proposalId);
        assertFalse(approved, "Should require unanimous approval");
    }
}
