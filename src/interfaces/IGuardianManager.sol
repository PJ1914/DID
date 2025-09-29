// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IGuardianManager {
    event GuardiansUpdated(address indexed owner, address[] guardians);
    event GuardianAdded(address indexed owner, address indexed guardian);
    event GuardianRemoved(address indexed owner, address indexed guardian);

    function setGuardians(address owner, address[] calldata guardians) external;

    function addGuardian(address owner, address guardian) external;

    function removeGuardian(address owner, address guardian) external;

    function isGuardian(address owner, address guardian) external view returns (bool);

    function getGuardians(address owner) external view returns (address[] memory);
}
