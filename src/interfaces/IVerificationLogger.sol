// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IVerificationLogger {
    function logEvent(string calldata tag, address actor, bytes32 contentHash) external;
}
