// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {VerificationManager} from "../../src/verification/VerificationManager.sol";
import {IdentityRegistry} from "../../src/core/IdentityRegistry.sol";
import {TrustScore} from "../../src/core/TrustScore.sol";
import {VerificationTypes} from "../../src/libs/VerificationTypes.sol";
import {IdentityTypes} from "../../src/libs/IdentityTypes.sol";
import {Roles} from "../../src/libs/Roles.sol";
import {Errors} from "../../src/libs/Errors.sol";

contract VerificationManagerTest is Test {
    VerificationManager private verificationManager;
    IdentityRegistry private identityRegistry;
    TrustScore private trustScore;

    address private constant PROVIDER = address(0x1234);
    address private constant USER = address(0x7777);
    bytes32 private emailTemplateId;

    function setUp() public {
        trustScore = new TrustScore(address(this));
        identityRegistry = new IdentityRegistry(
            address(this),
            address(trustScore)
        );
        verificationManager = new VerificationManager(
            address(this),
            address(identityRegistry),
            address(trustScore)
        );

        trustScore.grantRole(
            Roles.TRUST_SCORE_UPDATER,
            address(verificationManager)
        );
        identityRegistry.setIdentityStatus(
            registerIdentity(),
            IdentityTypes.IdentityStatus.Active
        );
        verificationManager.registerProvider(
            PROVIDER,
            "Trusted Provider",
            "ipfs://provider"
        );

        emailTemplateId = VerificationTypes.emailTemplateId();
    }

    function testRecordVerificationCreatesApprovedRecord() public {
        bytes32 identityId = identityRegistry.resolveIdentity(USER);

        vm.prank(PROVIDER);
        bytes32 verificationId = verificationManager.recordVerification(
            identityId,
            emailTemplateId,
            "ipfs://evidence",
            uint64(block.timestamp + 30 days)
        );

        VerificationTypes.VerificationRecord memory record = verificationManager
            .getVerification(verificationId);
        assertEq(record.identityId, identityId, "identity id");
        assertEq(record.provider, PROVIDER, "provider");
        assertEq(
            uint8(record.status),
            uint8(VerificationTypes.VerificationStatus.Approved),
            "status"
        );
        assertEq(trustScore.getScore(identityId), 10, "trust score bonus");
    }

    function testProviderCanBeDeactivated() public {
        verificationManager.setProviderStatus(PROVIDER, false, "");
        VerificationTypes.Provider memory provider = verificationManager
            .getProvider(PROVIDER);
        assertEq(provider.active, false, "active flag");
    }

    function testRecordAadhaarVerificationUsesTemplate() public {
        bytes32 identityId = identityRegistry.resolveIdentity(USER);

        vm.prank(PROVIDER);
        bytes32 verificationId = verificationManager.recordAadhaarVerification(
            identityId,
            "ipfs://aadhaar-evidence",
            uint64(block.timestamp + 60 days)
        );

        VerificationTypes.VerificationRecord memory record = verificationManager
            .getVerification(verificationId);
        assertEq(
            record.templateId,
            VerificationTypes.aadhaarTemplateId(),
            "template id"
        );
        assertEq(trustScore.getScore(identityId), 10, "trust score bonus");
    }

    function testRecordFaceVerificationUsesTemplate() public {
        bytes32 identityId = identityRegistry.resolveIdentity(USER);

        vm.startPrank(PROVIDER);
        verificationManager.recordAadhaarVerification(
            identityId,
            "ipfs://aadhaar",
            uint64(block.timestamp + 30 days)
        );
        bytes32 verificationId = verificationManager.recordFaceVerification(
            identityId,
            "ipfs://face-evidence",
            uint64(block.timestamp + 30 days)
        );
        vm.stopPrank();

        VerificationTypes.VerificationRecord memory record = verificationManager
            .getVerification(verificationId);
        assertEq(
            record.templateId,
            VerificationTypes.faceTemplateId(),
            "template id"
        );
        assertEq(trustScore.getScore(identityId), 20, "trust score stack");
    }

    function testRecordIncomeVerificationUsesTemplate() public {
        bytes32 identityId = identityRegistry.resolveIdentity(USER);

        vm.startPrank(PROVIDER);
        verificationManager.recordFaceVerification(
            identityId,
            "ipfs://face",
            uint64(block.timestamp + 15 days)
        );
        bytes32 verificationId = verificationManager.recordIncomeVerification(
            identityId,
            "ipfs://income-evidence",
            uint64(block.timestamp + 90 days)
        );
        vm.stopPrank();

        VerificationTypes.VerificationRecord memory record = verificationManager
            .getVerification(verificationId);
        assertEq(
            record.templateId,
            VerificationTypes.incomeTemplateId(),
            "template id"
        );
        assertEq(trustScore.getScore(identityId), 20, "trust score increase");
    }

    function testProviderCanUpdateVerificationStatus() public {
        bytes32 identityId = identityRegistry.resolveIdentity(USER);

        vm.prank(PROVIDER);
        bytes32 verificationId = verificationManager.recordVerification(
            identityId,
            emailTemplateId,
            "ipfs://evidence",
            uint64(block.timestamp + 7 days)
        );

        vm.prank(PROVIDER);
        verificationManager.setVerificationStatus(
            verificationId,
            VerificationTypes.VerificationStatus.Rejected
        );

        VerificationTypes.VerificationRecord memory record = verificationManager
            .getVerification(verificationId);
        assertEq(
            uint8(record.status),
            uint8(VerificationTypes.VerificationStatus.Rejected),
            "status"
        );
        assertEq(trustScore.getScore(identityId), 5, "trust decreased");
    }

    function testOnlyProviderOrAdminCanSetStatus() public {
        bytes32 identityId = identityRegistry.resolveIdentity(USER);

        vm.prank(PROVIDER);
        bytes32 verificationId = verificationManager.recordVerification(
            identityId,
            emailTemplateId,
            "ipfs://evidence",
            uint64(block.timestamp + 7 days)
        );

        vm.expectRevert(Errors.NotAuthorized.selector);
        vm.prank(address(0xDEAD));
        verificationManager.setVerificationStatus(
            verificationId,
            VerificationTypes.VerificationStatus.Rejected
        );

        verificationManager.setVerificationStatus(
            verificationId,
            VerificationTypes.VerificationStatus.Pending
        );

        VerificationTypes.VerificationRecord memory record = verificationManager
            .getVerification(verificationId);
        assertEq(
            uint8(record.status),
            uint8(VerificationTypes.VerificationStatus.Pending),
            "admin status"
        );
    }

    function testSetTrustScoreReplacesDependency() public {
        bytes32 identityId = identityRegistry.resolveIdentity(USER);

        TrustScore newTrust = new TrustScore(address(this));
        newTrust.grantRole(
            Roles.TRUST_SCORE_UPDATER,
            address(verificationManager)
        );

        verificationManager.setTrustScore(address(newTrust));

        vm.prank(PROVIDER);
        verificationManager.recordVerification(
            identityId,
            emailTemplateId,
            "ipfs://new-evidence",
            uint64(block.timestamp + 10 days)
        );

        assertEq(newTrust.getScore(identityId), 10, "new trust score");
    }

    function registerIdentity() internal returns (bytes32 identityId) {
        identityId = identityRegistry.registerIdentity(USER, "ipfs://identity");
    }
}
