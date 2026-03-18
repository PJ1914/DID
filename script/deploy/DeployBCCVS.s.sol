// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Script.sol";
import "../../lib/forge-std/src/console2.sol";
import {Roles} from "../../src/libs/Roles.sol";
import {BloomFilter} from "../../src/bc-cvs/BloomFilter.sol";
import {RevocationRegistry} from "../../src/bc-cvs/RevocationRegistry.sol";
import {CertificateHashRegistry} from "../../src/bc-cvs/CertificateHashRegistry.sol";
import {ValidatorConsensus} from "../../src/bc-cvs/ValidatorConsensus.sol";

/**
 * @title DeployBCCVS
 * @notice Deploys all Sajjan (Blockchain and Cybersecurity-Based Certificate Verification System) contracts
 * @dev This script deploys:
 *      1. BloomFilter - Gas optimization layer with 1MB bit array
 *      2. RevocationRegistry - Immutable audit trail for revocations/corrections
 *      3. CertificateHashRegistry - Core certificate management with SHA-256 + RSA
 *      4. ValidatorConsensus - Institutional governance with 100% unanimous approval
 */
contract DeployBCCVS is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address admin = vm.addr(deployerKey);

        console2.log("==============================================");
        console2.log("Sajjan Deployment");
        console2.log("==============================================");
        console2.log("Deployer/Admin:", admin);
        console2.log("");

        vm.startBroadcast(deployerKey);

        // ============================================
        // Step 1: Deploy BloomFilter (Optimization Layer)
        // ============================================
        console2.log("Deploying BloomFilter...");
        BloomFilter bloomFilter = new BloomFilter(admin);
        console2.log("  BloomFilter deployed at:", address(bloomFilter));
        console2.log("  Bit array size:", bloomFilter.getBitArraySize());
        console2.log("");

        // ============================================
        // Step 2: Deploy RevocationRegistry (Audit Trail)
        // ============================================
        console2.log("Deploying RevocationRegistry...");
        RevocationRegistry revocationRegistry = new RevocationRegistry(admin);
        console2.log("  RevocationRegistry deployed at:", address(revocationRegistry));
        console2.log("");

        // ============================================
        // Step 3: Deploy ValidatorConsensus (Governance)
        // ============================================
        console2.log("Deploying ValidatorConsensus...");
        
        // Initialize with admin as first validator (can add more later)
        address[] memory initialValidators = new address[](1);
        initialValidators[0] = admin;
        
        ValidatorConsensus validatorConsensus = new ValidatorConsensus(
            admin,
            initialValidators
        );
        console2.log("  ValidatorConsensus deployed at:", address(validatorConsensus));
        console2.log("  Initial validators count:", validatorConsensus.getValidatorCount());
        console2.log("");

        // ============================================
        // Step 4: Deploy CertificateHashRegistry (Core)
        // ============================================
        console2.log("Deploying CertificateHashRegistry...");
        CertificateHashRegistry certificateRegistry = new CertificateHashRegistry(
            admin,
            address(bloomFilter),
            address(revocationRegistry)
        );
        console2.log("  CertificateHashRegistry deployed at:", address(certificateRegistry));
        console2.log("");

        // ============================================
        // Step 5: Wire Contracts Together (Grant Roles)
        // ============================================
        console2.log("Wiring contracts together...");

        // Grant CertificateHashRegistry permission to write to BloomFilter
        bloomFilter.grantRole(
            Roles.BLOOM_FILTER_MANAGER,
            address(certificateRegistry)
        );
        console2.log("  Granted BLOOM_FILTER_MANAGER role to CertificateRegistry");

        // Grant CertificateHashRegistry permission to write to RevocationRegistry
        revocationRegistry.grantRole(
            Roles.CERTIFICATE_ISSUER,
            address(certificateRegistry)
        );
        console2.log("  Granted CERTIFICATE_ISSUER role to CertificateRegistry");

        // Grant admin all necessary roles for testing/setup
        certificateRegistry.grantRole(Roles.ADMINISTRATOR, admin);
        console2.log("  Granted ADMINISTRATOR role to admin");

        console2.log("");
        console2.log("==============================================");
        console2.log("Deployment Complete!");
        console2.log("==============================================");
        console2.log("");
        console2.log("Contract Addresses:");
        console2.log("----------------------------");
        console2.log("BloomFilter:", address(bloomFilter));
        console2.log("RevocationRegistry:", address(revocationRegistry));
        console2.log("ValidatorConsensus:", address(validatorConsensus));
        console2.log("CertificateHashRegistry:", address(certificateRegistry));
        console2.log("");
        console2.log("Next Steps:");
        console2.log("1. Use ValidatorConsensus to onboard institutions via unanimous voting");
        console2.log("2. Institutions can issue certificates through CertificateHashRegistry");
        console2.log("3. Verifiers can check certificates (with Bloom filter optimization)");
        console2.log("4. Monitor audit trail through RevocationRegistry");
        console2.log("==============================================");

        vm.stopBroadcast();

        // Save deployment info for frontend integration
        string memory json = string.concat(
            '{\n',
            '  "network": "',
            vm.toString(block.chainid),
            '",\n',
            '  "deployer": "',
            vm.toString(admin),
            '",\n',
            '  "timestamp": "',
            vm.toString(block.timestamp),
            '",\n',
            '  "contracts": {\n',
            '    "BloomFilter": "',
            vm.toString(address(bloomFilter)),
            '",\n',
            '    "RevocationRegistry": "',
            vm.toString(address(revocationRegistry)),
            '",\n',
            '    "ValidatorConsensus": "',
            vm.toString(address(validatorConsensus)),
            '",\n',
            '    "CertificateHashRegistry": "',
            vm.toString(address(certificateRegistry)),
            '"\n',
            '  }\n',
            '}'
        );

        vm.writeFile(
            string.concat(
                "deployments/bc-cvs-deployment.",
                vm.toString(block.chainid),
                ".json"
            ),
            json
        );

        console2.log("");
        console2.log(
            "Deployment info saved to: deployments/bc-cvs-deployment.",
            vm.toString(block.chainid),
            ".json"
        );
    }
}
