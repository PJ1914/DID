// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {IOrganizationManager} from "../interfaces/IOrganizationManager.sol";
import {IIdentityRegistry} from "../interfaces/IIdentityRegistry.sol";
import {IVerificationLogger} from "../interfaces/IVerificationLogger.sol";
import {OrganizationTypes} from "../libs/OrganizationTypes.sol";
import {Roles} from "../libs/Roles.sol";
import {Errors} from "../libs/Errors.sol";

contract CertificateManager is ERC721URIStorage, AccessControl {
    error NotAuthorizedIssuer();
    error InvalidRecipient();
    error OrganizationInactive();
    error CertificateAlreadyRevoked();

    struct CertificateInfo {
        bytes32 organizationId;
        bytes32 identityId;
        address issuedBy;
        uint64 issuedAt;
        bool revoked;
        string metadataURI;
    }

    bytes32 public constant MANAGER_ROLE = keccak256("CERT_MANAGER_ROLE");

    IOrganizationManager public immutable ORGANIZATION_MANAGER;
    IIdentityRegistry public immutable IDENTITY_REGISTRY;
    IVerificationLogger public immutable VERIFICATION_LOGGER;

    uint256 private _nextTokenId;
    mapping(uint256 => CertificateInfo) private _certificates;

    event CertificateIssued(
        uint256 indexed tokenId,
        bytes32 indexed organizationId,
        bytes32 indexed identityId,
        address recipient,
        string metadataURI,
        address issuer
    );

    event CertificateRevoked(uint256 indexed tokenId, bytes32 indexed organizationId, address indexed revokedBy);

    constructor(address admin, address organizationManager_, address identityRegistry_, address verificationLogger_)
        ERC721("DID Certificate", "DIDC")
    {
        if (
            admin == address(0) || organizationManager_ == address(0) || identityRegistry_ == address(0)
                || verificationLogger_ == address(0)
        ) {
            revert Errors.InvalidInput();
        }
        ORGANIZATION_MANAGER = IOrganizationManager(organizationManager_);
        IDENTITY_REGISTRY = IIdentityRegistry(identityRegistry_);
        VERIFICATION_LOGGER = IVerificationLogger(verificationLogger_);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MANAGER_ROLE, admin);
    }

    function issueCertificate(
        bytes32 organizationId,
        address recipient,
        bytes32 identityId,
        string calldata metadataURI
    ) external returns (uint256 tokenId) {
        _enforceIssuer(organizationId, msg.sender);
        if (recipient == address(0)) revert InvalidRecipient();

        OrganizationTypes.Organization memory org = ORGANIZATION_MANAGER.getOrganization(organizationId);
        if (org.status != OrganizationTypes.OrganizationStatus.Active) {
            revert OrganizationInactive();
        }

        bytes32 resolvedIdentity = _resolveIdentity(recipient);
        if (identityId != bytes32(0) && identityId != resolvedIdentity) {
            revert Errors.IdentityNotFound();
        }

        tokenId = _nextTokenId++;

        _safeMint(recipient, tokenId);
        if (bytes(metadataURI).length != 0) {
            _setTokenURI(tokenId, metadataURI);
        }

        _certificates[tokenId] = CertificateInfo({
            organizationId: organizationId,
            identityId: resolvedIdentity,
            issuedBy: msg.sender,
            issuedAt: uint64(block.timestamp),
            revoked: false,
            metadataURI: metadataURI
        });

        VERIFICATION_LOGGER.logEvent(
            "CERT_ISSUE", recipient, keccak256(abi.encode(organizationId, resolvedIdentity, tokenId, metadataURI))
        );

        emit CertificateIssued(tokenId, organizationId, resolvedIdentity, recipient, metadataURI, msg.sender);
    }

    function revokeCertificate(uint256 tokenId) external {
        CertificateInfo storage info = _certificates[tokenId];
        if (info.issuedAt == 0) revert Errors.VerificationRecordNotFound();
        if (info.revoked) revert CertificateAlreadyRevoked();

        if (!_canRevoke(info.organizationId, msg.sender, info.issuedBy)) {
            revert NotAuthorizedIssuer();
        }

        address holder = ownerOf(tokenId);
        info.revoked = true;
        super._burn(tokenId);

        VERIFICATION_LOGGER.logEvent("CERT_REVOKE", holder, keccak256(abi.encode(info.organizationId, tokenId)));

        emit CertificateRevoked(tokenId, info.organizationId, msg.sender);
    }

    function getCertificate(uint256 tokenId) external view returns (CertificateInfo memory info, string memory uri) {
        info = _certificates[tokenId];
        if (info.issuedAt == 0) revert Errors.VerificationRecordNotFound();
        if (!info.revoked) {
            uri = tokenURI(tokenId);
        } else {
            uri = info.metadataURI;
        }
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _resolveIdentity(address owner) internal view returns (bytes32 identityId) {
        identityId = IDENTITY_REGISTRY.resolveIdentity(owner);
    }

    function _enforceIssuer(bytes32 organizationId, address account) internal view {
        if (hasRole(MANAGER_ROLE, account)) {
            return;
        }

        bool isAdmin = ORGANIZATION_MANAGER.hasOrganizationRole(organizationId, account, Roles.ORGANIZATION_ADMIN);
        if (!isAdmin) {
            bool isIssuer = ORGANIZATION_MANAGER.hasOrganizationRole(organizationId, account, Roles.ORGANIZATION_ISSUER);
            if (!isIssuer) revert NotAuthorizedIssuer();
        }
    }

    function _canRevoke(bytes32 organizationId, address sender, address originalIssuer) internal view returns (bool) {
        if (hasRole(MANAGER_ROLE, sender)) return true;
        if (sender == originalIssuer) return true;
        if (ORGANIZATION_MANAGER.hasOrganizationRole(organizationId, sender, Roles.ORGANIZATION_ADMIN)) {
            return true;
        }
        if (ORGANIZATION_MANAGER.hasOrganizationRole(organizationId, sender, Roles.ORGANIZATION_ISSUER)) {
            return true;
        }
        return false;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
}
