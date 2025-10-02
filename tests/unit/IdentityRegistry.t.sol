// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {IdentityRegistry} from "../../src/core/IdentityRegistry.sol";
import {TrustScore} from "../../src/core/TrustScore.sol";
import {IdentityTypes} from "../../src/libs/IdentityTypes.sol";
import {Errors} from "../../src/libs/Errors.sol";

contract IdentityRegistryTest is Test {
    IdentityRegistry private registry;
    TrustScore private trustScore;

    address private constant USER = address(0xBEEF);
    string private constant INITIAL_URI = "ipfs://identity/1";

    function setUp() public {
        trustScore = new TrustScore(address(this));
        registry = new IdentityRegistry(address(this), address(trustScore));
    }

    function testRegisterIdentityStoresProfile() public {
        bytes32 identityId = registry.registerIdentity(USER, INITIAL_URI);

        IdentityTypes.IdentityProfile memory profile = registry.getIdentity(
            identityId
        );
        assertEq(profile.owner, USER, "owner");
        assertEq(profile.metadataURI, INITIAL_URI, "metadata");
        assertEq(
            uint8(profile.status),
            uint8(IdentityTypes.IdentityStatus.Pending),
            "status"
        );
        assertEq(profile.trustScore, 0, "trust score");
    }

    function testCannotRegisterSameOwnerTwice() public {
        registry.registerIdentity(USER, INITIAL_URI);
        vm.expectRevert(Errors.IdentityAlreadyExists.selector);
        registry.registerIdentity(USER, INITIAL_URI);
    }

    function testOwnerCanUpdateMetadata() public {
        bytes32 identityId = registry.registerIdentity(USER, INITIAL_URI);

        vm.prank(USER);
        registry.updateMetadata(identityId, "ipfs://identity/2");

        IdentityTypes.IdentityProfile memory profile = registry.getIdentity(
            identityId
        );
        assertEq(profile.metadataURI, "ipfs://identity/2", "updated metadata");
    }

    function testResolveIdentityFromOwner() public {
        bytes32 identityId = registry.registerIdentity(USER, INITIAL_URI);
        assertEq(registry.resolveIdentity(USER), identityId);
    }

    function testResolveRevertsForUnknownOwner() public {
        vm.expectRevert(Errors.IdentityNotFound.selector);
        registry.resolveIdentity(USER);
    }

    function testSetIdentityStatusUpdatesProfile() public {
        bytes32 identityId = registry.registerIdentity(USER, INITIAL_URI);

        registry.setIdentityStatus(
            identityId,
            IdentityTypes.IdentityStatus.Active
        );

        IdentityTypes.IdentityProfile memory profile = registry.getIdentity(
            identityId
        );
        assertEq(
            uint8(profile.status),
            uint8(IdentityTypes.IdentityStatus.Active),
            "status"
        );
    }

    function testSetTrustScoreContractChangesSource() public {
        bytes32 identityId = registry.registerIdentity(USER, INITIAL_URI);

        TrustScore newTrust = new TrustScore(address(this));
        registry.setTrustScoreContract(address(newTrust));

        newTrust.setScore(identityId, 77, "imported");

        IdentityTypes.IdentityProfile memory profile = registry.getIdentity(
            identityId
        );
        assertEq(profile.trustScore, 77, "pulled score");
    }
}
