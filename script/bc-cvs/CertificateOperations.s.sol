// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../lib/forge-std/src/Script.sol";
import "../../lib/forge-std/src/console2.sol";
import {CertificateHashRegistry} from "../../src/bc-cvs/CertificateHashRegistry.sol";
import {ICertificateHashRegistry} from "../../src/bc-cvs/interfaces/ICertificateHashRegistry.sol";

/**
 * @title IssueCertificate
 * @notice Script to issue a new certificate
 * @dev Usage: forge script script/bc-cvs/CertificateOperations.s.sol:IssueCertificate --rpc-url $RPC_URL --private-key-env PRIVATE_KEY --broadcast
 * 
 * Environment Variables:
 * - CERTIFICATE_REGISTRY_ADDRESS: Address of CertificateHashRegistry contract
 * - CERTIFICATE_HASH: SHA-256 hash of certificate (bytes32)
 * - RSA_SIGNATURE: RSA signature (bytes)
 * - HOLDER_ADDRESS: Address of certificate holder
 * - ISSUER_PUB_KEY: Issuer's public key (bytes)
 * - METADATA: Certificate metadata (string) - optional, use "" if not needed
 */
contract IssueCertificate is Script {
    function run() external {
        uint256 issuerKey = vm.envUint("PRIVATE_KEY");
        address issuer = vm.addr(issuerKey);

        address registryAddress = vm.envAddress("CERTIFICATE_REGISTRY_ADDRESS");
        bytes32 certificateHash = vm.envBytes32("CERTIFICATE_HASH");
        bytes memory rsaSignature = vm.envBytes("RSA_SIGNATURE");
        address holder = vm.envAddress("HOLDER_ADDRESS");
        bytes memory issuerPubKey = vm.envBytes("ISSUER_PUB_KEY");
        
        // Metadata is optional
        string memory metadata = "";
        try vm.envString("METADATA") returns (string memory _metadata) {
            metadata = _metadata;
        } catch {
            // Use empty string if not provided
        }

        CertificateHashRegistry registry = CertificateHashRegistry(registryAddress);

        console2.log("==============================================");
        console2.log("Issuing Certificate");
        console2.log("==============================================");
        console2.log("Issuer:", issuer);
        console2.log("Registry:", registryAddress);
        console2.log("Certificate Hash:", vm.toString(certificateHash));
        console2.log("Holder:", holder);
        console2.log("Metadata:", bytes(metadata).length > 0 ? metadata : "(none)");
        console2.log("");

        vm.startBroadcast(issuerKey);

        registry.issueCertificate(
            certificateHash,
            rsaSignature,
            holder,
            issuerPubKey,
            metadata
        );

        console2.log("[SUCCESS] Certificate issued!");

        vm.stopBroadcast();

        // Display certificate details
        ICertificateHashRegistry.Certificate memory cert = registry.getCertificate(certificateHash);
        
        console2.log("");
        console2.log("Certificate Details:");
        console2.log("----------------------------");
        console2.log("  Hash:", vm.toString(cert.certificateHash));
        console2.log("  Issuer:", cert.issuer);
        console2.log("  Holder:", cert.holder);
        console2.log("  Issued At:", cert.issuedAt);
        console2.log("  Revoked:", cert.isRevoked);
        console2.log("");
        console2.log("Certificate is now:");
        console2.log("  - Stored in CertificateHashRegistry");
        console2.log("  - Added to Bloom filter for fast verification");
        console2.log("  - Verifiable by anyone");
        console2.log("==============================================");
    }
}

/**
 * @title VerifyCertificate
 * @notice Script to verify a certificate
 * @dev Usage: forge script script/bc-cvs/CertificateOperations.s.sol:VerifyCertificate --rpc-url $RPC_URL --private-key-env PRIVATE_KEY --broadcast
 * 
 * Environment Variables:
 * - CERTIFICATE_REGISTRY_ADDRESS: Address of CertificateHashRegistry contract
 * - CERTIFICATE_HASH: Hash of certificate to verify
 * - RSA_SIGNATURE: RSA signature to verify
 */
contract VerifyCertificate is Script {
    function run() external view {
        address registryAddress = vm.envAddress("CERTIFICATE_REGISTRY_ADDRESS");
        bytes32 certificateHash = vm.envBytes32("CERTIFICATE_HASH");
        bytes memory rsaSignature = vm.envBytes("RSA_SIGNATURE");

        CertificateHashRegistry registry = CertificateHashRegistry(registryAddress);

        console2.log("==============================================");
        console2.log("Verifying Certificate");
        console2.log("==============================================");
        console2.log("Registry:", registryAddress);
        console2.log("Certificate Hash:", vm.toString(certificateHash));
        console2.log("");

        // Step 1: Bloom filter check (fast pre-verification)
        console2.log("Step 1: Bloom Filter Check...");
        // Note: We can't call bloom filter directly, but registry handles it internally
        
        // Step 2: Full verification
        console2.log("Step 2: Full Verification...");
        bool isValid = registry.verifyCertificate(certificateHash, rsaSignature);

        console2.log("");
        if (isValid) {
            console2.log("✓ CERTIFICATE VALID");
            
            // Get certificate details
            ICertificateHashRegistry.Certificate memory cert = registry.getCertificate(certificateHash);
            
            console2.log("");
            console2.log("Certificate Details:");
            console2.log("----------------------------");
            console2.log("  Issuer:", cert.issuer);
            console2.log("  Holder:", cert.holder);
            console2.log("  Issued At:", cert.issuedAt);
            console2.log("  Revoked:", cert.isRevoked ? "Yes" : "No");
            console2.log("  Metadata:", cert.metadata);
            
            if (cert.isRevoked) {
                console2.log("");
                console2.log("⚠️  WARNING: Certificate has been revoked!");
                console2.log("  Check RevocationRegistry for revocation details");
            }
        } else {
            console2.log("✗ CERTIFICATE INVALID");
            console2.log("");
            console2.log("Possible reasons:");
            console2.log("  - Certificate does not exist");
            console2.log("  - Signature verification failed");
            console2.log("  - Certificate has been revoked");
        }
        
        console2.log("==============================================");
    }
}

/**
 * @title GetCertificateDetails
 * @notice Script to retrieve all details of a certificate
 * @dev Usage: forge script script/bc-cvs/CertificateOperations.s.sol:GetCertificateDetails --rpc-url $RPC_URL --private-key-env PRIVATE_KEY
 * 
 * Environment Variables:
 * - CERTIFICATE_REGISTRY_ADDRESS: Address of CertificateHashRegistry contract
 * - CERTIFICATE_HASH: Hash of certificate to query
 */
contract GetCertificateDetails is Script {
    function run() external view {
        address registryAddress = vm.envAddress("CERTIFICATE_REGISTRY_ADDRESS");
        bytes32 certificateHash = vm.envBytes32("CERTIFICATE_HASH");

        CertificateHashRegistry registry = CertificateHashRegistry(registryAddress);

        console2.log("==============================================");
        console2.log("Certificate Details");
        console2.log("==============================================");
        console2.log("Registry:", registryAddress);
        console2.log("Certificate Hash:", vm.toString(certificateHash));
        console2.log("");

        // Check if certificate exists
        if (!registry.certificateExists(certificateHash)) {
            console2.log("✗ Certificate does not exist");
            console2.log("==============================================");
            return;
        }

        // Get certificate details
        ICertificateHashRegistry.Certificate memory cert = registry.getCertificate(certificateHash);

        console2.log("Certificate Information:");
        console2.log("----------------------------");
        console2.log("  Hash:", vm.toString(cert.certificateHash));
        console2.log("  Issuer:", cert.issuer);
        console2.log("  Holder:", cert.holder);
        console2.log("  Issued At:", cert.issuedAt);
        console2.log("  Revoked:", cert.isRevoked ? "Yes" : "No");
        console2.log("  Metadata:", bytes(cert.metadata).length > 0 ? cert.metadata : "(none)");
        console2.log("");
        
        console2.log("Signature Information:");
        console2.log("----------------------------");
        console2.log("  RSA Signature Length:", cert.rsaSignature.length, "bytes");
        console2.log("  Issuer Public Key Length:", cert.issuerPublicKey.length, "bytes");
        console2.log("");

        // Get statistics
        uint256 totalCerts = registry.getTotalCertificates();
        console2.log("Registry Statistics:");
        console2.log("----------------------------");
        console2.log("  Total Certificates:", totalCerts);
        console2.log("==============================================");
    }
}

/**
 * @title GetCertificatesByIssuer
 * @notice Script to retrieve all certificates issued by a specific issuer
 * @dev Usage: forge script script/bc-cvs/CertificateOperations.s.sol:GetCertificatesByIssuer --rpc-url $RPC_URL --private-key-env PRIVATE_KEY
 * 
 * Environment Variables:
 * - CERTIFICATE_REGISTRY_ADDRESS: Address of CertificateHashRegistry contract
 * - ISSUER_ADDRESS: Address of issuer to query
 * - OFFSET: Starting index (default: 0)
 * - LIMIT: Number of certificates to return (default: 100)
 */
contract GetCertificatesByIssuer is Script {
    function run() external view {
        address registryAddress = vm.envAddress("CERTIFICATE_REGISTRY_ADDRESS");
        address issuerAddress = vm.envAddress("ISSUER_ADDRESS");
        
        uint256 offset = 0;
        try vm.envUint("OFFSET") returns (uint256 _offset) {
            offset = _offset;
        } catch {}

        uint256 limit = 100;
        try vm.envUint("LIMIT") returns (uint256 _limit) {
            limit = _limit;
        } catch {}

        CertificateHashRegistry registry = CertificateHashRegistry(registryAddress);

        console2.log("==============================================");
        console2.log("Certificates by Issuer");
        console2.log("==============================================");
        console2.log("Registry:", registryAddress);
        console2.log("Issuer:", issuerAddress);
        console2.log("Offset:", offset);
        console2.log("Limit:", limit);
        console2.log("");

        bytes32[] memory certificates = registry.getCertificatesByIssuer(
            issuerAddress,
            offset,
            limit
        );

        console2.log("Found", certificates.length, "certificates");
        console2.log("");

        for (uint256 i = 0; i < certificates.length; i++) {
            ICertificateHashRegistry.Certificate memory cert = registry.getCertificate(
                certificates[i]
            );
            
            console2.log("Certificate", i + 1);
            console2.log("  Hash:", vm.toString(cert.certificateHash));
            console2.log("  Holder:", cert.holder);
            console2.log("  Issued At:", cert.issuedAt);
            console2.log("  Revoked:", cert.isRevoked ? "Yes" : "No");
            console2.log("");
        }

        console2.log("==============================================");
    }
}

/**
 * @title GetCertificatesByHolder
 * @notice Script to retrieve all certificates held by a specific holder
 * @dev Usage: forge script script/bc-cvs/CertificateOperations.s.sol:GetCertificatesByHolder --rpc-url $RPC_URL --private-key-env PRIVATE_KEY
 * 
 * Environment Variables:
 * - CERTIFICATE_REGISTRY_ADDRESS: Address of CertificateHashRegistry contract
 * - HOLDER_ADDRESS: Address of holder to query
 * - OFFSET: Starting index (default: 0)
 * - LIMIT: Number of certificates to return (default: 100)
 */
contract GetCertificatesByHolder is Script {
    function run() external view {
        address registryAddress = vm.envAddress("CERTIFICATE_REGISTRY_ADDRESS");
        address holderAddress = vm.envAddress("HOLDER_ADDRESS");
        
        uint256 offset = 0;
        try vm.envUint("OFFSET") returns (uint256 _offset) {
            offset = _offset;
        } catch {}

        uint256 limit = 100;
        try vm.envUint("LIMIT") returns (uint256 _limit) {
            limit = _limit;
        } catch {}

        CertificateHashRegistry registry = CertificateHashRegistry(registryAddress);

        console2.log("==============================================");
        console2.log("Certificates by Holder");
        console2.log("==============================================");
        console2.log("Registry:", registryAddress);
        console2.log("Holder:", holderAddress);
        console2.log("Offset:", offset);
        console2.log("Limit:", limit);
        console2.log("");

        bytes32[] memory certificates = registry.getCertificatesByHolder(
            holderAddress,
            offset,
            limit
        );

        console2.log("Found", certificates.length, "certificates");
        console2.log("");

        for (uint256 i = 0; i < certificates.length; i++) {
            ICertificateHashRegistry.Certificate memory cert = registry.getCertificate(
                certificates[i]
            );
            
            console2.log("Certificate", i + 1);
            console2.log("  Hash:", vm.toString(cert.certificateHash));
            console2.log("  Issuer:", cert.issuer);
            console2.log("  Issued At:", cert.issuedAt);
            console2.log("  Revoked:", cert.isRevoked ? "Yes" : "No");
            console2.log("");
        }

        console2.log("==============================================");
    }
}
