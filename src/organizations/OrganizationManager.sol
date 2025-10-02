// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IOrganizationManager} from "../interfaces/IOrganizationManager.sol";
import {OrganizationTypes} from "../libs/OrganizationTypes.sol";
import {Roles} from "../libs/Roles.sol";
import {Errors} from "../libs/Errors.sol";

contract OrganizationManager is AccessControl, IOrganizationManager {
    mapping(bytes32 => OrganizationTypes.Organization) private organizations;
    mapping(bytes32 => mapping(address => mapping(bytes32 => bool))) private organizationRoles;

    uint256 private organizationNonce;

    constructor(address admin) {
        require(admin != address(0), "admin");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.SYSTEM_ADMIN, admin);
        _grantRole(Roles.ORGANIZATION_ADMIN, admin);
    }

    function registerOrganization(string calldata name, string calldata metadataURI)
        external
        override
        onlyRole(Roles.ORGANIZATION_ADMIN)
        returns (bytes32)
    {
        if (bytes(name).length == 0) revert Errors.InvalidInput();

        bytes32 organizationId = keccak256(abi.encode(msg.sender, name, block.timestamp, organizationNonce++));
        OrganizationTypes.Organization storage org = organizations[organizationId];
        org.admin = msg.sender;
        org.name = name;
        org.metadataURI = metadataURI;
        org.status = OrganizationTypes.OrganizationStatus.Pending;
        org.createdAt = uint64(block.timestamp);
        org.updatedAt = uint64(block.timestamp);

        organizationRoles[organizationId][msg.sender][Roles.ORGANIZATION_ADMIN] = true;

        emit OrganizationRegistered(organizationId, name);
        return organizationId;
    }

    function setOrganizationStatus(bytes32 organizationId, OrganizationTypes.OrganizationStatus status)
        external
        override
        onlyRole(Roles.SYSTEM_ADMIN)
    {
        OrganizationTypes.Organization storage org = organizations[organizationId];
        if (org.createdAt == 0) revert Errors.OrganizationNotFound();
        org.status = status;
        org.updatedAt = uint64(block.timestamp);
        emit OrganizationStatusChanged(organizationId, status);
    }

    function updateOrganizationMetadata(bytes32 organizationId, string calldata metadataURI) external override {
        OrganizationTypes.Organization storage org = organizations[organizationId];
        if (org.createdAt == 0) revert Errors.OrganizationNotFound();
        if (!_hasOrganizationAdmin(organizationId, msg.sender) && !hasRole(Roles.SYSTEM_ADMIN, msg.sender)) {
            revert Errors.NotAuthorized();
        }

        org.metadataURI = metadataURI;
        org.updatedAt = uint64(block.timestamp);
        emit OrganizationMetadataUpdated(organizationId, metadataURI);
    }

    function assignRole(bytes32 organizationId, address account, bytes32 role) external override {
        if (account == address(0)) revert Errors.InvalidInput();
        if (!_hasOrganizationAdmin(organizationId, msg.sender) && !hasRole(Roles.SYSTEM_ADMIN, msg.sender)) {
            revert Errors.NotAuthorized();
        }

        OrganizationTypes.Organization storage org = organizations[organizationId];
        if (org.createdAt == 0) revert Errors.OrganizationNotFound();

        organizationRoles[organizationId][account][role] = true;
        emit MemberRoleAssigned(organizationId, account, role);
    }

    function revokeRole(bytes32 organizationId, address account, bytes32 role) external override {
        if (!_hasOrganizationAdmin(organizationId, msg.sender) && !hasRole(Roles.SYSTEM_ADMIN, msg.sender)) {
            revert Errors.NotAuthorized();
        }
        OrganizationTypes.Organization storage org = organizations[organizationId];
        if (org.createdAt == 0) revert Errors.OrganizationNotFound();

        organizationRoles[organizationId][account][role] = false;
        emit MemberRoleRevoked(organizationId, account, role);
    }

    function getOrganization(bytes32 organizationId)
        external
        view
        override
        returns (OrganizationTypes.Organization memory)
    {
        OrganizationTypes.Organization memory org = organizations[organizationId];
        if (org.createdAt == 0) revert Errors.OrganizationNotFound();
        return org;
    }

    function hasOrganizationRole(bytes32 organizationId, address account, bytes32 role)
        external
        view
        override
        returns (bool)
    {
        return organizationRoles[organizationId][account][role];
    }

    function _hasOrganizationAdmin(bytes32 organizationId, address account) internal view returns (bool) {
        return organizationRoles[organizationId][account][Roles.ORGANIZATION_ADMIN];
    }
}
