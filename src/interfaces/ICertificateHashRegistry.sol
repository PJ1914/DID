// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ICertificateHashRegistry
 * @notice Interface for the Sajjan Certificate Hash Registry
 * @dev Manages certificate hashes, RSA signatures, and verification according to Sajjan architecture
 */
interface ICertificateHashRegistry {
    /// @notice Emitted when a new certificate is issued
    event CertificateIssued(
        bytes32 indexed certificateHash,
        address indexed issuer,
        address indexed holder,
        uint256 timestamp
    );

    /// @notice Emitted when a certificate is revoked
    event CertificateRevoked(
        bytes32 indexed certificateHash,
        address indexed issuer,
        uint256 timestamp,
        string reason
    );

    /// @notice Emitted when a certificate is verified
    event CertificateVerified(
        bytes32 indexed certificateHash,
        address indexed verifier,
        bool isValid,
        uint256 timestamp
    );

    /// @notice Emitted when a certificate is corrected (reissued)
    event CertificateCorrected(
        bytes32 indexed oldHash,
        bytes32 indexed newHash,
        address indexed issuer,
        uint256 timestamp
    );

    /**
     * @notice Certificate record structure
     * @param certificateHash SHA-256 hash of the certificate
     * @param rsaSignature RSA digital signature of the certificate
     * @param issuer Address of the institution that issued the certificate
     * @param holder Address of the certificate holder (student)
     * @param issueDate Timestamp of certificate issuance
     * @param isValid Whether the certificate is currently valid
     * @param metadata Additional metadata (name, course, etc.)
     */
    struct Certificate {
        bytes32 certificateHash;
        bytes rsaSignature;
        address issuer;
        address holder;
        uint256 issueDate;
        bool isValid;
        string metadata;
    }

    /**
     * @notice Issue a new certificate
     * @param _certificateHash SHA-256 hash of the certificate
     * @param _rsaSignature RSA digital signature
     * @param _holder Address of the certificate holder
     * @param _metadata Certificate metadata (JSON string)
     */
    function issueCertificate(
        bytes32 _certificateHash,
        bytes memory _rsaSignature,
        address _holder,
        string memory _metadata
    ) external;

    /**
     * @notice Revoke an existing certificate
     * @param _certificateHash Hash of the certificate to revoke
     * @param _reason Reason for revocation
     */
    function revokeCertificate(bytes32 _certificateHash, string memory _reason)
        external;

    /**
     * @notice Correct a certificate (mark old as invalid, issue new one)
     * @param _oldHash Hash of the defective certificate
     * @param _newHash Hash of the corrected certificate
     * @param _newRsaSignature RSA signature of the new certificate
     * @param _metadata Updated metadata
     */
    function correctCertificate(
        bytes32 _oldHash,
        bytes32 _newHash,
        bytes memory _newRsaSignature,
        string memory _metadata
    ) external;

    /**
     * @notice Verify if a certificate exists and is valid
     * @param _certificateHash Hash to verify
     * @return isValid Whether the certificate is valid
     * @return cert The certificate record
     */
    function verifyCertificate(bytes32 _certificateHash)
        external
        view
        returns (bool isValid, Certificate memory cert);

    /**
     * @notice Get certificate details
     * @param _certificateHash Hash of the certificate
     * @return cert Certificate record
     */
    function getCertificate(bytes32 _certificateHash)
        external
        view
        returns (Certificate memory cert);

    /**
     * @notice Check if a certificate exists
     * @param _certificateHash Hash to check
     * @return exists Whether the certificate exists
     */
    function certificateExists(bytes32 _certificateHash)
        external
        view
        returns (bool exists);

    /**
     * @notice Get all certificates issued by an institution
     * @param _issuer Address of the issuer
     * @return hashes Array of certificate hashes
     */
    function getCertificatesByIssuer(address _issuer)
        external
        view
        returns (bytes32[] memory hashes);

    /**
     * @notice Get all certificates held by a student
     * @param _holder Address of the holder
     * @return hashes Array of certificate hashes
     */
    function getCertificatesByHolder(address _holder)
        external
        view
        returns (bytes32[] memory hashes);

    /**
     * @notice Get total number of certificates issued
     * @return count Total certificate count
     */
    function getTotalCertificates() external view returns (uint256 count);

    /**
     * @notice Check if an address is an authorized issuer
     * @param _issuer Address to check
     * @return isAuthorized Whether the address is authorized
     */
    function isAuthorizedIssuer(address _issuer)
        external
        view
        returns (bool isAuthorized);
}
