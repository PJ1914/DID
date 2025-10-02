// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../lib/forge-std/src/Script.sol";
import "../../lib/forge-std/src/console2.sol";
import {Roles} from "../../src/libs/Roles.sol";
import {VerificationLogger} from "../../src/core/VerificationLogger.sol";
import {TrustScore} from "../../src/core/TrustScore.sol";
import {IdentityRegistry} from "../../src/core/IdentityRegistry.sol";
import {VerificationManager} from "../../src/verification/VerificationManager.sol";
import {OrganizationManager} from "../../src/organizations/OrganizationManager.sol";
import {CertificateManager} from "../../src/organizations/CertificateManager.sol";
import {ZKProofManager} from "../../src/verification/ZKProofManager.sol";
import {Groth16Verifier as AgeVerifierContract} from "../../src/verification/verifiers/AgeVerifier.sol";
import {Groth16Verifier as AgeMaxVerifierContract} from "../../src/verification/verifiers/AgeMaxVerifier.sol";
import {Groth16Verifier as AttrVerifierContract} from "../../src/verification/verifiers/AttrVerifier.sol";
import {Groth16Verifier as IncomeVerifierContract} from "../../src/verification/verifiers/IncomeVerifier.sol";

contract DeployAll is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        address admin = vm.addr(deployerKey);

        vm.startBroadcast(deployerKey);

        VerificationLogger verificationLogger = new VerificationLogger(admin);
        TrustScore trustScore = new TrustScore(admin);
        IdentityRegistry identityRegistry = new IdentityRegistry({
            admin: admin,
            trustScore_: address(trustScore)
        });

        VerificationManager verificationManager = new VerificationManager({
            admin: admin,
            identityRegistry_: address(identityRegistry),
            trustScore_: address(trustScore)
        });

        OrganizationManager organizationManager = new OrganizationManager(
            admin
        );
        CertificateManager certificateManager = new CertificateManager(
            admin,
            address(organizationManager),
            address(identityRegistry),
            address(verificationLogger)
        );

        AgeVerifierContract ageVerifier = new AgeVerifierContract();
        AgeMaxVerifierContract ageMaxVerifier = new AgeMaxVerifierContract();
        AttrVerifierContract attrVerifier = new AttrVerifierContract();
        IncomeVerifierContract incomeVerifier = new IncomeVerifierContract();

        ZKProofManager.ProofTypeConfig[]
            memory proofTypes = new ZKProofManager.ProofTypeConfig[](4);
        proofTypes[0] = ZKProofManager.ProofTypeConfig({
            name: "age_gte",
            verifier: address(ageVerifier),
            active: true
        });
        proofTypes[1] = ZKProofManager.ProofTypeConfig({
            name: "age_lte",
            verifier: address(ageMaxVerifier),
            active: true
        });
        proofTypes[2] = ZKProofManager.ProofTypeConfig({
            name: "attr_equals",
            verifier: address(attrVerifier),
            active: true
        });
        proofTypes[3] = ZKProofManager.ProofTypeConfig({
            name: "income_gte",
            verifier: address(incomeVerifier),
            active: true
        });

        ZKProofManager zkProofManager = new ZKProofManager(admin, proofTypes);

        // Grant cross-contract roles
        trustScore.grantRole(
            Roles.TRUST_SCORE_UPDATER,
            address(verificationManager)
        );
        verificationLogger.grantLoggerRole(admin);
        verificationLogger.grantLoggerRole(address(verificationManager));
        verificationLogger.grantLoggerRole(address(organizationManager));
        verificationLogger.grantLoggerRole(address(certificateManager));

        // Register the deployer as an initial verification provider for demos
        verificationManager.registerProvider(
            admin,
            "Default Admin Provider",
            ""
        );

        vm.stopBroadcast();

        console2.log("--- Deployment Summary ---");
        console2.log("Deployer", admin);
        console2.log("VerificationLogger", address(verificationLogger));
        console2.log("TrustScore", address(trustScore));
        console2.log("IdentityRegistry", address(identityRegistry));
        console2.log("VerificationManager", address(verificationManager));
        console2.log("OrganizationManager", address(organizationManager));
        console2.log("CertificateManager", address(certificateManager));
        console2.log("ZKProofManager", address(zkProofManager));
        console2.log("AgeVerifier", address(ageVerifier));
        console2.log("AgeMaxVerifier", address(ageMaxVerifier));
        console2.log("AttrVerifier", address(attrVerifier));
        console2.log("IncomeVerifier", address(incomeVerifier));

        string memory root = "deployment";
        string memory json = vm.serializeUint(
            root,
            "network.chainId",
            block.chainid
        );
        json = vm.serializeString(
            root,
            "network.name",
            _networkName(block.chainid)
        );
        json = vm.serializeAddress(root, "deployer.address", admin);

        json = vm.serializeAddress(
            root,
            "core.verificationLogger",
            address(verificationLogger)
        );
        json = vm.serializeAddress(
            root,
            "core.trustScore",
            address(trustScore)
        );
        json = vm.serializeAddress(
            root,
            "core.identityRegistry",
            address(identityRegistry)
        );
        json = vm.serializeAddress(
            root,
            "verification.manager",
            address(verificationManager)
        );
        json = vm.serializeAddress(
            root,
            "organizations.manager",
            address(organizationManager)
        );
        json = vm.serializeAddress(
            root,
            "organizations.certificateManager",
            address(certificateManager)
        );
        json = vm.serializeAddress(root, "zk.manager", address(zkProofManager));
        json = vm.serializeAddress(
            root,
            "zk.verifiers.age_gte",
            address(ageVerifier)
        );
        json = vm.serializeAddress(
            root,
            "zk.verifiers.age_lte",
            address(ageMaxVerifier)
        );
        json = vm.serializeAddress(
            root,
            "zk.verifiers.attr_equals",
            address(attrVerifier)
        );
        json = vm.serializeAddress(
            root,
            "zk.verifiers.income_gte",
            address(incomeVerifier)
        );
        json = vm.serializeString(
            root,
            "meta.generatedAt",
            vm.toString(block.timestamp)
        );
        json = vm.serializeString(
            root,
            "meta.note",
            "Auto-generated by DeployAll.s.sol"
        );

        string memory outputPath = string(
            abi.encodePacked(
                "deployments/deployment.",
                vm.toString(block.chainid),
                ".json"
            )
        );

        vm.writeJson(json, outputPath);
        console2.log("Deployment artifact written to:", outputPath);

        string memory frontendPath = vm.envOr(
            "FRONTEND_CONFIG_PATH",
            string("")
        );
        if (bytes(frontendPath).length != 0) {
            vm.writeJson(json, frontendPath);
            console2.log("Frontend config mirrored to:", frontendPath);
        }
    }

    function _networkName(
        uint256 chainId
    ) internal pure returns (string memory) {
        if (chainId == 1) {
            return "mainnet";
        }
        if (chainId == 5) {
            return "goerli";
        }
        if (chainId == 10) {
            return "optimism";
        }
        if (chainId == 137) {
            return "polygon";
        }
        if (chainId == 11155111) {
            return "sepolia";
        }
        if (chainId == 31337) {
            return "anvil";
        }
        return "unknown";
    }
}
