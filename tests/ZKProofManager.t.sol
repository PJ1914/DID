// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ZKProofManager} from "../src/verification/ZKProofManager.sol";
import {IGroth16Verifier} from "../src/interfaces/IGroth16Verifier.sol";
import {IZKProofManager} from "../src/interfaces/IZKProofManager.sol";
import {ZkTypes} from "../src/libs/ZkTypes.sol";

contract MockGroth16Verifier is IGroth16Verifier {
    bool private result;

    constructor(bool _result) {
        result = _result;
    }

    function setResult(bool value) external {
        result = value;
    }

    function verifyProof(
        uint256[2] calldata,
        uint256[2][2] calldata,
        uint256[2] calldata,
        uint256[] calldata
    ) external view override returns (bool) {
        return result;
    }
}

contract ZKProofManagerTest is Test {
    ZKProofManager private manager;
    MockGroth16Verifier private ageVerifier;
    MockGroth16Verifier private ageMaxVerifier;
    MockGroth16Verifier private attrVerifier;
    MockGroth16Verifier private incomeVerifier;

    bytes32 private constant ROOT = keccak256("root");

    function setUp() public {
        ageVerifier = new MockGroth16Verifier(true);
        ageMaxVerifier = new MockGroth16Verifier(true);
        attrVerifier = new MockGroth16Verifier(true);
        incomeVerifier = new MockGroth16Verifier(true);

        ZKProofManager.ProofTypeConfig[]
            memory configs = new ZKProofManager.ProofTypeConfig[](4);
        configs[0] = ZKProofManager.ProofTypeConfig({
            name: "age_gte",
            verifier: address(ageVerifier),
            active: true
        });
        configs[1] = ZKProofManager.ProofTypeConfig({
            name: "age_lte",
            verifier: address(ageMaxVerifier),
            active: true
        });
        configs[2] = ZKProofManager.ProofTypeConfig({
            name: "attr_eq",
            verifier: address(attrVerifier),
            active: true
        });
        configs[3] = ZKProofManager.ProofTypeConfig({
            name: "income_gte",
            verifier: address(incomeVerifier),
            active: true
        });

        manager = new ZKProofManager(address(this), configs);
        manager.anchorRoot(ROOT);
    }

    function _dummyProof()
        private
        pure
        returns (IZKProofManager.Proof memory proof, uint256[] memory signals)
    {
        proof = IZKProofManager.Proof({
            a: [uint256(1), uint256(2)],
            b: [[uint256(1), uint256(0)], [uint256(0), uint256(1)]],
            c: [uint256(3), uint256(4)]
        });
        signals = new uint256[](2);
        signals[0] = uint256(ROOT);
        signals[1] = 42;
    }

    function testInitialProofTypesRegistered() public view {
        IZKProofManager.ProofTypeInfo[] memory allTypes = manager
            .getAllProofTypes();
        assertEq(allTypes.length, 4, "type count");
        assertEq(
            allTypes[uint256(ZkTypes.ageGte())].verifier,
            address(ageVerifier),
            "age_gte verifier"
        );
    }

    function testResolveTypeIdByName() public view {
        uint256 typeId = manager.resolveTypeId("attr_eq");
        assertEq(typeId, ZkTypes.attrEquals(), "attr id");
    }

    function testAnchorAndRevokeRoot() public {
        bytes32 otherRoot = keccak256("other");
        manager.anchorRoot(otherRoot);
        assertTrue(manager.isValidRoot(otherRoot), "root active");
        manager.revokeRoot(otherRoot);
        assertFalse(manager.isValidRoot(otherRoot), "root revoked");
    }

    function testVerifyAgeProofMarksNullifier() public {
        (
            IZKProofManager.Proof memory proof,
            uint256[] memory signals
        ) = _dummyProof();
        bytes32 nullifier = keccak256("nullifier");

        bool ok = manager.verifyAgeProof(ROOT, nullifier, proof, signals);
        assertTrue(ok, "verification result");
        assertTrue(manager.usedNullifier(nullifier), "nullifier consumed");

        vm.expectRevert(ZKProofManager.NullifierAlreadyUsed.selector);
        manager.verifyAgeProof(ROOT, nullifier, proof, signals);
    }

    function testVerifyProofRevertsForInactiveType() public {
        manager.updateProofType(
            ZkTypes.attrEquals(),
            address(attrVerifier),
            false
        );
        (
            IZKProofManager.Proof memory proof,
            uint256[] memory signals
        ) = _dummyProof();

        vm.expectRevert(ZKProofManager.ProofTypeInactive.selector);
        manager.verifyAttrProof(ROOT, keccak256("attr"), proof, signals);
    }

    function testVerifyProofRevertsForUnanchoredRoot() public {
        (
            IZKProofManager.Proof memory proof,
            uint256[] memory signals
        ) = _dummyProof();

        vm.expectRevert(ZKProofManager.RootNotAnchored.selector);
        manager.verifyIncomeProof(
            keccak256("bad"),
            keccak256("n"),
            proof,
            signals
        );
    }

    function testVerifyProofRevertsWhenVerifierFails() public {
        (
            IZKProofManager.Proof memory proof,
            uint256[] memory signals
        ) = _dummyProof();
        incomeVerifier.setResult(false);

        vm.expectRevert(ZKProofManager.ProofVerificationFailed.selector);
        manager.verifyIncomeProof(ROOT, keccak256("income"), proof, signals);
    }

    function testAddProofTypeViaAdmin() public {
        MockGroth16Verifier memoryVerifier = new MockGroth16Verifier(true);
        uint256 typeId = manager.addProofType(
            "memory_circuit",
            address(memoryVerifier),
            true
        );
        IZKProofManager.ProofTypeInfo memory info = manager.getProofType(
            typeId
        );
        assertEq(info.verifier, address(memoryVerifier), "verifier addr");
        assertTrue(info.active, "active");

        vm.expectRevert(ZKProofManager.ProofTypeNameTaken.selector);
        manager.addProofType("memory_circuit", address(memoryVerifier), true);
    }
}
