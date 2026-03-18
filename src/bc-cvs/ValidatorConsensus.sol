// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/IValidatorConsensus.sol";
import "../../libs/Roles.sol";
import "../../libs/Errors.sol";

/**
 * @title ValidatorConsensus
 * @notice Sajjan Validator Consensus implementation for institutional governance
 * @dev Implements 100% unanimous approval requirement for new institution onboarding
 * @dev Prevents Sybil attacks through strict validator-based governance
 */
contract ValidatorConsensus is IValidatorConsensus, AccessControl {
    // ============================================
    // State Variables
    // ============================================

    struct ProposalVotes {
        mapping(address => bool) hasVoted;
    }

    mapping(uint256 => InstitutionProposal) private proposals;
    mapping(uint256 => ProposalVotes) private proposalVotes;
    mapping(address => bool) private validatorMapping;
    mapping(address => bool) private registeredInstitutions;

    address[] private validators;
    uint256 private proposalCount;

    // Constants
    uint256 private constant MAX_NAME_LENGTH = 256;
    uint256 private constant PROPOSAL_EXPIRY = 30 days;

    // ============================================
    // Constructor
    // ============================================

    /// @notice Constructor initializes the contract with admin and initial validators
    /// @param _admin Address of the administrator
    /// @param _initialValidators Array of initial validator addresses
    constructor(address _admin, address[] memory _initialValidators) {
        if (_admin == address(0)) revert Errors.ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(Roles.ADMINISTRATOR, _admin);

        // Add initial validators
        for (uint256 i = 0; i < _initialValidators.length; i++) {
            if (_initialValidators[i] == address(0)) revert Errors.ZeroAddress();
            if (validatorMapping[_initialValidators[i]])
                revert Errors.ValidatorAlreadyExists(_initialValidators[i]);

            validators.push(_initialValidators[i]);
            validatorMapping[_initialValidators[i]] = true;
            _grantRole(Roles.VALIDATOR_INSTITUTION, _initialValidators[i]);

            emit ValidatorAdded(_initialValidators[i], block.timestamp);
        }
    }

    // ============================================
    // External Functions
    // ============================================

    /**
     * @notice Propose a new institution for registration
     * @param _institutionAddress Address of the institution
     * @param _name Name of the institution
     * @param _documentHash Hash of off-chain verification documents
     * @return proposalId ID of the created proposal
     */
    function proposeInstitution(
        address _institutionAddress,
        string memory _name,
        bytes32 _documentHash
    ) external override returns (uint256 proposalId) {
        // Input validation
        if (_institutionAddress == address(0)) revert Errors.ZeroAddress();
        if (bytes(_name).length == 0) revert Errors.EmptyString();
        if (bytes(_name).length > MAX_NAME_LENGTH)
            revert Errors.InvalidInput();
        if (_documentHash == bytes32(0)) revert Errors.InvalidInput();

        // Check if institution already registered
        if (registeredInstitutions[_institutionAddress])
            revert Errors.InstitutionAlreadyRegistered(_institutionAddress);

        // Check if there are validators
        if (validators.length == 0) revert Errors.OperationFailed("No validators exist");

        // Create proposal
        proposalId = proposalCount++;

        proposals[proposalId] = InstitutionProposal({
            institutionAddress: _institutionAddress,
            name: _name,
            documentHash: _documentHash,
            proposer: msg.sender,
            approvalCount: 0,
            totalValidatorsAtProposal: validators.length,
            createdAt: block.timestamp,
            executed: false,
            rejected: false
        });

        emit InstitutionProposed(
            proposalId,
            _institutionAddress,
            _name,
            msg.sender,
            block.timestamp
        );

        return proposalId;
    }

    /**
     * @notice Vote to approve an institution proposal
     * @param _proposalId ID of the proposal to vote on
     */
    function voteForInstitution(uint256 _proposalId)
        external
        override
        onlyRole(Roles.VALIDATOR_INSTITUTION)
    {
        // Check if caller is validator
        if (!validatorMapping[msg.sender]) revert Errors.NotValidator(msg.sender);

        // Get proposal
        InstitutionProposal storage proposal = proposals[_proposalId];

        // Validate proposal exists
        if (proposal.createdAt == 0) revert Errors.ProposalNotFound(_proposalId);

        // Check if already executed
        if (proposal.executed)
            revert Errors.ProposalAlreadyExecuted(_proposalId);

        // Check if rejected
        if (proposal.rejected)
            revert Errors.ProposalAlreadyRejected(_proposalId);

        // Check if expired
        if (block.timestamp > proposal.createdAt + PROPOSAL_EXPIRY)
            revert Errors.OperationFailed("Proposal expired");

        // Check if already voted
        if (proposalVotes[_proposalId].hasVoted[msg.sender])
            revert Errors.AlreadyVoted(_proposalId, msg.sender);

        // Record vote
        proposalVotes[_proposalId].hasVoted[msg.sender] = true;
        proposal.approvalCount++;

        emit VoteCast(_proposalId, msg.sender, block.timestamp);

        // Auto-execute if unanimous approval reached
        if (proposal.approvalCount == proposal.totalValidatorsAtProposal) {
            _executeProposal(_proposalId);
        }
    }

    /**
     * @notice Execute a fully approved proposal
     * @param _proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 _proposalId) external override {
        InstitutionProposal storage proposal = proposals[_proposalId];

        // Validate proposal exists
        if (proposal.createdAt == 0) revert Errors.ProposalNotFound(_proposalId);

        // Check if already executed
        if (proposal.executed)
            revert Errors.ProposalAlreadyExecuted(_proposalId);

        // Check if rejected
        if (proposal.rejected)
            revert Errors.ProposalAlreadyRejected(_proposalId);

        // Check unanimous approval
        if (proposal.approvalCount != proposal.totalValidatorsAtProposal)
            revert Errors.UnanimousApprovalRequired();

        _executeProposal(_proposalId);
    }

    /**
     * @notice Reject a proposal (admin only, emergency use)
     * @param _proposalId ID of the proposal to reject
     * @param _reason Reason for rejection
     */
    function rejectProposal(uint256 _proposalId, string memory _reason)
        external
        override
        onlyRole(Roles.ADMINISTRATOR)
    {
        InstitutionProposal storage proposal = proposals[_proposalId];

        // Validate proposal exists
        if (proposal.createdAt == 0) revert Errors.ProposalNotFound(_proposalId);

        // Check if already executed
        if (proposal.executed)
            revert Errors.ProposalAlreadyExecuted(_proposalId);

        // Check if already rejected
        if (proposal.rejected)
            revert Errors.ProposalAlreadyRejected(_proposalId);

        // Validate reason
        if (bytes(_reason).length == 0) revert Errors.EmptyString();

        // Mark as rejected
        proposal.rejected = true;

        emit ProposalRejected(_proposalId, _reason, block.timestamp);
    }

    /**
     * @notice Add a new validator (admin only)
     * @param _validator Address of the new validator
     */
    function addValidator(address _validator)
        external
        override
        onlyRole(Roles.ADMINISTRATOR)
    {
        // Input validation
        if (_validator == address(0)) revert Errors.ZeroAddress();

        // Check if already a validator
        if (validatorMapping[_validator])
            revert Errors.ValidatorAlreadyExists(_validator);

        // Add validator
        validators.push(_validator);
        validatorMapping[_validator] = true;
        _grantRole(Roles.VALIDATOR_INSTITUTION, _validator);

        emit ValidatorAdded(_validator, block.timestamp);
    }

    /**
     * @notice Remove a validator (admin only)
     * @param _validator Address of the validator to remove
     */
    function removeValidator(address _validator)
        external
        override
        onlyRole(Roles.ADMINISTRATOR)
    {
        // Input validation
        if (_validator == address(0)) revert Errors.ZeroAddress();

        // Check if validator exists
        if (!validatorMapping[_validator])
            revert Errors.ValidatorNotFound(_validator);

        // Remove validator from array
        for (uint256 i = 0; i < validators.length; i++) {
            if (validators[i] == _validator) {
                validators[i] = validators[validators.length - 1];
                validators.pop();
                break;
            }
        }

        // Update mapping and role
        validatorMapping[_validator] = false;
        _revokeRole(Roles.VALIDATOR_INSTITUTION, _validator);

        emit ValidatorRemoved(_validator, block.timestamp);
    }

    // ============================================
    // View Functions
    // ============================================

    /**
     * @notice Get proposal details
     * @param _proposalId ID of the proposal
     * @return proposal Proposal structure (without mapping field)
     */
    function getProposal(uint256 _proposalId)
        external
        view
        override
        returns (InstitutionProposal memory proposal)
    {
        proposal = proposals[_proposalId];
        if (proposal.createdAt == 0) revert Errors.ProposalNotFound(_proposalId);
        return proposal;
    }

    /**
     * @notice Check if an address has voted on a proposal
     * @param _proposalId ID of the proposal
     * @param _validator Address of the validator
     * @return hasVoted Whether the validator has voted
     */
    function hasVoted(uint256 _proposalId, address _validator)
        external
        view
        override
        returns (bool)
    {
        return proposalVotes[_proposalId].hasVoted[_validator];
    }

    /**
     * @notice Check if an address is a validator
     * @param _address Address to check
     * @return isValidatorAddress Whether the address is a validator
     */
    function isValidator(address _address)
        external
        view
        override
        returns (bool isValidatorAddress)
    {
        return validatorMapping[_address];
    }

    /**
     * @notice Get all validator addresses
     * @return validatorList Array of validator addresses
     */
    function getValidators()
        external
        view
        override
        returns (address[] memory validatorList)
    {
        return validators;
    }

    /**
     * @notice Get total number of validators
     * @return count Total validator count
     */
    function getValidatorCount() external view override returns (uint256 count) {
        return validators.length;
    }

    /**
     * @notice Get total number of proposals
     * @return count Total proposal count
     */
    function getProposalCount() external view override returns (uint256 count) {
        return proposalCount;
    }

    /**
     * @notice Check if proposal has unanimous approval
     * @param _proposalId ID of the proposal
     * @return isUnanimous Whether all validators have approved
     */
    function hasUnanimousApproval(uint256 _proposalId)
        external
        view
        override
        returns (bool isUnanimous)
    {
        InstitutionProposal storage proposal = proposals[_proposalId];

        if (proposal.createdAt == 0) return false;
        if (proposal.executed || proposal.rejected) return false;

        return proposal.approvalCount == proposal.totalValidatorsAtProposal;
    }

    /**
     * @notice Check if an institution is registered
     * @param _institution Address of the institution
     * @return isRegistered Whether the institution is registered
     */
    function isInstitutionRegistered(address _institution)
        external
        view
        returns (bool isRegistered)
    {
        return registeredInstitutions[_institution];
    }

    /**
     * @notice Get proposal voting details
     * @param _proposalId ID of the proposal
     * @param _validatorList List of validators to check
     * @return voted Array of booleans indicating if each validator voted
     */
    function getProposalVotes(uint256 _proposalId, address[] memory _validatorList)
        external
        view
        returns (bool[] memory voted)
    {
        voted = new bool[](_validatorList.length);

        for (uint256 i = 0; i < _validatorList.length; i++) {
            voted[i] = proposalVotes[_proposalId].hasVoted[_validatorList[i]];
        }

        return voted;
    }

    // ============================================
    // Internal Functions
    // ============================================

    /**
     * @dev Internal function to execute an approved proposal
     * @param _proposalId ID of the proposal to execute
     */
    function _executeProposal(uint256 _proposalId) internal {
        InstitutionProposal storage proposal = proposals[_proposalId];

        // Mark as executed
        proposal.executed = true;

        // Register institution
        registeredInstitutions[proposal.institutionAddress] = true;

        // Grant CERTIFICATE_ISSUER role
        _grantRole(Roles.CERTIFICATE_ISSUER, proposal.institutionAddress);

        emit ProposalExecuted(
            _proposalId,
            proposal.institutionAddress,
            proposal.approvalCount,
            block.timestamp
        );
    }
}
