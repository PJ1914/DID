// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {TrustScore} from "../src/core/TrustScore.sol";
import {IdentityRegistry} from "../src/core/IdentityRegistry.sol";
import {VerificationManager} from "../src/verification/VerificationManager.sol";
import {OrganizationManager} from "../src/organizations/OrganizationManager.sol";
import {VerificationLogger} from "../src/core/VerificationLogger.sol";
import {Roles} from "../src/libs/Roles.sol";

contract DeployCore is Script {
    function run() external {
        uint256 deployerKey = vm.envOr("PRIVATE_KEY", uint256(0));
        address admin = vm.envOr("ADMIN", address(0));

        if (deployerKey != 0) {
            if (admin == address(0)) {
                admin = vm.addr(deployerKey);
            }
            vm.startBroadcast(deployerKey);
        } else {
            require(
                admin != address(0),
                "ADMIN env required when PRIVATE_KEY unset"
            );
            vm.startBroadcast();
        }

        VerificationLogger logger = new VerificationLogger(admin);
        TrustScore trustScore = new TrustScore(admin);
        IdentityRegistry identityRegistry = new IdentityRegistry(
            admin,
            address(trustScore)
        );
        VerificationManager verificationManager = new VerificationManager(
            admin,
            address(identityRegistry),
            address(trustScore)
        );
        OrganizationManager organizationManager = new OrganizationManager(
            admin
        );
        trustScore.grantRole(
            Roles.TRUST_SCORE_UPDATER,
            address(verificationManager)
        );

        console2.log("VerificationLogger", address(logger));
        console2.log("TrustScore", address(trustScore));
        console2.log("IdentityRegistry", address(identityRegistry));
        console2.log("VerificationManager", address(verificationManager));
        console2.log("OrganizationManager", address(organizationManager));

        vm.stopBroadcast();
    }
}
