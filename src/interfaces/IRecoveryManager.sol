// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IRecoveryManager {
    enum RecoveryStatus {
        Pending,
        Executed,
        Cancelled
    }

    struct RecoveryDetails {
        uint256 id;
        address wallet;
        address currentOwner;
        address newOwner;
        address initiator;
        uint64 requestedAt;
        uint64 executeAfter;
        uint8 confirmations;
        uint8 totalGuardians;
        RecoveryStatus status;
    }

    event RecoveryRequested(
        uint256 indexed recoveryId,
        address indexed wallet,
        address indexed newOwner,
        address initiator,
        string reason,
        uint256 executeAfter
    );

    event RecoveryConfirmed(uint256 indexed recoveryId, address indexed guardian, uint256 confirmations);

    event RecoveryExecuted(uint256 indexed recoveryId, address indexed wallet, address indexed newOwner);

    event RecoveryCancelled(uint256 indexed recoveryId, address indexed wallet);

    function requestRecovery(
        address wallet,
        address newOwner,
        string calldata reason,
        uint256 delay,
        address currentOwner,
        address guardian
    ) external returns (uint256);

    function confirmRecovery(uint256 recoveryId, address wallet, address currentOwner, address guardian) external;

    function executeRecovery(uint256 recoveryId, address wallet, address currentOwner) external returns (address);

    function cancelRecovery(uint256 recoveryId, address wallet, address currentOwner) external;

    function getRecovery(uint256 recoveryId) external view returns (RecoveryDetails memory);

    function getRecoveriesCount(address wallet) external view returns (uint256);
}
