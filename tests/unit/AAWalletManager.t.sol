// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AAWalletManager} from "../../src/advanced_features/AAWalletManager.sol";
import {GuardianManager} from "../../src/advanced_features/GuardianManager.sol";
import {IdentityRegistry} from "../../src/core/IdentityRegistry.sol";
import {TrustScore} from "../../src/core/TrustScore.sol";
import {Roles} from "../../src/libs/Roles.sol";
import {IVerificationLogger} from "../../src/interfaces/IVerificationLogger.sol";

contract VerificationLoggerMock is IVerificationLogger {
    event EventLogged(string tag, address actor, bytes32 contentHash);

    function logEvent(
        string calldata tag,
        address actor,
        bytes32 contentHash
    ) external override {
        emit EventLogged(tag, actor, contentHash);
    }
}

contract MockWalletAccount {
    address public owner;
    address[] public signers;
    uint256 public threshold;

    constructor(address _owner, address[] memory _signers, uint256 _threshold) {
        owner = _owner;
        signers = _signers;
        threshold = _threshold;
    }
}

contract AAWalletManagerTest is Test {
    AAWalletManager private walletManager;
    GuardianManager private guardianManager;
    IdentityRegistry private identityRegistry;
    TrustScore private trustScore;
    VerificationLoggerMock private logger;

    address private implementation;
    address private constant ENTRY_POINT = address(0xEE);
    address private user = address(0x1001);

    function setUp() public {
        logger = new VerificationLoggerMock();
        trustScore = new TrustScore(address(this));
        identityRegistry = new IdentityRegistry(
            address(this),
            address(trustScore)
        );
        guardianManager = new GuardianManager(address(this), address(logger));

        implementation = address(
            new MockWalletAccount(address(0), new address[](0), 0)
        );

        walletManager = new AAWalletManager(
            address(logger),
            address(guardianManager),
            address(trustScore),
            address(identityRegistry),
            implementation,
            ENTRY_POINT
        );

        identityRegistry.grantRole(
            Roles.IDENTITY_ADMIN,
            address(walletManager)
        );
    }

    function testCreateWalletAutoRegistersIdentity() public {
        vm.deal(user, 1 ether);
        bytes32 salt = keccak256("salt");

        uint256 fee = walletManager.creationFee();

        vm.prank(user);
        address wallet = walletManager.createWallet{value: fee}(
            AAWalletManager.WalletType.Basic,
            salt,
            new address[](0),
            0,
            0,
            0
        );

        bytes32 identityId = identityRegistry.resolveIdentity(user);
        assertTrue(identityId != bytes32(0), "identity not registered");
        assertEq(walletManager.ownerToWallet(user), wallet, "wallet mapping");
    }
}
