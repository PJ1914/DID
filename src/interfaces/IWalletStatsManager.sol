// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IWalletStatsManager {
    struct UserOpStats {
        uint256 totalOps;
        uint256 successfulOps;
        uint256 failedOps;
        uint256 totalGasUsed;
        uint256 totalFeesPaid;
        uint256 lastOpTimestamp;
    }

    event UserOpRecorded(address indexed wallet, bool success, uint256 gasUsed, uint256 feePaid, uint256 totalOps);

    function recordUserOp(address wallet, bool success, uint256 gasUsed, uint256 feePaid) external;

    function getStats(address wallet) external view returns (UserOpStats memory);
}
