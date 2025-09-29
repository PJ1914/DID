// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";

/// @dev Deprecated script. Cross-chain anchor & key registry removed.
contract DeployGuardianAndAnchor is Script {
    function run() external pure {
        revert("Deprecated: anchor layer removed");
    }
}
