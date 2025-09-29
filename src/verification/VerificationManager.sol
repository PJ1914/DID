// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IIdentityRegistry} from "../interfaces/IIdentityRegistry.sol";
import {IVerificationManager} from "../interfaces/IVerificationManager.sol";
import {ITrustScore} from "../interfaces/ITrustScore.sol";
import {VerificationTypes} from "../libs/VerificationTypes.sol";
import {IdentityTypes} from "../libs/IdentityTypes.sol";
import {Roles} from "../libs/Roles.sol";
import {Errors} from "../libs/Errors.sol";

contract VerificationManager is AccessControl, IVerificationManager {
    using VerificationTypes for VerificationTypes.VerificationRecord;

    IIdentityRegistry public immutable IDENTITY_REGISTRY;
    ITrustScore public trustScore;

    mapping(address => VerificationTypes.Provider) private providers;
    mapping(bytes32 => VerificationTypes.VerificationRecord) private verifications;

    uint256 private verificationNonce;

    constructor(address admin, address identityRegistry_, address trustScore_) {
        require(admin != address(0), "admin");
        require(identityRegistry_ != address(0), "identityRegistry");
        require(trustScore_ != address(0), "trustScore");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.SYSTEM_ADMIN, admin);
        _grantRole(Roles.IDENTITY_ADMIN, admin);

        IDENTITY_REGISTRY = IIdentityRegistry(identityRegistry_);
        trustScore = ITrustScore(trustScore_);
    }

    function registerProvider(address provider, string calldata name, string calldata metadataURI)
        external
        override
        onlyRole(Roles.SYSTEM_ADMIN)
    {
        if (provider == address(0)) revert Errors.InvalidInput();

        VerificationTypes.Provider storage record = providers[provider];
        record.name = name;
        record.metadataURI = metadataURI;
        record.active = true;
        record.addedAt = uint64(block.timestamp);

        _grantRole(Roles.VERIFICATION_PROVIDER, provider);
        emit ProviderRegistered(provider, name);
    }

    function setProviderStatus(address provider, bool active, string calldata metadataURI)
        external
        override
        onlyRole(Roles.SYSTEM_ADMIN)
    {
        VerificationTypes.Provider storage record = providers[provider];
        if (record.addedAt == 0) revert Errors.VerificationProviderNotFound();
        record.active = active;
        record.metadataURI = metadataURI;

        if (!active) {
            _revokeRole(Roles.VERIFICATION_PROVIDER, provider);
        } else if (!hasRole(Roles.VERIFICATION_PROVIDER, provider)) {
            _grantRole(Roles.VERIFICATION_PROVIDER, provider);
        }

        emit ProviderStatusChanged(provider, active);
    }

    function recordVerification(bytes32 identityId, bytes32 templateId, string calldata evidenceURI, uint64 expiresAt)
        external
        override
        onlyRole(Roles.VERIFICATION_PROVIDER)
        returns (bytes32)
    {
        return _recordVerification(identityId, templateId, evidenceURI, expiresAt);
    }

    function recordAadhaarVerification(bytes32 identityId, string calldata evidenceURI, uint64 expiresAt)
        external
        override
        onlyRole(Roles.VERIFICATION_PROVIDER)
        returns (bytes32)
    {
        return _recordVerification(identityId, VerificationTypes.aadhaarTemplateId(), evidenceURI, expiresAt);
    }

    function recordFaceVerification(bytes32 identityId, string calldata evidenceURI, uint64 expiresAt)
        external
        override
        onlyRole(Roles.VERIFICATION_PROVIDER)
        returns (bytes32)
    {
        return _recordVerification(identityId, VerificationTypes.faceTemplateId(), evidenceURI, expiresAt);
    }

    function recordIncomeVerification(bytes32 identityId, string calldata evidenceURI, uint64 expiresAt)
        external
        override
        onlyRole(Roles.VERIFICATION_PROVIDER)
        returns (bytes32)
    {
        return _recordVerification(identityId, VerificationTypes.incomeTemplateId(), evidenceURI, expiresAt);
    }

    function setVerificationStatus(bytes32 verificationId, VerificationTypes.VerificationStatus status)
        external
        override
    {
        VerificationTypes.VerificationRecord storage record = verifications[verificationId];
        if (record.id == bytes32(0)) revert Errors.VerificationRecordNotFound();

        bool isAdmin = hasRole(Roles.SYSTEM_ADMIN, msg.sender);
        if (!isAdmin && msg.sender != record.provider) {
            revert Errors.NotAuthorized();
        }

        record.status = status;
        emit VerificationStatusChanged(verificationId, status);

        if (status == VerificationTypes.VerificationStatus.Rejected) {
            trustScore.decreaseScore(record.identityId, 5, "Verification rejected");
        }
    }

    function getVerification(bytes32 verificationId)
        external
        view
        override
        returns (VerificationTypes.VerificationRecord memory)
    {
        VerificationTypes.VerificationRecord memory record = verifications[verificationId];
        if (record.id == bytes32(0)) revert Errors.VerificationRecordNotFound();
        return record;
    }

    function getProvider(address provider) external view override returns (VerificationTypes.Provider memory) {
        VerificationTypes.Provider memory record = providers[provider];
        if (record.addedAt == 0) revert Errors.VerificationProviderNotFound();
        return record;
    }

    function setTrustScore(address newTrustScore) external onlyRole(Roles.SYSTEM_ADMIN) {
        require(newTrustScore != address(0), "trustScore");
        trustScore = ITrustScore(newTrustScore);
    }

    function _recordVerification(bytes32 identityId, bytes32 templateId, string calldata evidenceURI, uint64 expiresAt)
        internal
        returns (bytes32)
    {
        VerificationTypes.Provider memory provider = providers[msg.sender];
        if (!provider.active) revert Errors.VerificationProviderNotFound();
        if (identityId == bytes32(0) || templateId == bytes32(0)) {
            revert Errors.InvalidInput();
        }

        IdentityTypes.IdentityProfile memory profile = IDENTITY_REGISTRY.getIdentity(identityId);
        if (
            profile.status != IdentityTypes.IdentityStatus.Active
                && profile.status != IdentityTypes.IdentityStatus.Pending
        ) {
            revert Errors.IdentityInactive();
        }

        bytes32 verificationId =
            keccak256(abi.encode(identityId, templateId, msg.sender, block.timestamp, verificationNonce++));

        VerificationTypes.VerificationRecord storage record = verifications[verificationId];
        record.id = verificationId;
        record.identityId = identityId;
        record.templateId = templateId;
        record.provider = msg.sender;
        record.status = VerificationTypes.VerificationStatus.Approved;
        record.evidenceURI = evidenceURI;
        record.issuedAt = uint64(block.timestamp);
        record.expiresAt = expiresAt;

        emit VerificationRecorded(verificationId, identityId, templateId);

        trustScore.increaseScore(identityId, 10, "Verification approved");
        return verificationId;
    }
}
