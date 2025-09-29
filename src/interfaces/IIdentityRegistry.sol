// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IdentityTypes} from "../libs/IdentityTypes.sol";

interface IIdentityRegistry {
    event IdentityRegistered(address indexed owner, bytes32 indexed identityId);
    event IdentityStatusUpdated(bytes32 indexed identityId, IdentityTypes.IdentityStatus status);
    event IdentityMetadataUpdated(bytes32 indexed identityId, string metadataURI);

    function registerIdentity(address owner, string calldata metadataURI) external returns (bytes32);

    function setIdentityStatus(bytes32 identityId, IdentityTypes.IdentityStatus status) external;

    function updateMetadata(bytes32 identityId, string calldata metadataURI) external;

    function getIdentity(bytes32 identityId) external view returns (IdentityTypes.IdentityProfile memory);

    function resolveIdentity(address owner) external view returns (bytes32 identityId);
}
