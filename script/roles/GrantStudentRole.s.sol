// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Script.sol";
import "../../lib/forge-std/src/console2.sol";
import {CertificateHashRegistry} from "../../src/bc-cvs/CertificateHashRegistry.sol";

/**
 * @title GrantStudentRole
 * @notice Script to grant CERTIFICATE_HOLDER role to a student address
 * @dev Usage: forge script script/roles/GrantStudentRole.s.sol:GrantStudentRole --rpc-url $RPC_URL --broadcast
 */
contract GrantStudentRole is Script {
    function run() external {
        // Load environment variables
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address studentAddress = vm.envAddress("STUDENT_ADDRESS");
        address registryAddress = vm.envAddress("CERTIFICATE_HASH_REGISTRY");

        console2.log("==============================================");
        console2.log("Grant CERTIFICATE_HOLDER Role to Student");
        console2.log("==============================================");
        console2.log("Admin:", vm.addr(deployerKey));
        console2.log("Student:", studentAddress);
        console2.log("Registry:", registryAddress);
        console2.log("");

        CertificateHashRegistry registry = CertificateHashRegistry(registryAddress);

        vm.startBroadcast(deployerKey);

        // Grant CERTIFICATE_HOLDER role
        console2.log("Granting CERTIFICATE_HOLDER role...");
        registry.grantHolderRole(studentAddress);
        
        vm.stopBroadcast();

        console2.log("✅ Successfully granted CERTIFICATE_HOLDER role to student!");
        console2.log("");
        console2.log("Student", studentAddress, "can now access the student portal.");
    }
}
