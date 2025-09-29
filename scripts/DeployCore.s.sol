// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {TrustScore} from "../src/core/TrustScore.sol";
import {IdentityRegistry} from "../src/core/IdentityRegistry.sol";
import {VerificationManager} from "../src/verification/VerificationManager.sol";
import {OrganizationManager} from "../src/organizations/OrganizationManager.sol";
import {DisputeResolution} from "../src/governance/DisputeResolution.sol";
import {Roles} from "../src/libs/Roles.sol";

contract DeployCore is Script {
    function run() external {
        vm.startBroadcast();

        address admin = msg.sender;

        TrustScore trustScore = new TrustScore(admin);
        IdentityRegistry identityRegistry = new IdentityRegistry(admin, address(trustScore));
        VerificationManager verificationManager =
            new VerificationManager(admin, address(identityRegistry), address(trustScore));
        OrganizationManager organizationManager = new OrganizationManager(admin);
        DisputeResolution disputeResolution = new DisputeResolution(admin);

        trustScore.grantRole(Roles.TRUST_SCORE_UPDATER, address(verificationManager));
        organizationManager; // silence unused warning until wiring is expanded
        disputeResolution;

        vm.stopBroadcast();
    }
}
