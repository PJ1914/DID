// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

import {VerificationLogger} from "../src/core/VerificationLogger.sol";
import {TrustScore} from "../src/core/TrustScore.sol";
import {IdentityRegistry} from "../src/core/IdentityRegistry.sol";
import {VerificationManager} from "../src/verification/VerificationManager.sol";
import {OrganizationManager} from "../src/organizations/OrganizationManager.sol";
import {GuardianManager} from "../src/advanced_features/GuardianManager.sol";
import {AlchemyGasManager} from "../src/advanced_features/AlchemyGasManager.sol";
import {AAWalletManager} from "../src/advanced_features/AAWalletManager.sol";
import {ZKProofManager} from "../src/verification/ZKProofManager.sol";
import {Roles} from "../src/libs/Roles.sol";
import {IRecoveryManager} from "../src/interfaces/IRecoveryManager.sol";
import {ISessionKeyManager} from "../src/interfaces/ISessionKeyManager.sol";
import {Groth16Verifier as AgeGteVerifier} from "../src/verification/verifiers/AgeVerifier.sol";
import {Groth16Verifier as AgeLteVerifier} from "../src/verification/verifiers/AgeMaxVerifier.sol";
import {Groth16Verifier as AttrEqualsVerifier} from "../src/verification/verifiers/AttrVerifier.sol";
import {Groth16Verifier as IncomeGteVerifier} from "../src/verification/verifiers/IncomeVerifier.sol";

/// @notice Minimal CREATE2-compatible wallet implementation used when no address is provided.
contract BasicWalletAccount {
    address public owner;
    address[] public signers;
    uint256 public threshold;

    constructor(address _owner, address[] memory _signers, uint256 _threshold) {
        owner = _owner;
        signers = _signers;
        threshold = _threshold;
    }
}

contract DeployFullStack is Script {
    struct DeploymentAddresses {
        address verificationLogger;
        address trustScore;
        address identityRegistry;
        address verificationManager;
        address organizationManager;
        address guardianManager;
        address alchemyGasManager;
        address walletManager;
        address zkProofManager;
        address ageGteVerifier;
        address ageLteVerifier;
        address attrEqualsVerifier;
        address incomeGteVerifier;
        address recoveryManager;
        address sessionKeyManager;
    }

    struct GasConfig {
        address operator;
        address paymaster;
        string policyId;
        string appId;
        uint256 maxGasPerTx;
    }

    DeploymentAddresses internal addressesOut;

    function run() external {
        uint256 deployerKey = vm.envOr("PRIVATE_KEY", uint256(0));
        address admin = vm.envOr("ADMIN", address(0));

        if (deployerKey != 0) {
            if (admin == address(0)) {
                admin = vm.addr(deployerKey);
            }
            vm.startBroadcast(deployerKey);
        } else {
            require(admin != address(0), "ADMIN env required when PRIVATE_KEY unset");
            vm.startBroadcast();
        }

        VerificationLogger verificationLogger = new VerificationLogger(admin);
        addressesOut.verificationLogger = address(verificationLogger);

        TrustScore trustScore = new TrustScore(admin);
        addressesOut.trustScore = address(trustScore);

        IdentityRegistry identityRegistry = new IdentityRegistry(admin, address(trustScore));
        addressesOut.identityRegistry = address(identityRegistry);

        VerificationManager verificationManager =
            new VerificationManager(admin, address(identityRegistry), address(trustScore));
        addressesOut.verificationManager = address(verificationManager);

        OrganizationManager organizationManager = new OrganizationManager(admin);
        addressesOut.organizationManager = address(organizationManager);

        GuardianManager guardianManager = new GuardianManager(admin, address(verificationLogger));
        addressesOut.guardianManager = address(guardianManager);

        GasConfig memory gasConfig = _loadGasConfig(admin);
        AlchemyGasManager alchemyGasManager = new AlchemyGasManager(
            admin,
            gasConfig.operator,
            address(trustScore),
            address(verificationLogger),
            gasConfig.policyId,
            gasConfig.appId,
            gasConfig.paymaster,
            gasConfig.maxGasPerTx
        );
        addressesOut.alchemyGasManager = address(alchemyGasManager);

        AgeGteVerifier ageGte = new AgeGteVerifier();
        AgeLteVerifier ageLte = new AgeLteVerifier();
        AttrEqualsVerifier attrEquals = new AttrEqualsVerifier();
        IncomeGteVerifier incomeGte = new IncomeGteVerifier();
        addressesOut.ageGteVerifier = address(ageGte);
        addressesOut.ageLteVerifier = address(ageLte);
        addressesOut.attrEqualsVerifier = address(attrEquals);
        addressesOut.incomeGteVerifier = address(incomeGte);

        ZKProofManager.ProofTypeConfig[] memory proofTypes = new ZKProofManager.ProofTypeConfig[](4);
        proofTypes[0] = ZKProofManager.ProofTypeConfig({name: "AGE_GTE", verifier: address(ageGte), active: true});
        proofTypes[1] = ZKProofManager.ProofTypeConfig({name: "AGE_LTE", verifier: address(ageLte), active: true});
        proofTypes[2] =
            ZKProofManager.ProofTypeConfig({name: "ATTR_EQUALS", verifier: address(attrEquals), active: true});
        proofTypes[3] = ZKProofManager.ProofTypeConfig({name: "INCOME_GTE", verifier: address(incomeGte), active: true});

        ZKProofManager zkProofManager = new ZKProofManager(admin, proofTypes);
        addressesOut.zkProofManager = address(zkProofManager);

        address walletImplementation = vm.envOr("WALLET_IMPLEMENTATION", address(0));
        if (walletImplementation == address(0)) {
            bool deployMock = vm.envOr("DEPLOY_MOCK_WALLET", false);
            if (deployMock) {
                walletImplementation = address(new BasicWalletAccount(address(0), new address[](0), 0));
            } else {
                revert("WALLET_IMPLEMENTATION env required or set DEPLOY_MOCK_WALLET=true");
            }
        }

        address entryPoint = vm.envOr("ENTRY_POINT", address(0x0000000071727de22e5E9D8bAF0eDAcb0f3F0EAB));
        require(entryPoint != address(0), "ENTRY_POINT cannot be zero");

        AAWalletManager walletManager = new AAWalletManager(
            address(verificationLogger),
            address(guardianManager),
            address(trustScore),
            address(identityRegistry),
            walletImplementation,
            entryPoint
        );
        addressesOut.walletManager = address(walletManager);

        identityRegistry.grantRole(Roles.IDENTITY_ADMIN, address(walletManager));
        trustScore.grantRole(Roles.TRUST_SCORE_UPDATER, address(verificationManager));
        trustScore.grantRole(Roles.TRUST_SCORE_UPDATER, address(alchemyGasManager));

        verificationLogger.grantLoggerRole(address(walletManager));
        verificationLogger.grantLoggerRole(address(guardianManager));
        verificationLogger.grantLoggerRole(address(alchemyGasManager));

        IRecoveryManager recoveryManager = walletManager.recoveryManager();
        ISessionKeyManager sessionKeyManager = walletManager.sessionKeyManager();
        addressesOut.recoveryManager = address(recoveryManager);
        addressesOut.sessionKeyManager = address(sessionKeyManager);

        verificationLogger.grantLoggerRole(address(recoveryManager));
        verificationLogger.grantLoggerRole(address(sessionKeyManager));

        _logSummary();
        _writeDeploymentJson();

        vm.stopBroadcast();
    }

    function _loadGasConfig(address admin) internal view returns (GasConfig memory config) {
        config.operator = vm.envOr("ALCHEMY_OPERATOR", admin);
        config.paymaster = vm.envOr("ALCHEMY_PAYMASTER", admin);
        config.policyId = vm.envOr("ALCHEMY_POLICY_ID", string("default-policy"));
        config.appId = vm.envOr("ALCHEMY_APP_ID", string("default-app"));
        config.maxGasPerTx = vm.envOr("ALCHEMY_MAX_GAS_PER_TX", uint256(1_500_000));
    }

    function _logSummary() internal view {
        console2.log("VerificationLogger", addressesOut.verificationLogger);
        console2.log("TrustScore", addressesOut.trustScore);
        console2.log("IdentityRegistry", addressesOut.identityRegistry);
        console2.log("VerificationManager", addressesOut.verificationManager);
        console2.log("OrganizationManager", addressesOut.organizationManager);
        console2.log("GuardianManager", addressesOut.guardianManager);
        console2.log("AlchemyGasManager", addressesOut.alchemyGasManager);
        console2.log("AAWalletManager", addressesOut.walletManager);
        console2.log("RecoveryManager", addressesOut.recoveryManager);
        console2.log("SessionKeyManager", addressesOut.sessionKeyManager);
        console2.log("ZKProofManager", addressesOut.zkProofManager);
        console2.log("Age >= Verifier", addressesOut.ageGteVerifier);
        console2.log("Age <= Verifier", addressesOut.ageLteVerifier);
        console2.log("Attr Equals Verifier", addressesOut.attrEqualsVerifier);
        console2.log("Income >= Verifier", addressesOut.incomeGteVerifier);
    }

    function _writeDeploymentJson() internal {
        string memory root = "deployment";
        vm.serializeAddress(root, "verificationLogger", addressesOut.verificationLogger);
        vm.serializeAddress(root, "trustScore", addressesOut.trustScore);
        vm.serializeAddress(root, "identityRegistry", addressesOut.identityRegistry);
        vm.serializeAddress(root, "verificationManager", addressesOut.verificationManager);
        vm.serializeAddress(root, "organizationManager", addressesOut.organizationManager);
        vm.serializeAddress(root, "guardianManager", addressesOut.guardianManager);
        vm.serializeAddress(root, "alchemyGasManager", addressesOut.alchemyGasManager);
        vm.serializeAddress(root, "walletManager", addressesOut.walletManager);
        vm.serializeAddress(root, "recoveryManager", addressesOut.recoveryManager);
        vm.serializeAddress(root, "sessionKeyManager", addressesOut.sessionKeyManager);
        vm.serializeAddress(root, "zkProofManager", addressesOut.zkProofManager);
        vm.serializeAddress(root, "ageGteVerifier", addressesOut.ageGteVerifier);
        vm.serializeAddress(root, "ageLteVerifier", addressesOut.ageLteVerifier);
        vm.serializeAddress(root, "attrEqualsVerifier", addressesOut.attrEqualsVerifier);
        string memory json = vm.serializeAddress(root, "incomeGteVerifier", addressesOut.incomeGteVerifier);

        string memory chain = vm.toString(block.chainid);
        string memory path = string.concat("deployments/full-", chain, ".json");
        vm.writeJson(json, path);
    }
}
