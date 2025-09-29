// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {TrustScore} from "../src/core/TrustScore.sol";
import {Errors} from "../src/libs/Errors.sol";

contract TrustScoreTest is Test {
    TrustScore private trustScore;
    bytes32 private constant ID = bytes32(uint256(1));

    function setUp() public {
        trustScore = new TrustScore(address(this));
    }

    function testIncreaseScoreUpdatesValue() public {
        trustScore.increaseScore(ID, 15, "positive action");
        assertEq(trustScore.getScore(ID), 15);
    }

    function testDecreaseScoreCannotUnderflow() public {
        trustScore.decreaseScore(ID, 20, "negative action");
        assertEq(trustScore.getScore(ID), 0);
    }

    function testSetScoreOverridesExistingValue() public {
        trustScore.increaseScore(ID, 10, "positive action");
        trustScore.setScore(ID, 42, "manual override");
        assertEq(trustScore.getScore(ID), 42);
    }

    function testIncreaseScoreRevertsOnZeroAmount() public {
        vm.expectRevert(Errors.InvalidInput.selector);
        trustScore.increaseScore(ID, 0, "invalid");
    }
}
