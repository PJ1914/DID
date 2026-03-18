// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Script.sol";
import "../../lib/forge-std/src/console2.sol";
import {CertificateHashRegistry} from "../../src/bc-cvs/CertificateHashRegistry.sol";

/**
 * @title AuthorizeIssuer
 * @notice Grants CERTIFICATE_ISSUER role to a wallet so it can issue certificates
 * @dev Must be run by the contract ADMINISTRATOR (the deployer wallet)
 *
 * Usage:
 *   forge script script/bc-cvs/AuthorizeIssuer.s.sol:AuthorizeIssuer \
 *     --rpc-url $RPC_URL \
 *     --private-key $PRIVATE_KEY \
 *     --broadcast
 *
 * Required environment variables:
 *   PRIVATE_KEY                  - Admin's private key (the deployer/administrator wallet)
 *   CERTIFICATE_HASH_REGISTRY    - CertificateHashRegistry contract address
 *   ISSUER_ADDRESS               - Wallet address to authorize as certificate issuer
 */
contract AuthorizeIssuer is Script {
    function run() external {
        uint256 adminKey = vm.envUint("PRIVATE_KEY");
        address admin = vm.addr(adminKey);

        address registryAddress = vm.envAddress("CERTIFICATE_HASH_REGISTRY");
        address issuerAddress = vm.envAddress("ISSUER_ADDRESS");

        CertificateHashRegistry registry = CertificateHashRegistry(registryAddress);

        console2.log("==============================================");
        console2.log("Authorize Certificate Issuer");
        console2.log("==============================================");
        console2.log("Admin (you):", admin);
        console2.log("Registry:  ", registryAddress);
        console2.log("Issuer:    ", issuerAddress);
        console2.log("");

        // Check current status before granting
        bool alreadyAuthorized = registry.isAuthorizedIssuer(issuerAddress);
        console2.log("Already authorized?", alreadyAuthorized);

        if (alreadyAuthorized) {
            console2.log("[INFO] Address is already an authorized issuer. Nothing to do.");
            return;
        }

        vm.startBroadcast(adminKey);
        registry.authorizeIssuer(issuerAddress);
        vm.stopBroadcast();

        console2.log("");
        console2.log("[SUCCESS] Issuer authorized!");
        console2.log("  Address:", issuerAddress);
        console2.log("  They now hold CERTIFICATE_ISSUER role and can issue certificates.");
        console2.log("==============================================");
    }
}
