// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {GuardianManager} from "../src/advanced_features/GuardianManager.sol";
import {RecoveryManager} from "../src/advanced_features/RecoveryManager.sol";
import {IRecoveryManager} from "../src/interfaces/IRecoveryManager.sol";
import {IVerificationLogger} from "../src/interfaces/IVerificationLogger.sol";

contract VerificationLoggerMock is IVerificationLogger {
    event EventLogged(string tag, address actor, bytes32 contentHash);

    function logEvent(string calldata tag, address actor, bytes32 contentHash) external override {
        emit EventLogged(tag, actor, contentHash);
    }
}

contract RecoveryManagerTest is Test {
    GuardianManager private guardianManager;
    RecoveryManager private recoveryManager;
    VerificationLoggerMock private logger;

    address private owner = address(0xABCD);
    address private wallet = address(0xAAAA);
    address private newOwner = address(0xBBBB);
    address private guardian1 = address(0x1111);
    address private guardian2 = address(0x2222);
    address private guardian3 = address(0x3333);

    function setUp() public {
        logger = new VerificationLoggerMock();
        guardianManager = new GuardianManager(address(this), address(logger));
        recoveryManager = new RecoveryManager(address(logger), address(guardianManager));

        address[] memory guardians = new address[](3);
        guardians[0] = guardian1;
        guardians[1] = guardian2;
        guardians[2] = guardian3;

        vm.startPrank(owner);
        guardianManager.setGuardians(owner, guardians);
        vm.stopPrank();
    }

    function testGuardianRegistration() public view {
        address[] memory guardians = guardianManager.getGuardians(owner);
        assertEq(guardians.length, 3, "guardian count");
        assertTrue(guardianManager.isGuardian(owner, guardian1), "guardian1");
        assertTrue(guardianManager.isGuardian(owner, guardian2), "guardian2");
        assertTrue(guardianManager.isGuardian(owner, guardian3), "guardian3");
    }

    function testRecoveryFlowRequiresMajority() public {
        vm.prank(guardian1);
        uint256 recoveryId = recoveryManager.requestRecovery(wallet, newOwner, "lost device", 3 days, owner, guardian1);

        IRecoveryManager.RecoveryDetails memory details = recoveryManager.getRecovery(recoveryId);
        assertEq(details.confirmations, 1, "initial confirmations");
        assertEq(uint256(details.status), uint256(IRecoveryManager.RecoveryStatus.Pending), "pending status");
        assertEq(details.totalGuardians, 3, "guardian total");

        // Second guardian confirms
        vm.prank(guardian2);
        recoveryManager.confirmRecovery(recoveryId, wallet, owner, guardian2);

        details = recoveryManager.getRecovery(recoveryId);
        assertEq(details.confirmations, 2, "after second confirmation");

        // Ensure execution blocked before delay
        vm.expectRevert(
            abi.encodeWithSelector(RecoveryManager.DelayNotElapsed.selector, recoveryId, details.executeAfter)
        );
        recoveryManager.executeRecovery(recoveryId, wallet, owner);

        vm.warp(block.timestamp + 3 days + 1);
        address resultOwner = recoveryManager.executeRecovery(recoveryId, wallet, owner);
        assertEq(resultOwner, newOwner, "new owner assigned");

        details = recoveryManager.getRecovery(recoveryId);
        assertEq(uint256(details.status), uint256(IRecoveryManager.RecoveryStatus.Executed), "executed status");
    }

    function testCannotDuplicateConfirmations() public {
        vm.prank(guardian1);
        uint256 recoveryId = recoveryManager.requestRecovery(wallet, newOwner, "compromise", 1 days, owner, guardian1);

        vm.prank(guardian2);
        recoveryManager.confirmRecovery(recoveryId, wallet, owner, guardian2);

        vm.prank(guardian2);
        vm.expectRevert(abi.encodeWithSelector(RecoveryManager.AlreadyConfirmed.selector, recoveryId, guardian2));
        recoveryManager.confirmRecovery(recoveryId, wallet, owner, guardian2);
    }

    function testOwnerCanCancelRecovery() public {
        vm.prank(guardian1);
        uint256 recoveryId = recoveryManager.requestRecovery(wallet, newOwner, "stolen", 1 days, owner, guardian1);

        vm.prank(owner);
        recoveryManager.cancelRecovery(recoveryId, wallet, owner);

        IRecoveryManager.RecoveryDetails memory details = recoveryManager.getRecovery(recoveryId);
        assertEq(uint256(details.status), uint256(IRecoveryManager.RecoveryStatus.Cancelled), "cancelled");
    }
}
