// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/IRevocationRegistry.sol";
import "../../libs/Roles.sol";
import "../../libs/Errors.sol";

/**
 * @title RevocationRegistry
 * @notice Sajjan Certificate Revocation Registry implementation  
 * @dev Manages certificate revocations and corrections with audit trail
 * @dev Blockchain immutability maintained - deletions not possible, only marking as invalid
 */
contract RevocationRegistry is IRevocationRegistry, AccessControl {
    // ============================================
    // State Variables
    // ============================================

    mapping(bytes32 => RevocationRecord) private revocations;
    mapping(bytes32 => bool) private isRevokedMapping;
    mapping(address => bytes32[]) private revokedByIssuer;

    bytes32[] private allRevokedHashes;
    uint256 private revocationCount;

    // Constants
    uint256 private constant MAX_REASON_LENGTH = 512; // 512 bytes max reason

    // ============================================
    // Constructor
    // ============================================

    /// @notice Constructor initializes the contract with admin role
    /// @param _admin Address of the administrator
    constructor(address _admin) {
        if (_admin == address(0)) revert Errors.ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(Roles.ADMINISTRATOR, _admin);
    }

    // ============================================
    // External Functions
    // ============================================

    /**
     * @notice Revoke a certificate
     * @param _certificateHash Hash of the certificate to revoke
     * @param _reason Reason for revocation
     */
    function revokeCertificate(
        bytes32 _certificateHash,
        string memory _reason
    ) external override onlyRole(Roles.CERTIFICATE_ISSUER) {
        // Input validation
        if (_certificateHash == bytes32(0)) revert Errors.InvalidCertificateHash();
        if (bytes(_reason).length == 0) revert Errors.EmptyString();
        if (bytes(_reason).length > MAX_REASON_LENGTH)
            revert Errors.InvalidInput();

        // Check if already revoked
        if (isRevokedMapping[_certificateHash])
            revert Errors.AlreadyRevoked(_certificateHash);

        // Create revocation record
        revocations[_certificateHash] = RevocationRecord({
            originalHash: _certificateHash,
            replacementHash: bytes32(0),
            revocationDate: block.timestamp,
            reason: _reason,
            revokedBy: msg.sender,
            isCorrected: false
        });

        // Update state
        isRevokedMapping[_certificateHash] = true;
        revokedByIssuer[msg.sender].push(_certificateHash);
        allRevokedHashes.push(_certificateHash);
        revocationCount++;

        emit CertificateRevoked(
            _certificateHash,
            msg.sender,
            block.timestamp,
            _reason
        );
    }

    /**
     * @notice Revoke and correct a certificate
     * @param _originalHash Hash of the defective certificate
     * @param _replacementHash Hash of the corrected certificate
     * @param _reason Reason for correction
     */
    function correctCertificate(
        bytes32 _originalHash,
        bytes32 _replacementHash,
        string memory _reason
    ) external override onlyRole(Roles.CERTIFICATE_ISSUER) {
        // Input validation
        if (_originalHash == bytes32(0) || _replacementHash == bytes32(0))
            revert Errors.InvalidCertificateHash();
        if (bytes(_reason).length == 0) revert Errors.EmptyString();
        if (bytes(_reason).length > MAX_REASON_LENGTH)
            revert Errors.InvalidInput();

        // Check if original is already revoked
        if (isRevokedMapping[_originalHash]) {
            // If already revoked, check if already corrected
            if (revocations[_originalHash].isCorrected)
                revert Errors.AlreadyCorrected(_originalHash);

            // Update existing revocation record
            revocations[_originalHash].replacementHash = _replacementHash;
            revocations[_originalHash].isCorrected = true;
        } else {
            // Create new revocation record with correction
            revocations[_originalHash] = RevocationRecord({
                originalHash: _originalHash,
                replacementHash: _replacementHash,
                revocationDate: block.timestamp,
                reason: _reason,
                revokedBy: msg.sender,
                isCorrected: true
            });

            // Update state
            isRevokedMapping[_originalHash] = true;
            revokedByIssuer[msg.sender].push(_originalHash);
            allRevokedHashes.push(_originalHash);
            revocationCount++;
        }

        emit CertificateCorrected(
            _originalHash,
            _replacementHash,
            msg.sender,
            block.timestamp
        );
    }

    /**
     * @notice Check if a certificate is revoked
     * @param _certificateHash Hash to check
     * @return isRevoked Whether the certificate is revoked
     */
    function isRevoked(bytes32 _certificateHash)
        external
        view
        override
        returns (bool)
    {
        return isRevokedMapping[_certificateHash];
    }

    /**
     * @notice Get revocation details for a certificate
     * @param _certificateHash Hash of the certificate
     * @return record Revocation record
     */
    function getRevocationRecord(bytes32 _certificateHash)
        external
        view
        override
        returns (RevocationRecord memory record)
    {
        if (!isRevokedMapping[_certificateHash])
            revert Errors.NotRevoked(_certificateHash);

        return revocations[_certificateHash];
    }

    /**
     * @notice Get replacement certificate hash (if corrected)
     * @param _originalHash Hash of the revoked certificate
     * @return replacementHash Hash of the replacement, or bytes32(0) if not corrected
     */
    function getReplacementCertificate(bytes32 _originalHash)
        external
        view
        override
        returns (bytes32 replacementHash)
    {
        if (!isRevokedMapping[_originalHash])
            revert Errors.NotRevoked(_originalHash);

        return revocations[_originalHash].replacementHash;
    }

    /**
     * @notice Get all revoked certificates by an issuer
     * @param _issuer Address of the issuer
     * @return hashes Array of revoked certificate hashes
     */
    function getRevokedCertificatesByIssuer(address _issuer)
        external
        view
        override
        returns (bytes32[] memory hashes)
    {
        return revokedByIssuer[_issuer];
    }

    /**
     * @notice Get total number of revoked certificates
     * @return count Total revocation count
     */
    function getTotalRevocations() external view override returns (uint256 count) {
        return revocationCount;
    }

    // ============================================
    // Additional View Functions
    // ============================================

    /**
     * @notice Get all revoked certificate hashes
     * @return hashes Array of all revoked certificate hashes
     */
    function getAllRevokedCertificates()
        external
        view
        returns (bytes32[] memory hashes)
    {
        return allRevokedHashes;
    }

    /**
     * @notice Get revocation statistics
     * @return totalRevocations Total number of revocations
     * @return totalCorrected Total number of corrected certificates
     * @return totalSimpleRevocations Total simple revocations (not corrected)
     */
    function getStatistics()
        external
        view
        returns (
            uint256 totalRevocations,
            uint256 totalCorrected,
            uint256 totalSimpleRevocations
        )
    {
        totalRevocations = revocationCount;
        totalCorrected = 0;

        for (uint256 i = 0; i < allRevokedHashes.length; i++) {
            if (revocations[allRevokedHashes[i]].isCorrected) {
                totalCorrected++;
            }
        }

        totalSimpleRevocations = totalRevocations - totalCorrected;

        return (totalRevocations, totalCorrected, totalSimpleRevocations);
    }

    /**
     * @notice Check if a revoked certificate was corrected
     * @param _certificateHash Hash of the certificate
     * @return isCorrected Whether the certificate was corrected
     */
    function isCertificateCorrected(bytes32 _certificateHash)
        external
        view
        returns (bool isCorrected)
    {
        if (!isRevokedMapping[_certificateHash]) return false;
        return revocations[_certificateHash].isCorrected;
    }

    /**
     * @notice Get revocation audit trail for a certificate
     * @param _certificateHash Hash of the certificate
     * @return originalHash Original certificate hash
     * @return replacementHash Replacement hash (if corrected)
     * @return revokedBy Address that revoked
     * @return revocationDate  Timestamp of revocation
     * @return reason Reason for revocation
     * @return isCorrected Whether it was corrected
     */
    function getAuditTrail(bytes32 _certificateHash)
        external
        view
        returns (
            bytes32 originalHash,
            bytes32 replacementHash,
            address revokedBy,
            uint256 revocationDate,
            string memory reason,
            bool isCorrected
        )
    {
        if (!isRevokedMapping[_certificateHash])
            revert Errors.NotRevoked(_certificateHash);

        RevocationRecord memory record = revocations[_certificateHash];

        return (
            record.originalHash,
            record.replacementHash,
            record.revokedBy,
            record.revocationDate,
            record.reason,
            record.isCorrected
        );
    }

    // ============================================
    // Admin Functions
    // ============================================

    /**
     * @notice Emergency revocation by admin (for security incidents)
     * @param _certificateHash Hash of the certificate to revoke
     * @param _reason Reason for emergency revocation
     */
    function emergencyRevoke(
        bytes32 _certificateHash,
        string memory _reason
    ) external onlyRole(Roles.ADMINISTRATOR) {
        // Input validation
        if (_certificateHash == bytes32(0)) revert Errors.InvalidCertificateHash();
        if (bytes(_reason).length == 0) revert Errors.EmptyString();

        // Check if already revoked
        if (isRevokedMapping[_certificateHash])
            revert Errors.AlreadyRevoked(_certificateHash);

        // Create revocation record
        revocations[_certificateHash] = RevocationRecord({
            originalHash: _certificateHash,
            replacementHash: bytes32(0),
            revocationDate: block.timestamp,
            reason: string(abi.encodePacked("[EMERGENCY] ", _reason)),
            revokedBy: msg.sender,
            isCorrected: false
        });

        // Update state
        isRevokedMapping[_certificateHash] = true;
        revokedByIssuer[msg.sender].push(_certificateHash);
        allRevokedHashes.push(_certificateHash);
        revocationCount++;

        emit CertificateRevoked(
            _certificateHash,
            msg.sender,
            block.timestamp,
            _reason
        );
    }
}
