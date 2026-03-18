// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library Errors {
    // Legacy DID System Errors
    error NotAuthorized();
    error InvalidInput();
    error IdentityAlreadyExists();
    error IdentityNotFound();
    error IdentityInactive();
    error OrganizationAlreadyExists();
    error OrganizationNotFound();
    error VerificationProviderNotFound();
    error VerificationRecordNotFound();
    error DuplicateVerification();
    error InsufficientTrustScore();

    // Sajjan Certificate Hash Registry Errors
    error CertificateAlreadyExists(bytes32 certificateHash);
    error CertificateNotFound(bytes32 certificateHash);
    error CertificateAlreadyRevoked(bytes32 certificateHash);
    error CertificateNotRevoked(bytes32 certificateHash);
    error NotCertificateIssuer(address caller, address issuer);
    error NotAuthorizedIssuer(address caller);
    error InvalidCertificateHash();
    error InvalidRSASignature();
    error InvalidHolder(address holder);

    // Sajjan Validator Consensus Errors
    error ProposalNotFound(uint256 proposalId);
    error ProposalAlreadyExecuted(uint256 proposalId);
    error ProposalAlreadyRejected(uint256 proposalId);
    error ProposalNotApproved(uint256 proposalId);
    error AlreadyVoted(uint256 proposalId, address validator);
    error NotValidator(address caller);
    error ValidatorAlreadyExists(address validator);
    error ValidatorNotFound(address validator);
    error InstitutionAlreadyRegistered(address institution);
    error InsufficientApprovals(uint256 current, uint256 required);
    error UnanimousApprovalRequired();

    // Sajjan Bloom Filter Errors
    error BloomFilterFull();
    error InvalidBitIndex(uint256 index);
    error EmptyBatchOperation();

    // Sajjan Revocation Registry Errors
    error AlreadyRevoked(bytes32 certificateHash);
    error NotRevoked(bytes32 certificateHash);
    error AlreadyCorrected(bytes32 certificateHash);
    error ReplacementHashAlreadyExists(bytes32 replacementHash);

    // General Sajjan Errors
    error ZeroAddress();
    error EmptyString();
    error ArrayLengthMismatch();
    error OperationFailed(string reason);
}
