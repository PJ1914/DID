// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IWalletStatsManager} from "../interfaces/IWalletStatsManager.sol";

contract WalletStatsManager is IWalletStatsManager {
    mapping(address => UserOpStats) private stats;

    function recordUserOp(address wallet, bool success, uint256 gasUsed, uint256 feePaid) external override {
        UserOpStats storage s = stats[wallet];
        s.totalOps += 1;
        if (success) {
            s.successfulOps += 1;
        } else {
            s.failedOps += 1;
        }
        s.totalGasUsed += gasUsed;
        s.totalFeesPaid += feePaid;
        s.lastOpTimestamp = block.timestamp;

        emit UserOpRecorded(wallet, success, gasUsed, feePaid, s.totalOps);
    }

    function getStats(address wallet) external view override returns (UserOpStats memory) {
        return stats[wallet];
    }
}
