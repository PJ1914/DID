// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {OrganizationManager} from "../src/organizations/OrganizationManager.sol";
import {OrganizationTypes} from "../src/libs/OrganizationTypes.sol";
import {Roles} from "../src/libs/Roles.sol";
import {Errors} from "../src/libs/Errors.sol";

contract OrganizationManagerTest is Test {
    OrganizationManager private manager;

    address private constant ADMIN = address(0xAAA1);
    address private constant MEMBER = address(0xBEEF);
    string private constant NAME = "Acme University";
    string private constant URI = "ipfs://org/1";

    function setUp() public {
        manager = new OrganizationManager(ADMIN);
    }

    function testRegisterOrganizationInitializesRecord() public {
        vm.prank(ADMIN);
        bytes32 orgId = manager.registerOrganization(NAME, URI);

        OrganizationTypes.Organization memory org = manager.getOrganization(orgId);
        assertEq(org.admin, ADMIN, "admin");
        assertEq(org.name, NAME, "name");
        assertEq(org.metadataURI, URI, "metadata");
        assertEq(uint8(org.status), uint8(OrganizationTypes.OrganizationStatus.Pending), "status");
        assertTrue(manager.hasOrganizationRole(orgId, ADMIN, Roles.ORGANIZATION_ADMIN), "admin role");
    }

    function testSetOrganizationStatusRequiresSystemAdmin() public {
        vm.prank(ADMIN);
        bytes32 orgId = manager.registerOrganization(NAME, URI);

        vm.prank(ADMIN);
        manager.setOrganizationStatus(orgId, OrganizationTypes.OrganizationStatus.Active);

        OrganizationTypes.Organization memory org = manager.getOrganization(orgId);
        assertEq(uint8(org.status), uint8(OrganizationTypes.OrganizationStatus.Active), "status");
    }

    function testNonAdminCannotUpdateMetadata() public {
        vm.prank(ADMIN);
        bytes32 orgId = manager.registerOrganization(NAME, URI);

        vm.expectRevert(Errors.NotAuthorized.selector);
        vm.prank(MEMBER);
        manager.updateOrganizationMetadata(orgId, "ipfs://org/2");
    }

    function testOrganizationAdminCanUpdateMetadata() public {
        vm.prank(ADMIN);
        bytes32 orgId = manager.registerOrganization(NAME, URI);

        vm.prank(ADMIN);
        manager.updateOrganizationMetadata(orgId, "ipfs://org/2");

        OrganizationTypes.Organization memory org = manager.getOrganization(orgId);
        assertEq(org.metadataURI, "ipfs://org/2", "metadata");
    }

    function testAssignAndRevokeRole() public {
        vm.prank(ADMIN);
        bytes32 orgId = manager.registerOrganization(NAME, URI);

        vm.prank(ADMIN);
        manager.assignRole(orgId, MEMBER, Roles.VERIFICATION_PROVIDER);
        assertTrue(manager.hasOrganizationRole(orgId, MEMBER, Roles.VERIFICATION_PROVIDER), "role assigned");

        vm.prank(ADMIN);
        manager.revokeRole(orgId, MEMBER, Roles.VERIFICATION_PROVIDER);
        assertFalse(manager.hasOrganizationRole(orgId, MEMBER, Roles.VERIFICATION_PROVIDER), "role revoked");
    }

    function testAssignRoleRevertsForInvalidOrganization() public {
        bytes32 missingOrg = bytes32(uint256(123));

        vm.expectRevert(Errors.OrganizationNotFound.selector);
        vm.prank(ADMIN);
        manager.assignRole(missingOrg, MEMBER, Roles.VERIFICATION_PROVIDER);
    }
}
