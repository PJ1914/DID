// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "../interfaces/ICertificateHashRegistry.sol";
import "../interfaces/IBloomFilter.sol";
import "../interfaces/IRevocationRegistry.sol";
import "../../libs/Roles.sol";
import "../../libs/Errors.sol";

/**
 * @title CertificateHashRegistry
 * @notice Sajjan Certificate Hash Registry implementation
 * @dev Manages certificate hashes, RSA signatures, and verification
 * @dev Follows Sajjan architecture with SHA-256 hash storage and RSA signatures
 */
contract CertificateHashRegistry is ICertificateHashRegistry, AccessControl {
    // State variables
    mapping(bytes32 => Certificate) private certificates;
    mapping(address => bytes32[]) private certificatesByIssuer;
    mapping(address => bytes32[]) private certificatesByHolder;
    mapping(address => bool) private authorizedIssuers;

    bytes32[] private allCertificateHashes;
    uint256 private certificateCount;

    IBloomFilter public bloomFilter;
    IRevocationRegistry public revocationRegistry;

    // Constants
    uint256 private constant MAX_METADATA_LENGTH = 1024; // 1KB max metadata

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
    ) external override onlyRole(Roles.CERTIFICATE_ISSUER) {
        // Input validation
        if (_certificateHash == bytes32(0)) revert Errors.InvalidCertificateHash();
        if (_holder == address(0)) revert Errors.InvalidHolder(_holder);
        if (_rsaSignature.length == 0) revert Errors.InvalidRSASignature();
        if (bytes(_metadata).length == 0) revert Errors.EmptyString();
        if (bytes(_metadata).length > MAX_METADATA_LENGTH)
            revert Errors.InvalidInput();

        // Check if certificate already exists
        if (certificates[_certificateHash].issueDate != 0)
            revert Errors.CertificateAlreadyExists(_certificateHash);

        // Check if issuer is authorized
        if (!authorizedIssuers[msg.sender])
            revert Errors.NotAuthorizedIssuer(msg.sender);

        // Create certificate record
        certificates[_certificateHash] = Certificate({
            certificateHash: _certificateHash,
            rsaSignature: _rsaSignature,
            issuer: msg.sender,
            holder: _holder,
            issueDate: block.timestamp,
            isValid: true,
            metadata: _metadata
        });

        // Update indexes
        certificatesByIssuer[msg.sender].push(_certificateHash);
        certificatesByHolder[_holder].push(_certificateHash);
        allCertificateHashes.push(_certificateHash);
        certificateCount++;

        // Update Bloom filter if available
        if (address(bloomFilter) != address(0)) {
            bloomFilter.add(_certificateHash);
        }

        emit CertificateIssued(
            _certificateHash,
            msg.sender,
            _holder,
            block.timestamp
        );
    }

    /**
     * @notice Revoke an existing certificate
     * @param _certificateHash Hash of the certificate to revoke
     * @param _reason Reason for revocation
     */
    function revokeCertificate(bytes32 _certificateHash, string memory _reason)
        external
        override
        onlyRole(Roles.CERTIFICATE_ISSUER)
    {
        Certificate storage cert = certificates[_certificateHash];

        // Validate certificate exists
        if (cert.issueDate == 0)
            revert Errors.CertificateNotFound(_certificateHash);

        // Check if caller is the issuer
        if (cert.issuer != msg.sender)
            revert Errors.NotCertificateIssuer(msg.sender, cert.issuer);

        // Check if already revoked
        if (!cert.isValid)
            revert Errors.CertificateAlreadyRevoked(_certificateHash);

        // Validate reason
        if (bytes(_reason).length == 0) revert Errors.EmptyString();

        // Mark as invalid
        cert.isValid = false;

        // Update revocation registry if available
        if (address(revocationRegistry) != address(0)) {
            revocationRegistry.revokeCertificate(_certificateHash, _reason);
        }

        emit CertificateRevoked(
            _certificateHash,
            msg.sender,
            block.timestamp,
            _reason
        );
    }

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
    ) external override onlyRole(Roles.CERTIFICATE_ISSUER) {
        Certificate storage oldCert = certificates[_oldHash];

        // Validate old certificate exists
        if (oldCert.issueDate == 0) revert Errors.CertificateNotFound(_oldHash);

        // Check if caller is the issuer
        if (oldCert.issuer != msg.sender)
            revert Errors.NotCertificateIssuer(msg.sender, oldCert.issuer);

        // Check if already revoked
        if (!oldCert.isValid)
            revert Errors.CertificateAlreadyRevoked(_oldHash);

        // Validate new certificate doesn't exist
        if (certificates[_newHash].issueDate != 0)
            revert Errors.CertificateAlreadyExists(_newHash);

        // Mark old certificate as invalid
        oldCert.isValid = false;

        // Create new certificate
        certificates[_newHash] = Certificate({
            certificateHash: _newHash,
            rsaSignature: _newRsaSignature,
            issuer: msg.sender,
            holder: oldCert.holder,
            issueDate: block.timestamp,
            isValid: true,
            metadata: _metadata
        });

        // Update indexes
        certificatesByIssuer[msg.sender].push(_newHash);
        certificatesByHolder[oldCert.holder].push(_newHash);
        allCertificateHashes.push(_newHash);
        certificateCount++;

        // Update Bloom filter if available
        if (address(bloomFilter) != address(0)) {
            bloomFilter.add(_newHash);
        }

        // Update revocation registry if available
        if (address(revocationRegistry) != address(0)) {
            revocationRegistry.correctCertificate(
                _oldHash,
                _newHash,
                "Certificate corrected"
            );
        }

        emit CertificateCorrected(_oldHash, _newHash, msg.sender, block.timestamp);
        emit CertificateIssued(
            _newHash,
            msg.sender,
            oldCert.holder,
            block.timestamp
        );
    }

    /**
     * @notice Verify if a certificate exists and is valid
     * @param _certificateHash Hash to verify
     * @return isValid Whether the certificate is valid
     * @return cert The certificate record
     */
    function verifyCertificate(bytes32 _certificateHash)
        external
        view
        override
        returns (bool isValid, Certificate memory cert)
    {
        cert = certificates[_certificateHash];

        // Check if certificate exists
        if (cert.issueDate == 0) {
            return (false, cert);
        }

        // Check if revoked via revocation registry
        if (address(revocationRegistry) != address(0)) {
            if (revocationRegistry.isRevoked(_certificateHash)) {
                return (false, cert);
            }
        }

        // Return validity status
        return (cert.isValid, cert);
    }

    /**
     * @notice Get certificate details
     * @param _certificateHash Hash of the certificate
     * @return cert Certificate record
     */
    function getCertificate(bytes32 _certificateHash)
        external
        view
        override
        returns (Certificate memory cert)
    {
        cert = certificates[_certificateHash];
        if (cert.issueDate == 0) revert Errors.CertificateNotFound(_certificateHash);
        return cert;
    }

    /**
     * @notice Check if a certificate exists
     * @param _certificateHash Hash to check
     * @return exists Whether the certificate exists
     */
    function certificateExists(bytes32 _certificateHash)
        external
        view
        override
        returns (bool exists)
    {
        return certificates[_certificateHash].issueDate != 0;
    }

    /**
     * @notice Get all certificates issued by an institution
     * @param _issuer Address of the issuer
     * @return hashes Array of certificate hashes
     */
    function getCertificatesByIssuer(address _issuer)
        external
        view
        override
        returns (bytes32[] memory hashes)
    {
        return certificatesByIssuer[_issuer];
    }

    /**
     * @notice Get all certificates held by a student
     * @param _holder Address of the holder
     * @return hashes Array of certificate hashes
     */
    function getCertificatesByHolder(address _holder)
        external
        view
        override
        returns (bytes32[] memory hashes)
    {
        return certificatesByHolder[_holder];
    }

    /**
     * @notice Get total number of certificates issued
     * @return count Total certificate count
     */
    function getTotalCertificates() external view override returns (uint256 count) {
        return certificateCount;
    }

    /**
     * @notice Check if an address is an authorized issuer
     * @param _issuer Address to check
     * @return isAuthorized Whether the address is authorized
     */
    function isAuthorizedIssuer(address _issuer)
        external
        view
        override
        returns (bool isAuthorized)
    {
        return authorizedIssuers[_issuer];
    }

    // ============================================
    // Admin Functions
    // ============================================

    /**
     * @notice Authorize an institution as a certificate issuer
     * @param _issuer Address of the institution
     */
    function authorizeIssuer(address _issuer)
        external
        onlyRole(Roles.ADMINISTRATOR)
    {
        if (_issuer == address(0)) revert Errors.ZeroAddress();
        if (authorizedIssuers[_issuer])
            revert Errors.InstitutionAlreadyRegistered(_issuer);

        authorizedIssuers[_issuer] = true;
        _grantRole(Roles.CERTIFICATE_ISSUER, _issuer);
    }

    /**
     * @notice Revoke issuer authorization
     * @param _issuer Address of the institution
     */
    function revokeIssuerAuthorization(address _issuer)
        external
        onlyRole(Roles.ADMINISTRATOR)
    {
        if (_issuer == address(0)) revert Errors.ZeroAddress();
        if (!authorizedIssuers[_issuer])
            revert Errors.NotAuthorizedIssuer(_issuer);

        authorizedIssuers[_issuer] = false;
        _revokeRole(Roles.CERTIFICATE_ISSUER, _issuer);
    }

    /**
     * @notice Set the Bloom Filter contract address
     * @param _bloomFilter Address of the Bloom Filter contract
     */
    function setBloomFilter(address _bloomFilter)
        external
        onlyRole(Roles.ADMINISTRATOR)
    {
        if (_bloomFilter == address(0)) revert Errors.ZeroAddress();
        bloomFilter = IBloomFilter(_bloomFilter);
    }

    /**
     * @notice Set the Revocation Registry contract address
     * @param _revocationRegistry Address of the Revocation Registry contract
     */
    function setRevocationRegistry(address _revocationRegistry)
        external
        onlyRole(Roles.ADMINISTRATOR)
    {
        if (_revocationRegistry == address(0)) revert Errors.ZeroAddress();
        revocationRegistry = IRevocationRegistry(_revocationRegistry);
    }

    /**
     * @notice Grant CERTIFICATE_HOLDER role to a student
     * @param _holder Address of the student
     */
    function grantHolderRole(address _holder)
        external
        onlyRole(Roles.ADMINISTRATOR)
    {
        if (_holder == address(0)) revert Errors.ZeroAddress();
        _grantRole(Roles.CERTIFICATE_HOLDER, _holder);
    }

    /**
     * @notice Grant VERIFIER role to an  employer/third-party
     * @param _verifier Address of the verifier
     */
    function grantVerifierRole(address _verifier)
        external
        onlyRole(Roles.ADMINISTRATOR)
    {
        if (_verifier == address(0)) revert Errors.ZeroAddress();
        _grantRole(Roles.VERIFIER, _verifier);
    }
}
