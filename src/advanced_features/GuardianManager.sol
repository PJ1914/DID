// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IVerificationLogger} from "../interfaces/IVerificationLogger.sol";
import {IGuardianManager} from "../interfaces/IGuardianManager.sol";

contract GuardianManager is AccessControl, IGuardianManager {
    error InvalidAddress();
    error NotOwnerOrAdmin();
    error InvalidGuardianCount();
    error DuplicateGuardian();
    error GuardianNotFound();

    bytes32 public constant GUARDIAN_ADMIN_ROLE = keccak256("GUARDIAN_ADMIN_ROLE");

    uint8 public constant REQUIRED_GUARDIANS = 3;

    IVerificationLogger public immutable VERIFICATION_LOGGER;

    mapping(address => address[]) private guardianLists;
    mapping(address => mapping(address => bool)) private guardians;

    constructor(address admin, address logger) {
        if (admin == address(0)) revert InvalidAddress();
        if (logger == address(0)) revert InvalidAddress();

        VERIFICATION_LOGGER = IVerificationLogger(logger);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(GUARDIAN_ADMIN_ROLE, admin);
    }

    modifier onlyOwnerOrAdmin(address owner) {
        if (owner == address(0)) revert InvalidAddress();
        if (owner != msg.sender && !hasRole(GUARDIAN_ADMIN_ROLE, msg.sender)) {
            revert NotOwnerOrAdmin();
        }
        _;
    }

    function setGuardians(address owner, address[] calldata newGuardians) external override onlyOwnerOrAdmin(owner) {
        if (newGuardians.length != REQUIRED_GUARDIANS) {
            revert InvalidGuardianCount();
        }

        _clearGuardians(owner);
        _addMany(owner, newGuardians);

        emit GuardiansUpdated(owner, guardianLists[owner]);
        VERIFICATION_LOGGER.logEvent("GSET", owner, keccak256(abi.encode(owner, newGuardians)));
    }

    function addGuardian(address owner, address guardian) external override onlyOwnerOrAdmin(owner) {
        if (guardian == address(0) || guardian == owner) {
            revert InvalidAddress();
        }
        if (guardianLists[owner].length >= REQUIRED_GUARDIANS) {
            revert InvalidGuardianCount();
        }
        if (guardians[owner][guardian]) revert DuplicateGuardian();

        guardianLists[owner].push(guardian);
        guardians[owner][guardian] = true;

        emit GuardianAdded(owner, guardian);
        VERIFICATION_LOGGER.logEvent("GADD", owner, keccak256(abi.encode(owner, guardian)));
    }

    function removeGuardian(address owner, address guardian) external override onlyOwnerOrAdmin(owner) {
        if (!guardians[owner][guardian]) revert GuardianNotFound();

        address[] storage list = guardianLists[owner];
        uint256 length = list.length;
        for (uint256 i = 0; i < length; i++) {
            if (list[i] == guardian) {
                list[i] = list[length - 1];
                list.pop();
                break;
            }
        }
        guardians[owner][guardian] = false;

        emit GuardianRemoved(owner, guardian);
        VERIFICATION_LOGGER.logEvent("GREM", owner, keccak256(abi.encode(owner, guardian)));
    }

    function isGuardian(address owner, address guardian) external view override returns (bool) {
        return guardians[owner][guardian];
    }

    function getGuardians(address owner) external view override returns (address[] memory) {
        return guardianLists[owner];
    }

    function _clearGuardians(address owner) private {
        address[] storage list = guardianLists[owner];
        uint256 length = list.length;
        for (uint256 i = 0; i < length; i++) {
            address guardian = list[i];
            guardians[owner][guardian] = false;
            emit GuardianRemoved(owner, guardian);
            VERIFICATION_LOGGER.logEvent("GREM", owner, keccak256(abi.encode(owner, guardian)));
        }
        delete guardianLists[owner];
    }

    function _addMany(address owner, address[] calldata newGuardians) private {
        uint256 length = newGuardians.length;
        for (uint256 i = 0; i < length; i++) {
            address guardian = newGuardians[i];
            if (guardian == address(0) || guardian == owner) {
                revert InvalidAddress();
            }
            if (guardians[owner][guardian]) revert DuplicateGuardian();

            guardianLists[owner].push(guardian);
            guardians[owner][guardian] = true;
            emit GuardianAdded(owner, guardian);
            VERIFICATION_LOGGER.logEvent("GADD", owner, keccak256(abi.encode(owner, guardian)));
        }
    }
}
