// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IZKProofManager} from "../interfaces/IZKProofManager.sol";
import {IGroth16Verifier} from "../interfaces/IGroth16Verifier.sol";
import {ZkTypes} from "../libs/ZkTypes.sol";

contract ZKProofManager is AccessControl, ReentrancyGuard, IZKProofManager {
    error InvalidAddress();
    error InvalidName();
    error ProofTypeNotFound();
    error ProofTypeInactive();
    error ProofTypeNameTaken();
    error RootNotAnchored();
    error NullifierAlreadyUsed();
    error InvalidSignals();
    error ProofVerificationFailed();

    bytes32 public constant ROOT_MANAGER_ROLE = keccak256("ROOT_MANAGER_ROLE");
    bytes32 public constant PROOF_ADMIN_ROLE = keccak256("PROOF_ADMIN_ROLE");

    struct ProofType {
        string name;
        address verifier;
        bool active;
    }

    struct ProofTypeConfig {
        string name;
        address verifier;
        bool active;
    }

    mapping(uint256 => ProofType) private proofTypes;
    mapping(bytes32 => uint256) private proofTypeIds;
    mapping(bytes32 => bool) private proofTypeNameRegistered;

    uint256 public proofTypeCount;

    mapping(bytes32 => bool) private validRoots;
    mapping(bytes32 => uint256) public rootTimestamps;
    mapping(bytes32 => bool) private nullifiers;

    constructor(address admin, ProofTypeConfig[] memory initialTypes) {
        if (admin == address(0)) revert InvalidAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ROOT_MANAGER_ROLE, admin);
        _grantRole(PROOF_ADMIN_ROLE, admin);

        uint256 length = initialTypes.length;
        for (uint256 i = 0; i < length; i++) {
            _addProofType(
                initialTypes[i].name,
                initialTypes[i].verifier,
                initialTypes[i].active
            );
        }
    }

    function addProofType(
        string calldata name,
        address verifier,
        bool active
    ) external override onlyRole(PROOF_ADMIN_ROLE) returns (uint256) {
        return _addProofType(name, verifier, active);
    }

    function updateProofType(
        uint256 typeId,
        address verifier,
        bool active
    ) external override onlyRole(PROOF_ADMIN_ROLE) {
        if (!_proofTypeExists(typeId)) revert ProofTypeNotFound();
        if (verifier == address(0)) revert InvalidAddress();

        ProofType storage info = proofTypes[typeId];
        info.verifier = verifier;
        info.active = active;

        emit ProofTypeUpdated(typeId, verifier, active);
    }

    function getProofType(
        uint256 typeId
    ) public view override returns (ProofTypeInfo memory) {
        if (!_proofTypeExists(typeId)) revert ProofTypeNotFound();
        ProofType storage info = proofTypes[typeId];
        return
            ProofTypeInfo({
                name: info.name,
                verifier: info.verifier,
                active: info.active
            });
    }

    function getAllProofTypes()
        external
        view
        override
        returns (ProofTypeInfo[] memory list)
    {
        list = new ProofTypeInfo[](proofTypeCount);
        for (uint256 i = 0; i < proofTypeCount; i++) {
            ProofType storage info = proofTypes[i];
            list[i] = ProofTypeInfo({
                name: info.name,
                verifier: info.verifier,
                active: info.active
            });
        }
    }

    function resolveTypeId(
        string calldata name
    ) external view override returns (uint256) {
        bytes32 key = keccak256(bytes(name));
        if (!proofTypeNameRegistered[key]) revert ProofTypeNotFound();
        return proofTypeIds[key];
    }

    function anchorRoot(
        bytes32 root
    ) external override onlyRole(ROOT_MANAGER_ROLE) {
        if (root == bytes32(0)) revert InvalidSignals();
        validRoots[root] = true;
        rootTimestamps[root] = block.timestamp;
        emit RootAnchored(root, block.timestamp);
    }

    function revokeRoot(
        bytes32 root
    ) external override onlyRole(ROOT_MANAGER_ROLE) {
        if (!validRoots[root]) revert RootNotAnchored();
        validRoots[root] = false;
        emit RootRevoked(root);
    }

    function isValidRoot(bytes32 root) external view override returns (bool) {
        return validRoots[root];
    }

    function usedNullifier(
        bytes32 nullifier
    ) external view override returns (bool) {
        return nullifiers[nullifier];
    }

    function verifyProof(
        uint256 typeId,
        bytes32 root,
        bytes32 nullifier,
        Proof calldata proof,
        uint256[] calldata publicSignals
    ) public override nonReentrant returns (bool) {
        if (!_proofTypeExists(typeId)) revert ProofTypeNotFound();
        if (!validRoots[root]) revert RootNotAnchored();
        if (nullifier == bytes32(0)) revert InvalidSignals();
        if (nullifiers[nullifier]) revert NullifierAlreadyUsed();
        if (publicSignals.length == 0) revert InvalidSignals();

        ProofType storage info = proofTypes[typeId];
        if (!info.active) revert ProofTypeInactive();

        bool ok = IGroth16Verifier(info.verifier).verifyProof(
            proof.a,
            proof.b,
            proof.c,
            publicSignals
        );
        if (!ok) revert ProofVerificationFailed();

        nullifiers[nullifier] = true;
        emit ProofVerified(msg.sender, typeId, root, nullifier);
        return true;
    }

    function verifyAgeProof(
        bytes32 root,
        bytes32 nullifier,
        Proof calldata proof,
        uint256[] calldata publicSignals
    ) external override returns (bool) {
        return
            verifyProof(
                ZkTypes.ageGte(),
                root,
                nullifier,
                proof,
                publicSignals
            );
    }

    function verifyAgeMaxProof(
        bytes32 root,
        bytes32 nullifier,
        Proof calldata proof,
        uint256[] calldata publicSignals
    ) external override returns (bool) {
        return
            verifyProof(
                ZkTypes.ageLte(),
                root,
                nullifier,
                proof,
                publicSignals
            );
    }

    function verifyAttrProof(
        bytes32 root,
        bytes32 nullifier,
        Proof calldata proof,
        uint256[] calldata publicSignals
    ) external override returns (bool) {
        return
            verifyProof(
                ZkTypes.attrEquals(),
                root,
                nullifier,
                proof,
                publicSignals
            );
    }

    function verifyIncomeProof(
        bytes32 root,
        bytes32 nullifier,
        Proof calldata proof,
        uint256[] calldata publicSignals
    ) external override returns (bool) {
        return
            verifyProof(
                ZkTypes.incomeGte(),
                root,
                nullifier,
                proof,
                publicSignals
            );
    }

    function _addProofType(
        string memory name,
        address verifier,
        bool active
    ) private returns (uint256) {
        if (bytes(name).length == 0) revert InvalidName();
        if (verifier == address(0)) revert InvalidAddress();

        bytes32 key = keccak256(bytes(name));
        if (proofTypeNameRegistered[key]) revert ProofTypeNameTaken();

        uint256 typeId = proofTypeCount++;
        proofTypes[typeId] = ProofType({
            name: name,
            verifier: verifier,
            active: active
        });
        proofTypeIds[key] = typeId;
        proofTypeNameRegistered[key] = true;

        emit ProofTypeAdded(typeId, name, verifier, active);
        return typeId;
    }

    function _proofTypeExists(uint256 typeId) private view returns (bool) {
        if (typeId >= proofTypeCount) {
            return false;
        }
        return bytes(proofTypes[typeId].name).length != 0;
    }
}
