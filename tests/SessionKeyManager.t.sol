// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {SessionKeyManager} from "../src/advanced_features/SessionKeyManager.sol";
import {IVerificationLogger} from "../src/interfaces/IVerificationLogger.sol";

contract VerificationLoggerMock is IVerificationLogger {
    function logEvent(string calldata, address, bytes32) external pure override {}
}

contract SessionKeyManagerTest is Test {
    SessionKeyManager private manager;
    VerificationLoggerMock private logger;

    address private constant WALLET = address(0x1234);
    address private constant SESSION_KEY = address(0x5678);

    function setUp() public {
        logger = new VerificationLoggerMock();
        manager = new SessionKeyManager(address(logger), address(this));
    }

    function testAddSessionKeyStoresConfig() public {
        string[] memory functionsAllowed = new string[](1);
        functionsAllowed[0] = "transfer";
        address[] memory contractsAllowed = new address[](1);
        contractsAllowed[0] = address(0xABC);

        uint256 expiry = block.timestamp + 1 days;
        manager.addSessionKey(WALLET, SESSION_KEY, expiry, 100 ether, functionsAllowed, contractsAllowed);

        address[] memory keys = manager.getSessionKeys(WALLET);
        assertEq(keys.length, 1, "session key count");
        assertEq(keys[0], SESSION_KEY, "session key address");
        assertTrue(manager.isSessionKeyValid(WALLET, SESSION_KEY), "session key valid");

        SessionKeyManager.SessionKeyConfig memory config = manager.getSessionKeyConfig(WALLET, SESSION_KEY);
        assertEq(config.validUntil, uint64(expiry), "valid until");
        assertEq(config.spendingLimit, 100 ether, "spending limit");
        assertEq(config.allowedFunctions.length, 1, "functions length");
        assertEq(keccak256(bytes(config.allowedFunctions[0])), keccak256(bytes("transfer")), "allowed function");
        assertEq(config.allowedContracts[0], address(0xABC), "allowed contract");
    }

    function testRevokeSessionKeyMakesInvalid() public {
        uint256 expiry = block.timestamp + 1 days;
        manager.addSessionKey(WALLET, SESSION_KEY, expiry, 0, new string[](0), new address[](0));
        manager.revokeSessionKey(WALLET, SESSION_KEY);

        assertFalse(manager.isSessionKeyValid(WALLET, SESSION_KEY), "revoked");
        SessionKeyManager.SessionKeyConfig memory config = manager.getSessionKeyConfig(WALLET, SESSION_KEY);
        assertFalse(config.active, "active flag");
        assertEq(config.validUntil, uint64(block.timestamp), "revoked timestamp");
    }

    function testConsumeAllowanceTracksSpending() public {
        manager.addSessionKey(WALLET, SESSION_KEY, block.timestamp + 1 days, 100, new string[](0), new address[](0));
        manager._consumeAllowance(WALLET, SESSION_KEY, 60);
        manager._consumeAllowance(WALLET, SESSION_KEY, 20);

        SessionKeyManager.SessionKeyConfig memory config = manager.getSessionKeyConfig(WALLET, SESSION_KEY);
        assertEq(config.spent, 80, "spent amount");
        assertTrue(manager.isSessionKeyValid(WALLET, SESSION_KEY), "still valid");

        manager._consumeAllowance(WALLET, SESSION_KEY, 30);
        assertFalse(manager.isSessionKeyValid(WALLET, SESSION_KEY), "limit reached");
    }

    function testNonManagerCannotMutate() public {
        vm.startPrank(address(0xDEAD));
        vm.expectRevert(SessionKeyManager.NotAuthorized.selector);
        manager.addSessionKey(WALLET, SESSION_KEY, block.timestamp + 1 days, 0, new string[](0), new address[](0));
        vm.stopPrank();
    }
}
