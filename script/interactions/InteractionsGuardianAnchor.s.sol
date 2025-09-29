// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {DevOpsTools} from "@foundry-devops/src/DevOpsTools.sol";
import {GuardianManager} from "../../src/advanced_features/GuardianManager.sol";

/// @notice Interaction script retained for guardian setup while cross-chain
///         components have been removed from the stack.
contract InteractionsGuardianAnchor is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address user = vm.addr(pk);
        vm.startBroadcast(pk);

        address guardianAddr = DevOpsTools.get_most_recent_deployment(
            "GuardianManager",
            block.chainid
        );

        GuardianManager guardian = GuardianManager(guardianAddr);

        // Setup guardian set with one guardian (self as placeholder) and threshold 1
        address[] memory gs = new address[](1);
        gs[0] = user;
        string[] memory rel = new string[](1);
        rel[0] = "self";
        try guardian.setupGuardianSet(gs, rel, 1) {
            console.log("Guardian set created");
        } catch {
            console.log("Guardian set already exists or failed");
        }

        console.log(
            "Cross-chain credential anchoring and ZK key registration scripts have been removed."
        );

        vm.stopBroadcast();
    }
}
