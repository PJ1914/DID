// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IVerificationLogger} from "../interfaces/IVerificationLogger.sol";

/**
 * @title VerificationLogger
 * @notice Minimal audit log hub that gates writers by role and emits structured events.
 */
contract VerificationLogger is AccessControl, IVerificationLogger {
    bytes32 public constant LOGGER_ROLE = keccak256("LOGGER_ROLE");

    error InvalidAdmin();
    error InvalidTag();
    error InvalidActor();

    event LogRecorded(
        uint256 indexed logId,
        string tag,
        address indexed actor,
        address indexed caller,
        bytes32 contentHash,
        uint256 timestamp
    );

    uint256 public logCount;

    constructor(address admin) {
        if (admin == address(0)) revert InvalidAdmin();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(LOGGER_ROLE, admin);
    }

    /// @inheritdoc IVerificationLogger
    function logEvent(string calldata tag, address actor, bytes32 contentHash)
        external
        override
        onlyRole(LOGGER_ROLE)
    {
        if (bytes(tag).length == 0) revert InvalidTag();
        if (actor == address(0)) revert InvalidActor();

        uint256 logId = ++logCount;
        emit LogRecorded(logId, tag, actor, msg.sender, contentHash, block.timestamp);
    }

    /**
     * @notice Convenience helper for admins to grant logging rights.
     */
    function grantLoggerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(LOGGER_ROLE, account);
    }

    /**
     * @notice Convenience helper for admins to revoke logging rights.
     */
    function revokeLoggerRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(LOGGER_ROLE, account);
    }
}
