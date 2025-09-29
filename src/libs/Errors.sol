// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library Errors {
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
    error DisputeNotFound();
    error InvalidStateTransition();
    error InsufficientTrustScore();
}
