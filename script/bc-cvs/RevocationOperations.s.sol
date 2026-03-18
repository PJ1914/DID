// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Script.sol";
import "../../lib/forge-std/src/console2.sol";
import {RevocationRegistry} from "../../src/bc-cvs/RevocationRegistry.sol";
import {IRevocationRegistry} from "../../src/bc-cvs/interfaces/IRevocationRegistry.sol";
import {CertificateHashRegistry} from "../../src/bc-cvs/CertificateHashRegistry.sol";

/**
 * @title RevokeCertificate
 * @notice Script to revoke a certificate
 * @dev Usage: forge script script/bc-cvs/RevocationOperations.s.sol:RevokeCertificate --rpc-url $RPC_URL --private-key-env PRIVATE_KEY --broadcast
 * 
 * Environment Variables:
 * - CERTIFICATE_REGISTRY_ADDRESS: Address of CertificateHashRegistry contract
 * - CERTIFICATE_HASH: Hash of certificate to revoke
 * - REVOCATION_REASON: Reason for revocation (string)
 */
contract RevokeCertificate is Script {
    function run() external {
        uint256 issuerKey = vm.envUint("PRIVATE_KEY");
        address issuer = vm.addr(issuerKey);

        address registryAddress = vm.envAddress("CERTIFICATE_REGISTRY_ADDRESS");
        bytes32 certificateHash = vm.envBytes32("CERTIFICATE_HASH");
        string memory reason = vm.envString("REVOCATION_REASON");

        CertificateHashRegistry registry = CertificateHashRegistry(registryAddress);

        console2.log("==============================================");
        console2.log("Revoking Certificate");
        console2.log("==============================================");
        console2.log("Issuer:", issuer);
        console2.log("Registry:", registryAddress);
        console2.log("Certificate Hash:", vm.toString(certificateHash));
        console2.log("Reason:", reason);
        console2.log("");

        vm.startBroadcast(issuerKey);

        registry.revokeCertificate(certificateHash, reason);
        console2.log("[SUCCESS] Certificate revoked!");

        vm.stopBroadcast();

        console2.log("");
        console2.log("Certificate is now:");
        console2.log("  - Marked as revoked in CertificateHashRegistry");
        console2.log("  - Recorded in RevocationRegistry audit trail");
        console2.log("  - Will fail verification checks");
        console2.log("==============================================");
    }
}

/**
 * @title CorrectCertificate
 * @notice Script to correct a revoked certificate with a new version
 * @dev Usage: forge script script/bc-cvs/RevocationOperations.s.sol:CorrectCertificate --rpc-url $RPC_URL --private-key-env PRIVATE_KEY --broadcast
 * 
 * Environment Variables:
 * - CERTIFICATE_REGISTRY_ADDRESS: Address of CertificateHashRegistry contract
 * - ORIGINAL_CERTIFICATE_HASH: Hash of original (revoked) certificate
 * - REPLACEMENT_CERTIFICATE_HASH: Hash of replacement certificate
 * - CORRECTION_REASON: Reason for correction (string)
 */
contract CorrectCertificate is Script {
    function run() external {
        uint256 issuerKey = vm.envUint("PRIVATE_KEY");
        address issuer = vm.addr(issuerKey);

        address registryAddress = vm.envAddress("CERTIFICATE_REGISTRY_ADDRESS");
        bytes32 originalHash = vm.envBytes32("ORIGINAL_CERTIFICATE_HASH");
        bytes32 replacementHash = vm.envBytes32("REPLACEMENT_CERTIFICATE_HASH");
        string memory reason = vm.envString("CORRECTION_REASON");

        CertificateHashRegistry registry = CertificateHashRegistry(registryAddress);

        console2.log("==============================================");
        console2.log("Correcting Certificate");
        console2.log("==============================================");
        console2.log("Issuer:", issuer);
        console2.log("Registry:", registryAddress);
        console2.log("Original Hash:", vm.toString(originalHash));
        console2.log("Replacement Hash:", vm.toString(replacementHash));
        console2.log("Reason:", reason);
        console2.log("");

        vm.startBroadcast(issuerKey);

        registry.correctCertificate(originalHash, replacementHash, reason);
        console2.log("[SUCCESS] Certificate corrected!");

        vm.stopBroadcast();

        console2.log("");
        console2.log("Correction recorded:");
        console2.log("  - Original certificate remains revoked");
        console2.log("  - Replacement hash linked in audit trail");
        console2.log("  - Correction reason documented");
        console2.log("");
        console2.log("Next Steps:");
        console2.log("  1. Issue new certificate with replacement hash");
        console2.log("  2. Notify certificate holder of correction");
        console2.log("==============================================");
    }
}

/**
 * @title BatchRevokeCertificates
 * @notice Script to revoke multiple certificates in a single transaction
 * @dev Usage: forge script script/bc-cvs/RevocationOperations.s.sol:BatchRevokeCertificates --rpc-url $RPC_URL --private-key-env PRIVATE_KEY --broadcast
 * 
 * Environment Variables:
 * - REVOCATION_REGISTRY_ADDRESS: Address of RevocationRegistry contract
 * - CERTIFICATE_HASHES: Comma-separated list of certificate hashes (or use array in script)
 * - REVOCATION_REASONS: Comma-separated list of reasons (or use array in script)
 */
contract BatchRevokeCertificates is Script {
    function run() external {
        uint256 issuerKey = vm.envUint("PRIVATE_KEY");
        address issuer = vm.addr(issuerKey);

        address registryAddress = vm.envAddress("REVOCATION_REGISTRY_ADDRESS");
        RevocationRegistry registry = RevocationRegistry(registryAddress);

        // Define certificates to revoke (customize as needed)
        bytes32[] memory hashes = new bytes32[](3);
        hashes[0] = 0x1111111111111111111111111111111111111111111111111111111111111111;
        hashes[1] = 0x2222222222222222222222222222222222222222222222222222222222222222;
        hashes[2] = 0x3333333333333333333333333333333333333333333333333333333333333333;

        string[] memory reasons = new string[](3);
        reasons[0] = "Batch revocation - lost documents";
        reasons[1] = "Batch revocation - lost documents";
        reasons[2] = "Batch revocation - lost documents";

        console2.log("==============================================");
        console2.log("Batch Revoking Certificates");
        console2.log("==============================================");
        console2.log("Issuer:", issuer);
        console2.log("Registry:", registryAddress);
        console2.log("Certificates to revoke:", hashes.length);
        console2.log("");

        vm.startBroadcast(issuerKey);

        registry.batchRevokeCertificates(hashes, reasons);
        console2.log("[SUCCESS] Batch revocation complete!");

        vm.stopBroadcast();

        console2.log("");
        console2.log("Revoked", hashes.length, "certificates in one transaction");
        console2.log("==============================================");
    }
}

/**
 * @title GetRevocationAuditTrail
 * @notice Script to retrieve complete audit trail for a certificate
 * @dev Usage: forge script script/bc-cvs/RevocationOperations.s.sol:GetRevocationAuditTrail --rpc-url $RPC_URL --private-key-env PRIVATE_KEY
 * 
 * Environment Variables:
 * - REVOCATION_REGISTRY_ADDRESS: Address of RevocationRegistry contract
 * - CERTIFICATE_HASH: Hash of certificate to query
 */
contract GetRevocationAuditTrail is Script {
    function run() external view {
        address registryAddress = vm.envAddress("REVOCATION_REGISTRY_ADDRESS");
        bytes32 certificateHash = vm.envBytes32("CERTIFICATE_HASH");

        RevocationRegistry registry = RevocationRegistry(registryAddress);

        console2.log("==============================================");
        console2.log("Revocation Audit Trail");
        console2.log("==============================================");
        console2.log("Registry:", registryAddress);
        console2.log("Certificate Hash:", vm.toString(certificateHash));
        console2.log("");

        // Check if certificate is revoked
        if (!registry.isRevoked(certificateHash)) {
            console2.log("Certificate is NOT revoked");
            console2.log("==============================================");
            return;
        }

        // Get audit trail
        (
            IRevocationRegistry.RevocationRecord memory revRecord,
            IRevocationRegistry.CorrectionRecord memory corrRecord,
            bool hasCorrection
        ) = registry.getAuditTrail(certificateHash);

        console2.log("Revocation Information:");
        console2.log("----------------------------");
        console2.log("  Revoked By:", revRecord.revoker);
        console2.log("  Reason:", revRecord.reason);
        console2.log("  Timestamp:", revRecord.timestamp);
        console2.log("");

        if (hasCorrection) {
            console2.log("Correction Information:");
            console2.log("----------------------------");
            console2.log("  Corrected By:", corrRecord.corrector);
            console2.log("  Replacement Hash:", vm.toString(corrRecord.replacementHash));
            console2.log("  Correction Reason:", corrRecord.reason);
            console2.log("  Timestamp:", corrRecord.timestamp);
            console2.log("");
            console2.log("✓ Certificate has been corrected");
            console2.log("  Use replacement hash for new certificate");
        } else {
            console2.log("No correction recorded");
        }

        console2.log("==============================================");
    }
}

/**
 * @title GetRevocationsByIssuer
 * @notice Script to retrieve all revocations by a specific issuer
 * @dev Usage: forge script script/bc-cvs/RevocationOperations.s.sol:GetRevocationsByIssuer --rpc-url $RPC_URL --private-key-env PRIVATE_KEY
 * 
 * Environment Variables:
 * - REVOCATION_REGISTRY_ADDRESS: Address of RevocationRegistry contract
 * - ISSUER_ADDRESS: Address of issuer to query
 * - OFFSET: Starting index (default: 0)
 * - LIMIT: Number of results to return (default: 100)
 */
contract GetRevocationsByIssuer is Script {
    function run() external view {
        address registryAddress = vm.envAddress("REVOCATION_REGISTRY_ADDRESS");
        address issuerAddress = vm.envAddress("ISSUER_ADDRESS");
        
        uint256 offset = 0;
        try vm.envUint("OFFSET") returns (uint256 _offset) {
            offset = _offset;
        } catch {}

        uint256 limit = 100;
        try vm.envUint("LIMIT") returns (uint256 _limit) {
            limit = _limit;
        } catch {}

        RevocationRegistry registry = RevocationRegistry(registryAddress);

        console2.log("==============================================");
        console2.log("Revocations by Issuer");
        console2.log("==============================================");
        console2.log("Registry:", registryAddress);
        console2.log("Issuer:", issuerAddress);
        console2.log("Offset:", offset);
        console2.log("Limit:", limit);
        console2.log("");

        bytes32[] memory revocations = registry.getRevocationsByIssuer(
            issuerAddress,
            offset,
            limit
        );

        console2.log("Found", revocations.length, "revocations");
        console2.log("");

        for (uint256 i = 0; i < revocations.length; i++) {
            IRevocationRegistry.RevocationRecord memory revRecord = registry.getRevocationRecord(
                revocations[i]
            );
            
            console2.log("Revocation", i + 1);
            console2.log("  Certificate Hash:", vm.toString(revRecord.certificateHash));
            console2.log("  Reason:", revRecord.reason);
            console2.log("  Timestamp:", revRecord.timestamp);
            
            // Check if corrected
            if (registry.isCorrected(revocations[i])) {
                bytes32 replacement = registry.getReplacementHash(revocations[i]);
                console2.log("  Status: CORRECTED");
                console2.log("  Replacement:", vm.toString(replacement));
            } else {
                console2.log("  Status: Revoked (no correction)");
            }
            console2.log("");
        }

        console2.log("==============================================");
    }
}

/**
 * @title GetRevocationStatistics
 * @notice Script to retrieve RevocationRegistry statistics
 * @dev Usage: forge script script/bc-cvs/RevocationOperations.s.sol:GetRevocationStatistics --rpc-url $RPC_URL --private-key-env PRIVATE_KEY
 * 
 * Environment Variables:
 * - REVOCATION_REGISTRY_ADDRESS: Address of RevocationRegistry contract
 */
contract GetRevocationStatistics is Script {
    function run() external view {
        address registryAddress = vm.envAddress("REVOCATION_REGISTRY_ADDRESS");
        RevocationRegistry registry = RevocationRegistry(registryAddress);

        console2.log("==============================================");
        console2.log("Revocation Registry Statistics");
        console2.log("==============================================");
        console2.log("Registry:", registryAddress);
        console2.log("");

        (uint256 totalRevocations, uint256 totalCorrections) = registry.getStatistics();

        console2.log("Statistics:");
        console2.log("----------------------------");
        console2.log("  Total Revocations:", totalRevocations);
        console2.log("  Total Corrections:", totalCorrections);
        console2.log("  Uncorrected Revocations:", totalRevocations - totalCorrections);
        console2.log("");

        if (totalRevocations > 0) {
            uint256 correctionRate = (totalCorrections * 100) / totalRevocations;
            console2.log("  Correction Rate:", correctionRate, "%");
        }

        console2.log("==============================================");
    }
}
