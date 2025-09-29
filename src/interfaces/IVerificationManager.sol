// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {VerificationTypes} from "../libs/VerificationTypes.sol";

interface IVerificationManager {
    event ProviderRegistered(address indexed provider, string name);
    event ProviderStatusChanged(address indexed provider, bool active);
    event VerificationRecorded(bytes32 indexed verificationId, bytes32 indexed identityId, bytes32 templateId);
    event VerificationStatusChanged(bytes32 indexed verificationId, VerificationTypes.VerificationStatus status);

    function registerProvider(address provider, string calldata name, string calldata metadataURI) external;

    function setProviderStatus(address provider, bool active, string calldata metadataURI) external;

    function recordVerification(bytes32 identityId, bytes32 templateId, string calldata evidenceURI, uint64 expiresAt)
        external
        returns (bytes32);

    function recordAadhaarVerification(bytes32 identityId, string calldata evidenceURI, uint64 expiresAt)
        external
        returns (bytes32);

    function recordFaceVerification(bytes32 identityId, string calldata evidenceURI, uint64 expiresAt)
        external
        returns (bytes32);

    function recordIncomeVerification(bytes32 identityId, string calldata evidenceURI, uint64 expiresAt)
        external
        returns (bytes32);

    function setVerificationStatus(bytes32 verificationId, VerificationTypes.VerificationStatus status) external;

    function getVerification(bytes32 verificationId)
        external
        view
        returns (VerificationTypes.VerificationRecord memory);

    function getProvider(address provider) external view returns (VerificationTypes.Provider memory);
}
