// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {AlchemyGasManager} from "../src/advanced_features/AlchemyGasManager.sol";
import {TrustScore} from "../src/core/TrustScore.sol";
import {Roles} from "../src/libs/Roles.sol";
import {IVerificationLogger} from "../src/interfaces/IVerificationLogger.sol";

contract VerificationLoggerMock is IVerificationLogger {
    event EventLogged(string tag, address actor, bytes32 contentHash);

    function logEvent(string calldata tag, address actor, bytes32 contentHash) external override {
        emit EventLogged(tag, actor, contentHash);
    }
}

contract AlchemyGasManagerTest is Test {
    AlchemyGasManager private manager;
    TrustScore private trustScore;
    VerificationLoggerMock private logger;

    address private operator = address(0xBEEF);
    address private onboardingUser = address(0xABCD);
    address private highTrustUser = address(0xCAFE);
    bytes32 private constant HIGH_RULE_ID = keccak256("ALCHEMY_RULE_HIGH");

    function setUp() public {
        logger = new VerificationLoggerMock();
        trustScore = new TrustScore(address(this));

        manager = new AlchemyGasManager(
            address(this), operator, address(trustScore), address(logger), "policy", "app", address(0xFEED), 2_000_000
        );

        trustScore.grantRole(Roles.TRUST_SCORE_UPDATER, address(manager));
    }

    function testOnboardingEligibility() public view {
        AlchemyGasManager.Decision memory decision = manager.shouldSponsorGas(bytes32(0), onboardingUser, 100_000);
        assertTrue(decision.eligible, "onboarding not eligible");
        assertTrue(decision.onboarding, "should flag onboarding");
        assertEq(decision.allowedGas, manager.onboardingAllowance(), "allowance remaining");
    }

    function testRecordOnboardingUsageUpdatesState() public {
        bytes32 onboardingRule = manager.RULE_ONBOARDING();
        vm.prank(operator);
        manager.recordGasSponsorship(bytes32(0), onboardingUser, 150_000, onboardingRule, true, "");

        uint256 day = block.timestamp / 1 days;
        uint256 month = block.timestamp / 30 days;
        assertEq(manager.dailyGasUsed(onboardingUser, day), 150_000, "daily usage");
        assertEq(manager.monthlyGasUsed(onboardingUser, month), 150_000, "monthly usage");
        assertEq(manager.totalGasSponsored(onboardingUser), 150_000, "total usage");
        assertGt(manager.onboardingStart(onboardingUser), 0, "onboarding start");
    }

    function testHighTrustRuleSelected() public {
        bytes32 identityId = keccak256(abi.encodePacked(highTrustUser));
        trustScore.setScore(identityId, 900, "bootstrap");

        AlchemyGasManager.Decision memory decision = manager.shouldSponsorGas(identityId, highTrustUser, 1_000_000);
        assertTrue(decision.eligible, "high trust not eligible");
        assertFalse(decision.onboarding, "not onboarding");
        assertEq(decision.ruleId, HIGH_RULE_ID, "rule mismatch");
    }

    function testPaymasterDataEncoding() public {
        bytes32 identityId = keccak256(abi.encodePacked(highTrustUser));
        trustScore.setScore(identityId, 900, "bootstrap");

        (bool eligible, bytes memory data, bytes32 ruleId,, uint256 allowedGas) =
            manager.getPaymasterData(identityId, highTrustUser, 800_000, bytes32("DAPP"));

        assertTrue(eligible, "not eligible");
        assertEq(ruleId, HIGH_RULE_ID, "rule id");
        assertEq(allowedGas, 800_000, "allowed gas");

        (
            address paymaster,
            string memory policy,
            string memory app,
            bytes32 encodedRule,
            uint256 gasLimit,
            bool onboarding,
            bytes32 dappId
        ) = abi.decode(data, (address, string, string, bytes32, uint256, bool, bytes32));

        assertEq(paymaster, address(0xFEED), "paymaster");
        assertEq(keccak256(bytes(policy)), keccak256(bytes("policy")), "policy id");
        assertEq(keccak256(bytes(app)), keccak256(bytes("app")), "app id");
        assertEq(encodedRule, HIGH_RULE_ID, "encoded rule");
        assertEq(gasLimit, 800_000, "gas limit");
        assertFalse(onboarding, "onboarding flag");
        assertEq(dappId, bytes32("DAPP"), "dapp id");
    }

    function testWhitelistEnforcement() public {
        manager.setWhitelist(bytes32("APPROVED"), true, true);

        (bool eligible,,,,) = manager.getPaymasterData(bytes32(0), onboardingUser, 100_000, bytes32("REJECT"));
        assertFalse(eligible, "should reject unapproved dapp");

        (bool allowed,,,,) = manager.getPaymasterData(bytes32(0), onboardingUser, 100_000, bytes32("APPROVED"));
        assertTrue(allowed, "approved dapp should pass");
    }
}
