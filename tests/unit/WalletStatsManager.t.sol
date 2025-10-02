// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {WalletStatsManager} from "../../src/advanced_features/WalletStatsManager.sol";
import {IWalletStatsManager} from "../../src/interfaces/IWalletStatsManager.sol";

contract WalletStatsManagerTest is Test {
    WalletStatsManager private manager;
    address private constant WALLET = address(0xCAFE);

    function setUp() public {
        manager = new WalletStatsManager();
    }

    function testRecordUserOpTracksMetrics() public {
        manager.recordUserOp(WALLET, true, 100_000, 1 ether);
        manager.recordUserOp(WALLET, false, 50_000, 0.5 ether);

        IWalletStatsManager.UserOpStats memory stats = manager.getStats(WALLET);
        assertEq(stats.totalOps, 2, "total ops");
        assertEq(stats.successfulOps, 1, "success count");
        assertEq(stats.failedOps, 1, "failure count");
        assertEq(stats.totalGasUsed, 150_000, "gas used");
        assertEq(stats.totalFeesPaid, 1.5 ether, "fees");
        assertGt(stats.lastOpTimestamp, 0, "timestamp set");
    }

    function testLastOpTimestampUpdates() public {
        manager.recordUserOp(WALLET, true, 10, 1);
        uint256 first = manager.getStats(WALLET).lastOpTimestamp;

        vm.warp(block.timestamp + 10);
        manager.recordUserOp(WALLET, true, 10, 1);
        uint256 second = manager.getStats(WALLET).lastOpTimestamp;

        assertGt(second, first, "timestamp advanced");
    }
}
