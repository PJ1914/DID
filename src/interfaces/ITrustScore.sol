// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITrustScore {
    event TrustScoreUpdated(bytes32 indexed identityId, int256 delta, uint256 newScore, string reason);

    function getScore(bytes32 identityId) external view returns (uint256);

    function increaseScore(bytes32 identityId, uint256 amount, string calldata reason) external;

    function decreaseScore(bytes32 identityId, uint256 amount, string calldata reason) external;

    function setScore(bytes32 identityId, uint256 amount, string calldata reason) external;
}
