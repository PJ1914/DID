// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Script.sol";
import "../../lib/forge-std/src/console2.sol";
import {ValidatorConsensus} from "../../src/bc-cvs/ValidatorConsensus.sol";
import "../../src/libs/Errors.sol";

/**
 * @title AddValidators
 * @notice Script to add new validator institutions to the ValidatorConsensus contract
 * @dev Usage: forge script script/bc-cvs/AddValidators.s.sol:AddValidators --rpc-url $RPC_URL --private-key-env PRIVATE_KEY --broadcast
 */
contract AddValidators is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address admin = vm.addr(deployerKey);

        // Load ValidatorConsensus address from environment or deployment file
        address consensusAddress = vm.envAddress("VALIDATOR_CONSENSUS_ADDRESS");
        ValidatorConsensus consensus = ValidatorConsensus(consensusAddress);

        // Define validators to add (customize as needed)
        address[] memory newValidators = new address[](3);
        newValidators[0] = 0x1234567890123456789012345678901234567890; // Replace with actual addresses
        newValidators[1] = 0x2345678901234567890123456789012345678901;
        newValidators[2] = 0x3456789012345678901234567890123456789012;

        console2.log("==============================================");
        console2.log("Adding Validators to ValidatorConsensus");
        console2.log("==============================================");
        console2.log("Admin:", admin);
        console2.log("ValidatorConsensus:", consensusAddress);
        console2.log("Validators to add:", newValidators.length);
        console2.log("");

        vm.startBroadcast(deployerKey);

        for (uint256 i = 0; i < newValidators.length; i++) {
            address validator = newValidators[i];
            
            if (consensus.isValidator(validator)) {
                console2.log("  [SKIP] Validator already exists:", validator);
                continue;
            }

            try consensus.addValidator(validator) {
                console2.log("  [SUCCESS] Added validator:", validator);
            } catch Error(string memory reason) {
                console2.log("  [ERROR] Failed to add validator:", validator);
                console2.log("  Reason:", reason);
            } catch {
                console2.log("  [ERROR] Failed to add validator:", validator);
            }
        }

        vm.stopBroadcast();

        console2.log("");
        console2.log("Total validators now:", consensus.getValidatorCount());
        console2.log("==============================================");
    }
}
