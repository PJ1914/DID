// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {OrganizationTypes} from "../libs/OrganizationTypes.sol";

interface IOrganizationManager {
    event OrganizationRegistered(bytes32 indexed organizationId, string name);
    event OrganizationStatusChanged(bytes32 indexed organizationId, OrganizationTypes.OrganizationStatus status);
    event OrganizationMetadataUpdated(bytes32 indexed organizationId, string metadataURI);
    event MemberRoleAssigned(bytes32 indexed organizationId, address indexed account, bytes32 role);
    event MemberRoleRevoked(bytes32 indexed organizationId, address indexed account, bytes32 role);

    function registerOrganization(string calldata name, string calldata metadataURI) external returns (bytes32);

    function setOrganizationStatus(bytes32 organizationId, OrganizationTypes.OrganizationStatus status) external;

    function updateOrganizationMetadata(bytes32 organizationId, string calldata metadataURI) external;

    function assignRole(bytes32 organizationId, address account, bytes32 role) external;

    function revokeRole(bytes32 organizationId, address account, bytes32 role) external;

    function getOrganization(bytes32 organizationId) external view returns (OrganizationTypes.Organization memory);

    function hasOrganizationRole(bytes32 organizationId, address account, bytes32 role) external view returns (bool);
}
