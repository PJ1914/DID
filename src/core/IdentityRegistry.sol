// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IIdentityRegistry} from "../interfaces/IIdentityRegistry.sol";
import {ITrustScore} from "../interfaces/ITrustScore.sol";
import {IdentityTypes} from "../libs/IdentityTypes.sol";
import {Roles} from "../libs/Roles.sol";
import {Errors} from "../libs/Errors.sol";

contract IdentityRegistry is AccessControl, IIdentityRegistry {
    using IdentityTypes for IdentityTypes.IdentityProfile;

    mapping(bytes32 => IdentityTypes.IdentityProfile) private identities;
    mapping(address => bytes32) private identityIds;

    ITrustScore public trustScore;
    uint256 private nonce;

    constructor(address admin, address trustScore_) {
        require(admin != address(0), "admin");
        require(trustScore_ != address(0), "trustScore");

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.SYSTEM_ADMIN, admin);
        _grantRole(Roles.IDENTITY_ADMIN, admin);
        trustScore = ITrustScore(trustScore_);
    }

    function registerIdentity(address owner, string calldata metadataURI)
        external
        override
        onlyRole(Roles.IDENTITY_ADMIN)
        returns (bytes32)
    {
        if (owner == address(0)) revert Errors.InvalidInput();
        if (identityIds[owner] != bytes32(0)) {
            revert Errors.IdentityAlreadyExists();
        }

        bytes32 identityId = keccak256(abi.encode(owner, block.timestamp, nonce++));
        IdentityTypes.IdentityProfile storage profile = identities[identityId];
        profile.owner = owner;
        profile.metadataURI = metadataURI;
        profile.status = IdentityTypes.IdentityStatus.Pending;
        profile.createdAt = uint64(block.timestamp);
        profile.updatedAt = uint64(block.timestamp);

        identityIds[owner] = identityId;

        emit IdentityRegistered(owner, identityId);
        return identityId;
    }

    function setIdentityStatus(bytes32 identityId, IdentityTypes.IdentityStatus status)
        external
        override
        onlyRole(Roles.IDENTITY_ADMIN)
    {
        IdentityTypes.IdentityProfile storage profile = identities[identityId];
        if (profile.owner == address(0)) revert Errors.IdentityNotFound();

        profile.status = status;
        profile.updatedAt = uint64(block.timestamp);

        emit IdentityStatusUpdated(identityId, status);
    }

    function updateMetadata(bytes32 identityId, string calldata metadataURI) external override {
        IdentityTypes.IdentityProfile storage profile = identities[identityId];
        if (profile.owner == address(0)) revert Errors.IdentityNotFound();

        bool isAdmin = hasRole(Roles.IDENTITY_ADMIN, msg.sender);
        if (!isAdmin && profile.owner != msg.sender) {
            revert Errors.NotAuthorized();
        }

        profile.metadataURI = metadataURI;
        profile.updatedAt = uint64(block.timestamp);

        emit IdentityMetadataUpdated(identityId, metadataURI);
    }

    function getIdentity(bytes32 identityId) external view override returns (IdentityTypes.IdentityProfile memory) {
        IdentityTypes.IdentityProfile memory profile = identities[identityId];
        if (profile.owner == address(0)) revert Errors.IdentityNotFound();

        profile.trustScore = uint96(trustScore.getScore(identityId));
        return profile;
    }

    function resolveIdentity(address owner) external view override returns (bytes32 identityId) {
        identityId = identityIds[owner];
        if (identityId == bytes32(0)) revert Errors.IdentityNotFound();
    }

    function setTrustScoreContract(address newTrustScore) external onlyRole(Roles.SYSTEM_ADMIN) {
        require(newTrustScore != address(0), "trustScore");
        trustScore = ITrustScore(newTrustScore);
    }
}
