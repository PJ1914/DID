// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../src/bc-cvs/ValidatorConsensus.sol";
import "../../src/libs/Roles.sol";
import "../../src/libs/Errors.sol";

contract ValidatorConsensusTest is Test {
    ValidatorConsensus public consensus;

    address public admin = address(0x1);
    address public validator1 = address(0x2);
    address public validator2 = address(0x3);
    address public validator3 = address(0x4);
    address public proposer = address(0x5);
    address public institution1 = address(0x6);
    address public institution2 = address(0x7);

    bytes32 public docHash1 = keccak256("doc1");
    bytes32 public docHash2 = keccak256("doc2");

    function setUp() public {
        address[] memory initialValidators = new address[](3);
        initialValidators[0] = validator1;
        initialValidators[1] = validator2;
        initialValidators[2] = validator3;

        vm.prank(admin);
        consensus = new ValidatorConsensus(admin, initialValidators);
    }

    // ============================================
    // Constructor Tests
    // ============================================

    function test_Constructor() public {
        assertTrue(consensus.hasRole(Roles.ADMINISTRATOR, admin));
        assertTrue(consensus.isValidator(validator1));
        assertTrue(consensus.isValidator(validator2));
        assertTrue(consensus.isValidator(validator3));
        assertEq(consensus.getValidatorCount(), 3);
    }

    function test_Constructor_RevertZeroAddress() public {
        address[] memory validators = new address[](1);
        validators[0] = address(0);

        vm.prank(admin);
        vm.expectRevert(Errors.ZeroAddress.selector);
        new ValidatorConsensus(admin, validators);
    }

    // ============================================
    // Propose Institution Tests
    // ============================================

    function test_ProposeInstitution_Success() public {
        vm.expectEmit(true, true, false, true);
        emit IValidatorConsensus.InstitutionProposed(
            0,
            institution1,
            "Test University",
            proposer,
            block.timestamp
        );

        uint256 proposalId = consensus.proposeInstitution(
            institution1,
            "Test University",
            docHash1
        );

        assertEq(proposalId, 0);

        IValidatorConsensus.InstitutionProposal memory proposal = consensus.getProposal(
            proposalId
        );

        assertEq(proposal.institutionAddress, institution1);
        assertEq(proposal.name, "Test University");
        assertEq(proposal.documentHash, docHash1);
        assertEq(proposal.proposer, address(this));
        assertEq(proposal.approvalCount, 0);
        assertEq(proposal.totalValidatorsAtProposal, 3);
        assertFalse(proposal.executed);
        assertFalse(proposal.rejected);
    }

    function test_ProposeInstitution_RevertZeroAddress() public {
        vm.expectRevert(Errors.ZeroAddress.selector);
        consensus.proposeInstitution(address(0), "Test University", docHash1);
    }

    function test_ProposeInstitution_RevertEmptyName() public {
        vm.expectRevert(Errors.EmptyString.selector);
        consensus.proposeInstitution(institution1, "", docHash1);
    }

    function test_ProposeInstitution_RevertZeroDocHash() public {
        vm.expectRevert(Errors.InvalidInput.selector);
        consensus.proposeInstitution(institution1, "Test University", bytes32(0));
    }

    function test_ProposeInstitution_RevertAlreadyRegistered() public {
        // Create and execute a proposal
        uint256 proposalId = consensus.proposeInstitution(
            institution1,
            "Test University",
            docHash1
        );

        // All validators vote
        vm.prank(validator1);
        consensus.voteForInstitution(proposalId);
        vm.prank(validator2);
        consensus.voteForInstitution(proposalId);
        vm.prank(validator3);
        consensus.voteForInstitution(proposalId);

        // Try to propose the same institution again
        vm.expectRevert(
            abi.encodeWithSelector(Errors.InstitutionAlreadyRegistered.selector, institution1)
        );
        consensus.proposeInstitution(institution1, "Test University 2", docHash2);
    }

    // ============================================
    // Vote Tests
    // ============================================

    function test_VoteForInstitution_Success() public {
        uint256 proposalId = consensus.proposeInstitution(
            institution1,
            "Test University",
            docHash1
        );

        vm.prank(validator1);
        vm.expectEmit(true, true, false, true);
        emit IValidatorConsensus.VoteCast(proposalId, validator1, block.timestamp);
        consensus.voteForInstitution(proposalId);

        assertTrue(consensus.hasVoted(proposalId, validator1));

        IValidatorConsensus.InstitutionProposal memory proposal = consensus.getProposal(
            proposalId
        );
        assertEq(proposal.approvalCount, 1);
    }

    function test_VoteForInstitution_RevertNotValidator() public {
        uint256 proposalId = consensus.proposeInstitution(
            institution1,
            "Test University",
            docHash1
        );

        vm.prank(proposer);
        vm.expectRevert();
        consensus.voteForInstitution(proposalId);
    }

    function test_VoteForInstitution_RevertProposalNotFound() public {
        vm.prank(validator1);
        vm.expectRevert(abi.encodeWithSelector(Errors.ProposalNotFound.selector, 999));
        consensus.voteForInstitution(999);
    }

    function test_VoteForInstitution_RevertAlreadyVoted() public {
        uint256 proposalId = consensus.proposeInstitution(
            institution1,
            "Test University",
            docHash1
        );

        vm.startPrank(validator1);
        consensus.voteForInstitution(proposalId);

        vm.expectRevert(abi.encodeWithSelector(Errors.AlreadyVoted.selector, proposalId, validator1));
        consensus.voteForInstitution(proposalId);
        vm.stopPrank();
    }

    // ============================================
    // Unanimous Approval & Execute Tests
    // ============================================

    function test_UnanimousApproval_AutoExecute() public {
        uint256 proposalId = consensus.proposeInstitution(
            institution1,
            "Test University",
            docHash1
        );

        // First two votes
        vm.prank(validator1);
        consensus.voteForInstitution(proposalId);
        vm.prank(validator2);
        consensus.voteForInstitution(proposalId);

        IValidatorConsensus.InstitutionProposal memory proposalBefore = consensus.getProposal(
            proposalId
        );
        assertFalse(proposalBefore.executed);

        // Third vote (unanimous) - should auto-execute
        vm.prank(validator3);
        vm.expectEmit(true, true, false, true);
        emit IValidatorConsensus.ProposalExecuted(
            proposalId,
            institution1,
            3,
            block.timestamp
        );
        consensus.voteForInstitution(proposalId);

        IValidatorConsensus.InstitutionProposal memory proposalAfter = consensus.getProposal(
            proposalId
        );
        assertTrue(proposalAfter.executed);
        assertTrue(consensus.isInstitutionRegistered(institution1));
        assertTrue(consensus.hasRole(Roles.CERTIFICATE_ISSUER, institution1));
    }

    function test_ExecuteProposal_Success() public {
        uint256 proposalId = consensus.proposeInstitution(
            institution1,
            "Test University",
            docHash1
        );

        // All validators vote
        vm.prank(validator1);
        consensus.voteForInstitution(proposalId);
        vm.prank(validator2);
        consensus.voteForInstitution(proposalId);
        vm.prank(validator3);
        consensus.voteForInstitution(proposalId);

        // Should already be executed by auto-execute
        IValidatorConsensus.InstitutionProposal memory proposal = consensus.getProposal(
            proposalId
        );
        assertTrue(proposal.executed);
    }

    function test_ExecuteProposal_RevertNotUnanimous() public {
        uint256 proposalId = consensus.proposeInstitution(
            institution1,
            "Test University",
            docHash1
        );

        // Only one vote
        vm.prank(validator1);
        consensus.voteForInstitution(proposalId);

        vm.expectRevert(Errors.UnanimousApprovalRequired.selector);
        consensus.executeProposal(proposalId);
    }

    function test_ExecuteProposal_RevertAlreadyExecuted() public {
        uint256 proposalId = consensus.proposeInstitution(
            institution1,
            "Test University",
            docHash1
        );

        // All validators vote (auto-executes)
        vm.prank(validator1);
        consensus.voteForInstitution(proposalId);
        vm.prank(validator2);
        consensus.voteForInstitution(proposalId);
        vm.prank(validator3);
        consensus.voteForInstitution(proposalId);

        vm.expectRevert(abi.encodeWithSelector(Errors.ProposalAlreadyExecuted.selector, proposalId));
        consensus.executeProposal(proposalId);
    }

    // ============================================
    // Reject Proposal Tests
    // ============================================

    function test_RejectProposal_Success() public {
        uint256 proposalId = consensus.proposeInstitution(
            institution1,
            "Test University",
            docHash1
        );

        vm.prank(admin);
        vm.expectEmit(true, false, false, true);
        emit IValidatorConsensus.ProposalRejected(proposalId, "Fraud detected", block.timestamp);
        consensus.rejectProposal(proposalId, "Fraud detected");

        IValidatorConsensus.InstitutionProposal memory proposal = consensus.getProposal(
            proposalId
        );
        assertTrue(proposal.rejected);
    }

    function test_RejectProposal_RevertNotAdmin() public {
        uint256 proposalId = consensus.proposeInstitution(
            institution1,
            "Test University",
            docHash1
        );

        vm.prank(validator1);
        vm.expectRevert();
        consensus.rejectProposal(proposalId, "Reason");
    }

    // ============================================
    // Validator Management Tests
    // ============================================

    function test_AddValidator_Success() public {
        address newValidator = address(0x99);

        vm.prank(admin);
        vm.expectEmit(true, false, false, true);
        emit IValidatorConsensus.ValidatorAdded(newValidator, block.timestamp);
        consensus.addValidator(newValidator);

        assertTrue(consensus.isValidator(newValidator));
        assertEq(consensus.getValidatorCount(), 4);
    }

    function test_AddValidator_RevertZeroAddress() public {
        vm.prank(admin);
        vm.expectRevert(Errors.ZeroAddress.selector);
        consensus.addValidator(address(0));
    }

    function test_AddValidator_RevertAlreadyExists() public {
        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(Errors.ValidatorAlreadyExists.selector, validator1));
        consensus.addValidator(validator1);
    }

    function test_RemoveValidator_Success() public {
        vm.prank(admin);
        vm.expectEmit(true, false, false, true);
        emit IValidatorConsensus.ValidatorRemoved(validator1, block.timestamp);
        consensus.removeValidator(validator1);

        assertFalse(consensus.isValidator(validator1));
        assertEq(consensus.getValidatorCount(), 2);
    }

    function test_RemoveValidator_RevertNotFound() public {
        address nonValidator = address(0x99);

        vm.prank(admin);
        vm.expectRevert(abi.encodeWithSelector(Errors.ValidatorNotFound.selector, nonValidator));
        consensus.removeValidator(nonValidator);
    }

    // ============================================
    // View Function Tests
    // ============================================

    function test_GetValidators() public {
        address[] memory validators = consensus.getValidators();
        assertEq(validators.length, 3);
        assertEq(validators[0], validator1);
        assertEq(validators[1], validator2);
        assertEq(validators[2], validator3);
    }

    function test_GetProposalCount() public {
        assertEq(consensus.getProposalCount(), 0);

        consensus.proposeInstitution(institution1, "Test University 1", docHash1);
        assertEq(consensus.getProposalCount(), 1);

        consensus.proposeInstitution(institution2, "Test University 2", docHash2);
        assertEq(consensus.getProposalCount(), 2);
    }

    function test_HasUnanimousApproval() public {
        uint256 proposalId = consensus.proposeInstitution(
            institution1,
            "Test University",
            docHash1
        );

        assertFalse(consensus.hasUnanimousApproval(proposalId));

        vm.prank(validator1);
        consensus.voteForInstitution(proposalId);
        assertFalse(consensus.hasUnanimousApproval(proposalId));

        vm.prank(validator2);
        consensus.voteForInstitution(proposalId);
        assertFalse(consensus.hasUnanimousApproval(proposalId));

        vm.prank(validator3);
        consensus.voteForInstitution(proposalId);

        // After execution, should return false
        assertFalse(consensus.hasUnanimousApproval(proposalId));
    }

    function test_GetProposalVotes() public {
        uint256 proposalId = consensus.proposeInstitution(
            institution1,
            "Test University",
            docHash1
        );

        // Vote with validator1 and validator2
        vm.prank(validator1);
        consensus.voteForInstitution(proposalId);
        vm.prank(validator2);
        consensus.voteForInstitution(proposalId);

        address[] memory validatorList = new address[](3);
        validatorList[0] = validator1;
        validatorList[1] = validator2;
        validatorList[2] = validator3;

        bool[] memory voted = consensus.getProposalVotes(proposalId, validatorList);

        assertTrue(voted[0]); // validator1 voted
        assertTrue(voted[1]); // validator2 voted
        assertFalse(voted[2]); // validator3 didn't vote yet
    }
}
