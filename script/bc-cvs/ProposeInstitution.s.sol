// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Script.sol";
import "../../lib/forge-std/src/console2.sol";
import {ValidatorConsensus} from "../../src/bc-cvs/ValidatorConsensus.sol";
import {IValidatorConsensus} from "../../src/bc-cvs/interfaces/IValidatorConsensus.sol";

/**
 * @title ProposeInstitution
 * @notice Script to propose a new institution for onboarding
 * @dev Usage: forge script script/bc-cvs/ProposeInstitution.s.sol:ProposeInstitution --rpc-url $RPC_URL --private-key-env PRIVATE_KEY --broadcast
 * 
 * Environment Variables:
 * - VALIDATOR_CONSENSUS_ADDRESS: Address of ValidatorConsensus contract
 * - INSTITUTION_ADDRESS: Address of institution to propose
 * - INSTITUTION_NAME: Name of institution (e.g., "Harvard University")
 * - DOCUMENT_HASH: Hash of supporting documents (bytes32)
 */
contract ProposeInstitution is Script {
    function run() external {
        uint256 proposerKey = vm.envUint("PRIVATE_KEY");
        address proposer = vm.addr(proposerKey);

        address consensusAddress = vm.envAddress("VALIDATOR_CONSENSUS_ADDRESS");
        address institutionAddress = vm.envAddress("INSTITUTION_ADDRESS");
        string memory institutionName = vm.envString("INSTITUTION_NAME");
        bytes32 documentHash = vm.envBytes32("DOCUMENT_HASH");

        ValidatorConsensus consensus = ValidatorConsensus(consensusAddress);

        console2.log("==============================================");
        console2.log("Proposing New Institution");
        console2.log("==============================================");
        console2.log("Proposer:", proposer);
        console2.log("ValidatorConsensus:", consensusAddress);
        console2.log("Institution Address:", institutionAddress);
        console2.log("Institution Name:", institutionName);
        console2.log("Document Hash:", vm.toString(documentHash));
        console2.log("");

        vm.startBroadcast(proposerKey);

        uint256 proposalId = consensus.proposeInstitution(
            institutionAddress,
            institutionName,
            documentHash
        );

        console2.log("[SUCCESS] Proposal created!");
        console2.log("  Proposal ID:", proposalId);

        vm.stopBroadcast();

        // Display proposal details
        IValidatorConsensus.InstitutionProposal memory proposal = consensus.getProposal(proposalId);
        
        console2.log("");
        console2.log("Proposal Details:");
        console2.log("----------------------------");
        console2.log("  ID:", proposalId);
        console2.log("  Institution:", proposal.institutionAddress);
        console2.log("  Name:", proposal.name);
        console2.log("  Proposer:", proposal.proposer);
        console2.log("  Approval Count:", proposal.approvalCount);
        console2.log("  Required Votes:", proposal.totalValidatorsAtProposal);
        console2.log("  Executed:", proposal.executed);
        console2.log("  Rejected:", proposal.rejected);
        console2.log("");
        console2.log("Next Steps:");
        console2.log("  1. Validators must vote using VoteForInstitution.s.sol");
        console2.log("  2. Requires 100% unanimous approval (", proposal.totalValidatorsAtProposal, " votes)");
        console2.log("  3. Proposal auto-executes upon final vote");
        console2.log("==============================================");
    }
}

/**
 * @title VoteForInstitution
 * @notice Script for validators to vote on institution proposals
 * @dev Usage: forge script script/bc-cvs/ProposeInstitution.s.sol:VoteForInstitution --rpc-url $RPC_URL --private-key-env PRIVATE_KEY --broadcast
 * 
 * Environment Variables:
 * - VALIDATOR_CONSENSUS_ADDRESS: Address of ValidatorConsensus contract
 * - PROPOSAL_ID: ID of proposal to vote on
 */
contract VoteForInstitution is Script {
    function run() external {
        uint256 validatorKey = vm.envUint("PRIVATE_KEY");
        address validator = vm.addr(validatorKey);

        address consensusAddress = vm.envAddress("VALIDATOR_CONSENSUS_ADDRESS");
        uint256 proposalId = vm.envUint("PROPOSAL_ID");

        ValidatorConsensus consensus = ValidatorConsensus(consensusAddress);

        console2.log("==============================================");
        console2.log("Voting on Institution Proposal");
        console2.log("==============================================");
        console2.log("Validator:", validator);
        console2.log("ValidatorConsensus:", consensusAddress);
        console2.log("Proposal ID:", proposalId);
        console2.log("");

        // Display proposal before voting
        IValidatorConsensus.InstitutionProposal memory proposal = consensus.getProposal(proposalId);
        console2.log("Proposal Details:");
        console2.log("  Institution:", proposal.institutionAddress);
        console2.log("  Name:", proposal.name);
        console2.log("  Current Votes:", proposal.approvalCount, "/", proposal.totalValidatorsAtProposal);
        console2.log("");

        // Check if already voted
        if (consensus.hasVoted(proposalId, validator)) {
            console2.log("[ERROR] Validator has already voted on this proposal");
            return;
        }

        vm.startBroadcast(validatorKey);

        consensus.voteForInstitution(proposalId);
        console2.log("[SUCCESS] Vote cast!");

        vm.stopBroadcast();

        // Display updated proposal
        IValidatorConsensus.InstitutionProposal memory updatedProposal = consensus.getProposal(proposalId);
        
        console2.log("");
        console2.log("Updated Status:");
        console2.log("  Current Votes:", updatedProposal.approvalCount, "/", updatedProposal.totalValidatorsAtProposal);
        console2.log("  Executed:", updatedProposal.executed);
        
        if (updatedProposal.executed) {
            console2.log("");
            console2.log("🎉 PROPOSAL EXECUTED!");
            console2.log("  Institution", updatedProposal.institutionAddress, "is now onboarded");
            console2.log("  Can now issue certificates through CertificateHashRegistry");
        } else {
            uint256 votesNeeded = updatedProposal.totalValidatorsAtProposal - updatedProposal.approvalCount;
            console2.log("  Votes still needed:", votesNeeded);
        }
        
        console2.log("==============================================");
    }
}

/**
 * @title RejectProposal
 * @notice Script for admin to reject a proposal (e.g., fraud detected)
 * @dev Usage: forge script script/bc-cvs/ProposeInstitution.s.sol:RejectProposal --rpc-url $RPC_URL --private-key-env PRIVATE_KEY --broadcast
 * 
 * Environment Variables:
 * - VALIDATOR_CONSENSUS_ADDRESS: Address of ValidatorConsensus contract
 * - PROPOSAL_ID: ID of proposal to reject
 * - REJECTION_REASON: Reason for rejection
 */
contract RejectProposal is Script {
    function run() external {
        uint256 adminKey = vm.envUint("PRIVATE_KEY");
        address admin = vm.addr(adminKey);

        address consensusAddress = vm.envAddress("VALIDATOR_CONSENSUS_ADDRESS");
        uint256 proposalId = vm.envUint("PROPOSAL_ID");
        string memory reason = vm.envString("REJECTION_REASON");

        ValidatorConsensus consensus = ValidatorConsensus(consensusAddress);

        console2.log("==============================================");
        console2.log("Rejecting Institution Proposal");
        console2.log("==============================================");
        console2.log("Admin:", admin);
        console2.log("ValidatorConsensus:", consensusAddress);
        console2.log("Proposal ID:", proposalId);
        console2.log("Reason:", reason);
        console2.log("");

        vm.startBroadcast(adminKey);

        consensus.rejectProposal(proposalId, reason);
        console2.log("[SUCCESS] Proposal rejected!");

        vm.stopBroadcast();

        console2.log("==============================================");
    }
}
