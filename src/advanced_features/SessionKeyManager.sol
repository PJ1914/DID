// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IVerificationLogger} from "../interfaces/IVerificationLogger.sol";
import {ISessionKeyManager} from "../interfaces/ISessionKeyManager.sol";

contract SessionKeyManager is ISessionKeyManager {
    error NotAuthorized();
    error InvalidSessionKey();

    IVerificationLogger public immutable VERIFICATION_LOGGER;
    address public immutable AUTHORIZED_MANAGER;

    mapping(address => address[]) private walletKeys;
    mapping(address => mapping(address => SessionKeyConfig)) private keyConfigs;

    constructor(address logger, address manager) {
        if (logger == address(0) || manager == address(0)) {
            revert InvalidSessionKey();
        }
        VERIFICATION_LOGGER = IVerificationLogger(logger);
        AUTHORIZED_MANAGER = manager;
    }

    modifier onlyManager() {
        if (msg.sender != AUTHORIZED_MANAGER) revert NotAuthorized();
        _;
    }

    function addSessionKey(
        address wallet,
        address sessionKey,
        uint256 validUntil,
        uint256 spendingLimit,
        string[] calldata allowedFunctions,
        address[] calldata allowedContracts
    ) external override onlyManager {
        if (wallet == address(0) || sessionKey == address(0)) {
            revert InvalidSessionKey();
        }

        SessionKeyConfig storage config = keyConfigs[wallet][sessionKey];
        if (!config.active) {
            walletKeys[wallet].push(sessionKey);
        }

        config.active = true;
        config.validUntil = uint64(validUntil);
        config.spendingLimit = spendingLimit;
        config.allowedFunctions = allowedFunctions;
        config.allowedContracts = allowedContracts;

        emit SessionKeyAdded(wallet, sessionKey, uint64(validUntil), spendingLimit);
        VERIFICATION_LOGGER.logEvent(
            "SKADD", wallet, keccak256(abi.encode(wallet, sessionKey, validUntil, spendingLimit))
        );
    }

    function revokeSessionKey(address wallet, address sessionKey) external override onlyManager {
        SessionKeyConfig storage config = keyConfigs[wallet][sessionKey];
        if (!config.active) revert InvalidSessionKey();

        config.active = false;
        config.validUntil = uint64(block.timestamp);

        emit SessionKeyRevoked(wallet, sessionKey);
        VERIFICATION_LOGGER.logEvent("SKRM", wallet, keccak256(abi.encode(wallet, sessionKey)));
    }

    function getSessionKeys(address wallet) external view override returns (address[] memory) {
        return walletKeys[wallet];
    }

    function isSessionKeyValid(address wallet, address sessionKey) external view override returns (bool) {
        SessionKeyConfig storage config = keyConfigs[wallet][sessionKey];
        if (!config.active) return false;
        if (config.validUntil != 0 && config.validUntil < block.timestamp) {
            return false;
        }
        if (config.spendingLimit != 0 && config.spent >= config.spendingLimit) {
            return false;
        }
        return true;
    }

    function getSessionKeyConfig(address wallet, address sessionKey)
        external
        view
        override
        returns (SessionKeyConfig memory)
    {
        return keyConfigs[wallet][sessionKey];
    }

    function _consumeAllowance(address wallet, address sessionKey, uint256 amount) external onlyManager {
        SessionKeyConfig storage config = keyConfigs[wallet][sessionKey];
        if (!config.active) revert InvalidSessionKey();
        if (config.spendingLimit == 0) return;
        config.spent += amount;
    }
}
