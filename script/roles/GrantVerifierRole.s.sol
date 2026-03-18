// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Script.sol";
import "../../lib/forge-std/src/console2.sol";
import {CertificateHashRegistry} from "../../src/bc-cvs/CertificateHashRegistry.sol";

/**
 * @title GrantVerifierRole
 * @notice Script to grant VERIFIER role to a verifier address  * @dev Usage: forge script script/roles/GrantVerifierRole.s.sol:GrantVerifierRole --rpc-url $RPC_URL --broadcast
 */
contract GrantVerifierRole is Script {
    function run() external {
        // Load environment variables
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address verifierAddress = vm.envAddress("VERIFIER_ADDRESS");
        address registryAddress = vm.envAddress("CERTIFICATE_HASH_REGISTRY");

        console2.log("==============================================");
        console2.log("Grant VERIFIER Role to Verifier");
        console2.log("==============================================");
        console2.log("Admin:", vm.addr(deployerKey));
        console2.log("Verifier:", verifierAddress);
        console2.log("Registry:", registryAddress);
        console2.log("");

        CertificateHashRegistry registry = CertificateHashRegistry(registryAddress);

        vm.startBroadcast(deployerKey);

        // Grant VERIFIER role
        console2.log("Granting VERIFIER role...");
        registry.grantVerifierRole(verifierAddress);
        
        vm.stopBroadcast();

        console2.log("✅ Successfully granted VERIFIER role to verifier!");
        console2.log("");
        console2.log("Verifier", verifierAddress, "can now access the verifier portal.");
    }
}
