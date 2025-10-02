// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VerificationLogger} from "../../src/core/VerificationLogger.sol";

contract VerificationLoggerTest is Test {
    VerificationLogger private logger;

    address private constant ACTOR = address(0xBEEF);
    bytes32 private constant LOGGER_ROLE = keccak256("LOGGER_ROLE");

    function setUp() public {
        logger = new VerificationLogger(address(this));
    }

    function testLogEventEmitsRecord() public {
        vm.expectEmit(true, true, true, true);
        emit VerificationLogger.LogRecorded(
            1,
            "TAG",
            ACTOR,
            address(this),
            keccak256("payload"),
            block.timestamp
        );
        logger.logEvent("TAG", ACTOR, keccak256("payload"));
        assertEq(logger.logCount(), 1, "log count");
    }

    function testLogEventRequiresRole() public {
        address outsider = address(0xCAFE);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)",
                outsider,
                LOGGER_ROLE
            )
        );
        vm.prank(outsider);
        logger.logEvent("TAG", ACTOR, keccak256("payload"));
    }

    function testGrantAndRevokeLoggerRole() public {
        address writer = address(0xA11CE);
        logger.grantLoggerRole(writer);

        vm.prank(writer);
        logger.logEvent("TAG", writer, keccak256("payload"));
        assertEq(logger.logCount(), 1, "after grant");

        logger.revokeLoggerRole(writer);
        vm.expectRevert(
            abi.encodeWithSignature(
                "AccessControlUnauthorizedAccount(address,bytes32)",
                writer,
                LOGGER_ROLE
            )
        );
        vm.prank(writer);
        logger.logEvent("TAG", writer, keccak256("payload"));
    }
}
