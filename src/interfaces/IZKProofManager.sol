// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IZKProofManager {
    struct Proof {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
    }

    struct ProofTypeInfo {
        string name;
        address verifier;
        bool active;
    }

    event ProofTypeAdded(uint256 indexed typeId, string name, address verifier, bool active);
    event ProofTypeUpdated(uint256 indexed typeId, address verifier, bool active);
    event RootAnchored(bytes32 indexed root, uint256 timestamp);
    event RootRevoked(bytes32 indexed root);
    event ProofVerified(address indexed caller, uint256 indexed typeId, bytes32 indexed root, bytes32 nullifier);

    function addProofType(string calldata name, address verifier, bool active) external returns (uint256);

    function updateProofType(uint256 typeId, address verifier, bool active) external;

    function getProofType(uint256 typeId) external view returns (ProofTypeInfo memory);

    function getAllProofTypes() external view returns (ProofTypeInfo[] memory);

    function resolveTypeId(string calldata name) external view returns (uint256);

    function anchorRoot(bytes32 root) external;

    function revokeRoot(bytes32 root) external;

    function isValidRoot(bytes32 root) external view returns (bool);

    function usedNullifier(bytes32 nullifier) external view returns (bool);

    function verifyProof(
        uint256 typeId,
        bytes32 root,
        bytes32 nullifier,
        Proof calldata proof,
        uint256[] calldata publicSignals
    ) external returns (bool);

    function verifyAgeProof(bytes32 root, bytes32 nullifier, Proof calldata proof, uint256[] calldata publicSignals)
        external
        returns (bool);

    function verifyAgeMaxProof(bytes32 root, bytes32 nullifier, Proof calldata proof, uint256[] calldata publicSignals)
        external
        returns (bool);

    function verifyAttrProof(bytes32 root, bytes32 nullifier, Proof calldata proof, uint256[] calldata publicSignals)
        external
        returns (bool);

    function verifyIncomeProof(bytes32 root, bytes32 nullifier, Proof calldata proof, uint256[] calldata publicSignals)
        external
        returns (bool);
}
