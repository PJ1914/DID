// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {GuardianManager} from "../src/advanced_features/GuardianManager.sol";
import {IVerificationLogger} from "../src/interfaces/IVerificationLogger.sol";

contract VerificationLoggerMock is IVerificationLogger {
    function logEvent(
        string calldata,
        address,
        bytes32
    ) external pure override {}
}

contract GuardianManagerTest is Test {
    GuardianManager private manager;
    VerificationLoggerMock private logger;

    address private constant OWNER = address(0xA11CE);
    address private constant OTHER = address(0xBEEF);
    address private constant G1 = address(0x1);
    address private constant G2 = address(0x2);
    address private constant G3 = address(0x3);
    address private constant G4 = address(0x4);

    function setUp() public {
        logger = new VerificationLoggerMock();
        manager = new GuardianManager(address(this), address(logger));
    }

    function testOwnerCanSetGuardians() public {
        address[] memory guardians = new address[](3);
        guardians[0] = G1;
        guardians[1] = G2;
        guardians[2] = G3;

        vm.prank(OWNER);
        manager.setGuardians(OWNER, guardians);

        address[] memory stored = manager.getGuardians(OWNER);
        assertEq(stored.length, 3, "guardian count");
        assertTrue(manager.isGuardian(OWNER, G1), "g1 guard");
        assertTrue(manager.isGuardian(OWNER, G2), "g2 guard");
        assertTrue(manager.isGuardian(OWNER, G3), "g3 guard");
    }

    function testNonOwnerCannotSetGuardians() public {
        address[] memory guardians = new address[](3);
        guardians[0] = G1;
        guardians[1] = G2;
        guardians[2] = G3;

        vm.prank(OTHER);
        vm.expectRevert(GuardianManager.NotOwnerOrAdmin.selector);
        manager.setGuardians(OWNER, guardians);
    }

    function testAddGuardianPreventsDuplicates() public {
        vm.startPrank(OWNER);
        manager.addGuardian(OWNER, G1);
        manager.addGuardian(OWNER, G2);
        vm.expectRevert(GuardianManager.DuplicateGuardian.selector);
        manager.addGuardian(OWNER, G1);
        vm.stopPrank();
    }

    function testRemoveGuardianUpdatesState() public {
        address[] memory guardians = new address[](3);
        guardians[0] = G1;
        guardians[1] = G2;
        guardians[2] = G3;

        vm.prank(OWNER);
        manager.setGuardians(OWNER, guardians);

        vm.prank(OWNER);
        manager.removeGuardian(OWNER, G2);

        address[] memory stored = manager.getGuardians(OWNER);
        assertEq(stored.length, 2, "guardian count");
        assertFalse(manager.isGuardian(OWNER, G2), "g2 removed");
    }

    function testAdminCanResetGuardiansForOwner() public {
        address[] memory initialGuardians = new address[](3);
        initialGuardians[0] = G1;
        initialGuardians[1] = G2;
        initialGuardians[2] = G3;
        manager.setGuardians(OWNER, initialGuardians);

        address[] memory replacement = new address[](3);
        replacement[0] = G2;
        replacement[1] = G3;
        replacement[2] = G4;
        manager.setGuardians(OWNER, replacement);

        address[] memory stored = manager.getGuardians(OWNER);
        assertEq(stored.length, 3, "guardian count");
        assertTrue(manager.isGuardian(OWNER, G4), "g4 added");
        assertFalse(manager.isGuardian(OWNER, G1), "g1 cleared");
    }
}
