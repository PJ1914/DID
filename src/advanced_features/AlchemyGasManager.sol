// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IVerificationLogger} from "../interfaces/IVerificationLogger.sol";
import {ITrustScore} from "../interfaces/ITrustScore.sol";

contract AlchemyGasManager is AccessControl, ReentrancyGuard {
    error InvalidAddress();
    error InvalidRuleId();
    error InvalidAmount();
    error NotAllowed();

    bytes32 public constant ADMIN_ROLE = keccak256("ALCHEMY_ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("ALCHEMY_OPERATOR_ROLE");
    bytes32 public constant RULE_ONBOARDING = keccak256("ALCHEMY_RULE_ONBOARDING");

    struct AlchemyConfig {
        string policyId;
        string appId;
        address paymaster;
        uint256 maxGasPerTx;
        bool backendManaged;
    }

    struct SponsorshipRule {
        bool active;
        uint256 minTrustScore;
        uint256 maxDailyGas;
        uint256 maxMonthlyGas;
        uint256 maxPerTxGas;
    }

    struct Decision {
        bool eligible;
        bytes32 ruleId;
        uint256 allowedGas;
        bool onboarding;
    }

    IVerificationLogger public immutable VERIFICATION_LOGGER;
    ITrustScore public immutable TRUST_SCORE;

    AlchemyConfig public config;

    mapping(bytes32 => SponsorshipRule) public rules;
    mapping(bytes32 => bool) private knownRule;
    bytes32[] private ruleOrder;

    mapping(address => mapping(uint256 => uint256)) public dailyGasUsed;
    mapping(address => mapping(uint256 => uint256)) public monthlyGasUsed;
    mapping(address => uint256) public totalGasSponsored;

    uint256 public onboardingAllowance;
    uint256 public onboardingPeriod;
    mapping(address => uint256) public onboardingStart;
    mapping(address => uint256) public onboardingGasUsed;

    mapping(bytes32 => bool) public dappWhitelist;
    bool public enforceDappWhitelist;

    event AlchemyConfigUpdated(
        address indexed paymaster, string policyId, string appId, uint256 maxGasPerTx, bool backendManaged
    );

    event SponsorshipRuleUpdated(
        bytes32 indexed ruleId,
        bool active,
        uint256 minTrustScore,
        uint256 maxDailyGas,
        uint256 maxMonthlyGas,
        uint256 maxPerTxGas
    );

    event GasSponsored(
        bytes32 indexed identityId, address indexed user, bytes32 indexed ruleId, uint256 gasUsed, bool onboarding
    );

    event OnboardingStarted(address indexed user, uint256 timestamp);
    event OnboardingSettingsUpdated(uint256 allowance, uint256 period);
    event DappWhitelistUpdated(bytes32 indexed dappId, bool allowed, bool enforced);

    constructor(
        address admin,
        address operator,
        address trustScore,
        address verificationLogger,
        string memory policyId,
        string memory appId,
        address paymaster,
        uint256 maxGasPerTx
    ) {
        if (admin == address(0) || trustScore == address(0) || verificationLogger == address(0)) {
            revert InvalidAddress();
        }

        VERIFICATION_LOGGER = IVerificationLogger(verificationLogger);
        TRUST_SCORE = ITrustScore(trustScore);

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        if (operator != address(0)) {
            _grantRole(OPERATOR_ROLE, operator);
        }

        _updateConfig(policyId, appId, paymaster, maxGasPerTx, false);

        onboardingAllowance = 2_000_000;
        onboardingPeriod = 7 days;

        _installDefaultRules();
    }

    function updateAlchemyConfig(
        string calldata policyId,
        string calldata appId,
        address paymaster,
        uint256 maxGasPerTx,
        bool backendManaged
    ) external onlyRole(ADMIN_ROLE) {
        _updateConfig(policyId, appId, paymaster, maxGasPerTx, backendManaged);
    }

    function setOnboardingSettings(uint256 allowance, uint256 period) external onlyRole(ADMIN_ROLE) {
        onboardingAllowance = allowance;
        onboardingPeriod = period;
        emit OnboardingSettingsUpdated(allowance, period);
    }

    function setWhitelist(bytes32 dappId, bool allowed, bool enforce) external onlyRole(ADMIN_ROLE) {
        if (dappId != bytes32(0)) {
            dappWhitelist[dappId] = allowed;
        }
        enforceDappWhitelist = enforce;
        emit DappWhitelistUpdated(dappId, allowed, enforce);
    }

    function updateSponsorshipRule(bytes32 ruleId, SponsorshipRule calldata rule) external onlyRole(ADMIN_ROLE) {
        _setRule(ruleId, rule);
    }

    function _setRule(bytes32 ruleId, SponsorshipRule memory rule) private {
        if (ruleId == bytes32(0)) revert InvalidRuleId();
        rules[ruleId] = rule;
        if (!knownRule[ruleId]) {
            knownRule[ruleId] = true;
            ruleOrder.push(ruleId);
        }
        emit SponsorshipRuleUpdated(
            ruleId, rule.active, rule.minTrustScore, rule.maxDailyGas, rule.maxMonthlyGas, rule.maxPerTxGas
        );
    }

    function getRuleIds() external view returns (bytes32[] memory) {
        return ruleOrder;
    }

    function shouldSponsorGas(bytes32 identityId, address user, uint256 gasEstimate)
        public
        view
        returns (Decision memory decision)
    {
        if (gasEstimate == 0 || config.paymaster == address(0)) {
            return Decision(false, bytes32(0), 0, false);
        }

        if (config.maxGasPerTx != 0 && gasEstimate > config.maxGasPerTx) {
            return Decision(false, bytes32(0), 0, false);
        }

        (bool onboardingEligible, uint256 onboardingAllowanceLeft) = _checkOnboarding(identityId, user, gasEstimate);
        if (onboardingEligible) {
            return Decision(true, RULE_ONBOARDING, onboardingAllowanceLeft, true);
        }

        uint256 trustScore = identityId == bytes32(0) ? 0 : TRUST_SCORE.getScore(identityId);
        uint256 day = _currentDay();
        uint256 month = _currentMonth();
        uint256 usedToday = dailyGasUsed[user][day];
        uint256 usedThisMonth = monthlyGasUsed[user][month];

        uint256 length = ruleOrder.length;
        for (uint256 i = 0; i < length; i++) {
            bytes32 ruleId = ruleOrder[i];
            SponsorshipRule storage rule = rules[ruleId];
            if (!rule.active) continue;
            if (trustScore < rule.minTrustScore) continue;
            if (rule.maxPerTxGas != 0 && gasEstimate > rule.maxPerTxGas) {
                continue;
            }
            if (rule.maxDailyGas != 0 && usedToday + gasEstimate > rule.maxDailyGas) continue;
            if (rule.maxMonthlyGas != 0 && usedThisMonth + gasEstimate > rule.maxMonthlyGas) continue;

            uint256 allowedGas = gasEstimate;
            if (rule.maxPerTxGas != 0 && rule.maxPerTxGas < allowedGas) {
                allowedGas = rule.maxPerTxGas;
            }
            if (config.maxGasPerTx != 0 && config.maxGasPerTx < allowedGas) {
                allowedGas = config.maxGasPerTx;
            }

            return Decision(true, ruleId, allowedGas, false);
        }

        return Decision(false, bytes32(0), 0, false);
    }

    function getPaymasterData(bytes32 identityId, address user, uint256 gasEstimate, bytes32 dappId)
        external
        view
        returns (bool eligible, bytes memory paymasterAndData, bytes32 ruleId, bool onboarding, uint256 allowedGas)
    {
        if (enforceDappWhitelist && !dappWhitelist[dappId]) {
            return (false, "", bytes32(0), false, 0);
        }

        Decision memory decision = shouldSponsorGas(identityId, user, gasEstimate);
        if (!decision.eligible) {
            return (false, "", bytes32(0), false, 0);
        }

        bytes memory encoded = abi.encode(
            config.paymaster,
            config.policyId,
            config.appId,
            decision.ruleId,
            decision.allowedGas,
            decision.onboarding,
            dappId
        );

        return (true, encoded, decision.ruleId, decision.onboarding, decision.allowedGas);
    }

    function recordGasSponsorship(
        bytes32 identityId,
        address user,
        uint256 gasUsed,
        bytes32 ruleId,
        bool onboarding,
        string calldata trustReason
    ) external onlyRole(OPERATOR_ROLE) nonReentrant {
        if (gasUsed == 0) revert InvalidAmount();

        uint256 day = _currentDay();
        uint256 month = _currentMonth();
        dailyGasUsed[user][day] += gasUsed;
        monthlyGasUsed[user][month] += gasUsed;
        totalGasSponsored[user] += gasUsed;

        if (onboarding) {
            if (onboardingStart[user] == 0) {
                onboardingStart[user] = block.timestamp;
                emit OnboardingStarted(user, block.timestamp);
            }
            onboardingGasUsed[user] += gasUsed;
            VERIFICATION_LOGGER.logEvent("AGMO", user, keccak256(abi.encode(user, gasUsed)));
        } else {
            SponsorshipRule storage rule = rules[ruleId];
            if (!rule.active) revert InvalidRuleId();
            if (identityId != bytes32(0) && bytes(trustReason).length != 0) {
                TRUST_SCORE.increaseScore(identityId, 1, trustReason);
            }
            VERIFICATION_LOGGER.logEvent("AGMS", user, keccak256(abi.encode(user, ruleId, gasUsed)));
        }

        emit GasSponsored(identityId, user, ruleId, gasUsed, onboarding);
    }

    function _updateConfig(
        string memory policyId,
        string memory appId,
        address paymaster,
        uint256 maxGasPerTx,
        bool backendManaged
    ) internal {
        if (paymaster == address(0)) revert InvalidAddress();
        config = AlchemyConfig({
            policyId: policyId,
            appId: appId,
            paymaster: paymaster,
            maxGasPerTx: maxGasPerTx,
            backendManaged: backendManaged
        });

        emit AlchemyConfigUpdated(paymaster, policyId, appId, maxGasPerTx, backendManaged);
    }

    function _installDefaultRules() private {
        bytes32 high = keccak256("ALCHEMY_RULE_HIGH");
        bytes32 medium = keccak256("ALCHEMY_RULE_MEDIUM");
        bytes32 low = keccak256("ALCHEMY_RULE_LOW");
        bytes32 basic = keccak256("ALCHEMY_RULE_BASIC");

        _setRule(
            high,
            SponsorshipRule({
                active: true,
                minTrustScore: 800,
                maxDailyGas: 5_000_000,
                maxMonthlyGas: 100_000_000,
                maxPerTxGas: 1_500_000
            })
        );

        _setRule(
            medium,
            SponsorshipRule({
                active: true,
                minTrustScore: 500,
                maxDailyGas: 3_000_000,
                maxMonthlyGas: 60_000_000,
                maxPerTxGas: 1_000_000
            })
        );

        _setRule(
            low,
            SponsorshipRule({
                active: true,
                minTrustScore: 250,
                maxDailyGas: 1_500_000,
                maxMonthlyGas: 30_000_000,
                maxPerTxGas: 750_000
            })
        );

        _setRule(
            basic,
            SponsorshipRule({
                active: true,
                minTrustScore: 100,
                maxDailyGas: 1_000_000,
                maxMonthlyGas: 20_000_000,
                maxPerTxGas: 500_000
            })
        );
    }

    function _checkOnboarding(bytes32 identityId, address user, uint256 gasEstimate)
        private
        view
        returns (bool, uint256)
    {
        if (identityId != bytes32(0)) {
            return (false, 0);
        }

        if (onboardingAllowance == 0 || onboardingPeriod == 0) {
            return (false, 0);
        }

        uint256 start = onboardingStart[user];
        if (start != 0 && block.timestamp > start + onboardingPeriod) {
            return (false, 0);
        }

        uint256 used = onboardingGasUsed[user];
        if (used + gasEstimate > onboardingAllowance) {
            return (false, 0);
        }

        uint256 remaining = onboardingAllowance - used;
        return (true, remaining);
    }

    function _currentDay() private view returns (uint256) {
        return block.timestamp / 1 days;
    }

    function _currentMonth() private view returns (uint256) {
        return block.timestamp / 30 days;
    }
}
