// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IRevocationRegistry
 * @notice Interface for the Sajjan Certificate Revocation Registry
 * @dev Manages certificate revocations and corrections according to Sajjan architecture
 */
interface IRevocationRegistry {
    /// @notice Emitted when a certificate is revoked
    event CertificateRevoked(
        bytes32 indexed originalHash,
        address indexed issuer,
        uint256 timestamp,
        string reason
    );

    /// @notice Emitted when a revoked certificate is corrected with a new one
    event CertificateCorrected(
        bytes32 indexed originalHash,
        bytes32 indexed replacementHash,
        address indexed issuer,
        uint256 timestamp
    );

    /**
     * @notice Revocation record structure
     * @param originalHash Hash of the revoked certificate
     * @param replacementHash Hash of the replacement certificate (if corrected)
     * @param revocationDate Timestamp of revocation
     * @param reason Reason for revocation
     * @param revokedBy Address that performed the revocation
     * @param isCorrected Whether this was corrected with a new certificate
     */
    struct RevocationRecord {
        bytes32 originalHash;
        bytes32 replacementHash;
        uint256 revocationDate;
        string reason;
        address revokedBy;
        bool isCorrected;
    }

    /**
     * @notice Revoke a certificate
     * @param _certificateHash Hash of the certificate to revoke
     * @param _reason Reason for revocation
     */
    function revokeCertificate(
        bytes32 _certificateHash,
        string memory _reason
    ) external;

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
    ) external;

    /**
     * @notice Check if a certificate is revoked
     * @param _certificateHash Hash to check
     * @return isRevoked Whether the certificate is revoked
     */
    function isRevoked(bytes32 _certificateHash)
        external
        view
        returns (bool isRevoked);

    /**
     * @notice Get revocation details for a certificate
     * @param _certificateHash Hash of the certificate
     * @return record Revocation record
     */
    function getRevocationRecord(bytes32 _certificateHash)
        external
        view
        returns (RevocationRecord memory record);

    /**
     * @notice Get replacement certificate hash (if corrected)
     * @param _originalHash Hash of the revoked certificate
     * @return replacementHash Hash of the replacement, or bytes32(0) if not corrected
     */
    function getReplacementCertificate(bytes32 _originalHash)
        external
        view
        returns (bytes32 replacementHash);

    /**
     * @notice Get all revoked certificates by an issuer
     * @param _issuer Address of the issuer
     * @return hashes Array of revoked certificate hashes
     */
    function getRevokedCertificatesByIssuer(address _issuer)
        external
        view
        returns (bytes32[] memory hashes);

    /**
     * @notice Get total number of revoked certificates
     * @return count Total revocation count
     */
    function getTotalRevocations() external view returns (uint256 count);
}
