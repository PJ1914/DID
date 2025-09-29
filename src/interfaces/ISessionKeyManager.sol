// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ISessionKeyManager {
    struct SessionKeyConfig {
        bool active;
        uint64 validUntil;
        uint256 spendingLimit;
        uint256 spent;
        string[] allowedFunctions;
        address[] allowedContracts;
    }

    event SessionKeyAdded(address indexed wallet, address indexed sessionKey, uint64 validUntil, uint256 spendingLimit);

    event SessionKeyRevoked(address indexed wallet, address indexed sessionKey);

    function addSessionKey(
        address wallet,
        address sessionKey,
        uint256 validUntil,
        uint256 spendingLimit,
        string[] calldata allowedFunctions,
        address[] calldata allowedContracts
    ) external;

    function revokeSessionKey(address wallet, address sessionKey) external;

    function getSessionKeys(address wallet) external view returns (address[] memory);

    function isSessionKeyValid(address wallet, address sessionKey) external view returns (bool);

    function getSessionKeyConfig(address wallet, address sessionKey) external view returns (SessionKeyConfig memory);
}
