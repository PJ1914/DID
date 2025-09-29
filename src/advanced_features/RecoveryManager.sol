// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IVerificationLogger} from "../interfaces/IVerificationLogger.sol";
import {IGuardianManager} from "../interfaces/IGuardianManager.sol";
import {IRecoveryManager} from "../interfaces/IRecoveryManager.sol";

contract RecoveryManager is IRecoveryManager {
    error InvalidAddress();
    error NotGuardian();
    error RecoveryAlreadyActive(address wallet);
    error RecoveryNotPending(uint256 recoveryId);
    error AlreadyConfirmed(uint256 recoveryId, address guardian);
    error DelayNotElapsed(uint256 recoveryId, uint256 executeAfter);
    error ThresholdNotMet(uint256 recoveryId, uint256 confirmations, uint256 required);
    error MismatchedWalletOrOwner();
    error NoGuardiansConfigured();
    error Unauthorized();

    IVerificationLogger public immutable VERIFICATION_LOGGER;
    IGuardianManager public immutable GUARDIAN_MANAGER;

    uint256 private nextRecoveryId;

    mapping(uint256 => RecoveryDetails) private recoveries;
    mapping(uint256 => mapping(address => bool)) private confirmations;
    mapping(address => uint256[]) private walletRecoveries;
    mapping(address => uint256) private activeRecoveryForWallet;

    constructor(address logger, address guardianManager_) {
        if (logger == address(0)) revert InvalidAddress();
        if (guardianManager_ == address(0)) revert InvalidAddress();

        VERIFICATION_LOGGER = IVerificationLogger(logger);
        GUARDIAN_MANAGER = IGuardianManager(guardianManager_);
    }

    function requestRecovery(
        address wallet,
        address newOwner,
        string calldata reason,
        uint256 delay,
        address currentOwner,
        address guardian
    ) external override returns (uint256) {
        if (wallet == address(0) || newOwner == address(0) || currentOwner == address(0) || guardian == address(0)) {
            revert InvalidAddress();
        }
        if (guardian != msg.sender) revert Unauthorized();
        if (newOwner == currentOwner) revert InvalidAddress();
        if (!GUARDIAN_MANAGER.isGuardian(currentOwner, guardian)) {
            revert NotGuardian();
        }
        if (activeRecoveryForWallet[wallet] != 0) {
            revert RecoveryAlreadyActive(wallet);
        }

        address[] memory guardians = GUARDIAN_MANAGER.getGuardians(currentOwner);
        uint256 totalGuardians = guardians.length;
        if (totalGuardians == 0) revert NoGuardiansConfigured();

        uint256 recoveryId = ++nextRecoveryId;
        uint64 executeAfter = uint64(block.timestamp + delay);

        RecoveryDetails storage details = recoveries[recoveryId];
        details.id = recoveryId;
        details.wallet = wallet;
        details.currentOwner = currentOwner;
        details.newOwner = newOwner;
        details.initiator = guardian;
        details.requestedAt = uint64(block.timestamp);
        details.executeAfter = executeAfter;
        details.confirmations = 1;
        details.totalGuardians = uint8(totalGuardians);
        details.status = RecoveryStatus.Pending;

        confirmations[recoveryId][guardian] = true;
        walletRecoveries[wallet].push(recoveryId);
        activeRecoveryForWallet[wallet] = recoveryId;

        emit RecoveryRequested(recoveryId, wallet, newOwner, guardian, reason, executeAfter);

        VERIFICATION_LOGGER.logEvent("RREQ", wallet, keccak256(abi.encode(recoveryId, wallet, newOwner, currentOwner)));

        return recoveryId;
    }

    function confirmRecovery(uint256 recoveryId, address wallet, address currentOwner, address guardian)
        external
        override
    {
        if (guardian == address(0)) revert InvalidAddress();
        if (guardian != msg.sender) revert Unauthorized();

        RecoveryDetails storage details = recoveries[recoveryId];
        _validatePending(details, wallet, currentOwner);

        if (!GUARDIAN_MANAGER.isGuardian(currentOwner, guardian)) {
            revert NotGuardian();
        }
        if (confirmations[recoveryId][guardian]) {
            revert AlreadyConfirmed(recoveryId, guardian);
        }

        confirmations[recoveryId][guardian] = true;
        details.confirmations += 1;

        emit RecoveryConfirmed(recoveryId, guardian, details.confirmations);
        VERIFICATION_LOGGER.logEvent("RCFM", wallet, keccak256(abi.encode(recoveryId, guardian, details.confirmations)));
    }

    function executeRecovery(uint256 recoveryId, address wallet, address currentOwner)
        external
        override
        returns (address)
    {
        RecoveryDetails storage details = recoveries[recoveryId];
        _validatePending(details, wallet, currentOwner);

        if (block.timestamp < details.executeAfter) {
            revert DelayNotElapsed(recoveryId, details.executeAfter);
        }

        uint256 required = _requiredConfirmations(details.totalGuardians);
        if (details.confirmations < required) {
            revert ThresholdNotMet(recoveryId, details.confirmations, required);
        }

        details.status = RecoveryStatus.Executed;
        activeRecoveryForWallet[wallet] = 0;

        emit RecoveryExecuted(recoveryId, wallet, details.newOwner);
        VERIFICATION_LOGGER.logEvent("REXE", wallet, keccak256(abi.encode(recoveryId, details.newOwner)));

        return details.newOwner;
    }

    function cancelRecovery(uint256 recoveryId, address wallet, address currentOwner) external override {
        RecoveryDetails storage details = recoveries[recoveryId];
        _validatePending(details, wallet, currentOwner);

        if (msg.sender != currentOwner) revert Unauthorized();

        details.status = RecoveryStatus.Cancelled;
        activeRecoveryForWallet[wallet] = 0;

        emit RecoveryCancelled(recoveryId, wallet);
        VERIFICATION_LOGGER.logEvent("RCAN", wallet, keccak256(abi.encode(recoveryId, wallet)));
    }

    function getRecovery(uint256 recoveryId) external view override returns (RecoveryDetails memory) {
        return recoveries[recoveryId];
    }

    function getRecoveriesCount(address wallet) external view override returns (uint256) {
        return walletRecoveries[wallet].length;
    }

    function _validatePending(RecoveryDetails storage details, address wallet, address currentOwner) private view {
        if (details.wallet != wallet || details.currentOwner != currentOwner) {
            revert MismatchedWalletOrOwner();
        }
        if (details.status != RecoveryStatus.Pending) {
            revert RecoveryNotPending(details.id);
        }
    }

    function _requiredConfirmations(uint8 totalGuardians) private pure returns (uint256) {
        // Majority quorum: floor(total/2) + 1
        uint256 total = uint256(totalGuardians);
        if (total == 0) return 0;
        return (total / 2) + 1;
    }
}
