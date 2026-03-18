// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IValidatorConsensus
 * @notice Interface for the Sajjan Validator Consensus mechanism
 * @dev Manages institutional onboarding with 100% validator approval requirement
 */
interface IValidatorConsensus {
    /// @notice Emitted when a new institution proposal is created
    event InstitutionProposed(
        uint256 indexed proposalId,
        address indexed institutionAddress,
        string name,
        address indexed proposer,
        uint256 timestamp
    );

    /// @notice Emitted when a validator votes on a proposal
    event VoteCast(
        uint256 indexed proposalId,
        address indexed validator,
        uint256 timestamp
    );

    /// @notice Emitted when a proposal is approved and executed
    event ProposalExecuted(
        uint256 indexed proposalId,
        address indexed institutionAddress,
        uint256 approvalCount,
        uint256 timestamp
    );

    /// @notice Emitted when a proposal is rejected or expired
    event ProposalRejected(
        uint256 indexed proposalId,
        string reason,
        uint256 timestamp
    );

    /// @notice Emitted when a new validator is added
    event ValidatorAdded(address indexed validator, uint256 timestamp);

    /// @notice Emitted when a validator is removed
    event ValidatorRemoved(address indexed validator, uint256 timestamp);

    /**
     * @notice Institution proposal structure
     * @param institutionAddress Wallet address of the institution
     * @param name Name of the institution
     * @param documentHash Off-chain documentation hash (KYC/verification)
     * @param proposer Address that created the proposal
     * @param approvalCount Number of validators who approved
     * @param totalValidatorsAtProposal Total validators when proposal was created
     * @param createdAt Timestamp of proposal creation
     * @param executed Whether the proposal has been executed
     * @param rejected Whether the proposal was rejected
     */
    struct InstitutionProposal {
        address institutionAddress;
        string name;
        bytes32 documentHash;
        address proposer;
        uint256 approvalCount;
        uint256 totalValidatorsAtProposal;
        uint256 createdAt;
        bool executed;
        bool rejected;
    }

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
    ) external returns (uint256 proposalId);

    /**
     * @notice Vote to approve an institution proposal
     * @param _proposalId ID of the proposal to vote on
     */
    function voteForInstitution(uint256 _proposalId) external;

    /**
     * @notice Execute a fully approved proposal
     * @param _proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 _proposalId) external;

    /**
     * @notice Reject a proposal (admin only, emergency use)
     * @param _proposalId ID of the proposal to reject
     * @param _reason Reason for rejection
     */
    function rejectProposal(uint256 _proposalId, string memory _reason)
        external;

    /**
     * @notice Add a new validator (admin only)
     * @param _validator Address of the new validator
     */
    function addValidator(address _validator) external;

    /**
     * @notice Remove a validator (admin only)
     * @param _validator Address of the validator to remove
     */
    function removeValidator(address _validator) external;

    /**
     * @notice Get proposal details
     * @param _proposalId ID of the proposal
     * @return proposal Proposal structure
     */
    function getProposal(uint256 _proposalId)
        external
        view
        returns (InstitutionProposal memory proposal);

    /**
     * @notice Check if an address has voted on a proposal
     * @param _proposalId ID of the proposal
     * @param _validator Address of the validator
     * @return hasVoted Whether the validator has voted
     */
    function hasVoted(uint256 _proposalId, address _validator)
        external
        view
        returns (bool hasVoted);

    /**
     * @notice Check if an address is a validator
     * @param _address Address to check
     * @return isValidator Whether the address is a validator
     */
    function isValidator(address _address)
        external
        view
        returns (bool isValidator);

    /**
     * @notice Get all validator addresses
     * @return validators Array of validator addresses
     */
    function getValidators() external view returns (address[] memory validators);

    /**
     * @notice Get total number of validators
     * @return count Total validator count
     */
    function getValidatorCount() external view returns (uint256 count);

    /**
     * @notice Get total number of proposals
     * @return count Total proposal count
     */
    function getProposalCount() external view returns (uint256 count);

    /**
     * @notice Check if proposal has unanimous approval
     * @param _proposalId ID of the proposal
     * @return isUnanimous Whether all validators have approved
     */
    function hasUnanimousApproval(uint256 _proposalId)
        external
        view
        returns (bool isUnanimous);
}
