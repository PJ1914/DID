// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {DisputeResolution} from "../src/governance/DisputeResolution.sol";
import {IDisputeResolution} from "../src/interfaces/IDisputeResolution.sol";
import {Roles} from "../src/libs/Roles.sol";
import {Errors} from "../src/libs/Errors.sol";

contract DisputeResolutionTest is Test {
    DisputeResolution private disputeResolution;

    address private constant ADMIN = address(0x1111);
    address private constant FILER = address(0x2222);
    address private constant RESPONDENT = address(0x3333);

    function setUp() public {
        disputeResolution = new DisputeResolution(ADMIN);
    }

    function testFileDisputeCreatesRecord() public {
        vm.startPrank(FILER);
        bytes32 disputeId = disputeResolution.fileDispute(RESPONDENT, bytes32(uint256(1)), "Incorrect verification");
        vm.stopPrank();

        IDisputeResolution.Dispute memory dispute = disputeResolution.getDispute(disputeId);
        assertEq(dispute.filer, FILER, "filer");
        assertEq(dispute.respondent, RESPONDENT, "respondent");
        assertEq(uint8(dispute.status), uint8(IDisputeResolution.DisputeStatus.Filed), "status");
    }

    function testResolveDisputeByGovernanceAdmin() public {
        bytes32 disputeId = _fileDispute();

        vm.prank(ADMIN);
        disputeResolution.resolveDispute(disputeId, true, "upheld");

        IDisputeResolution.Dispute memory dispute = disputeResolution.getDispute(disputeId);
        assertEq(uint8(dispute.status), uint8(IDisputeResolution.DisputeStatus.Resolved), "status");
        assertEq(dispute.resolution, "upheld", "resolution text");
    }

    function testResolveDisputeByArbitrator() public {
        bytes32 disputeId = _fileDispute();

        vm.prank(ADMIN);
        disputeResolution.grantRole(Roles.ARBITRATOR, address(this));

        disputeResolution.resolveDispute(disputeId, false, "rejected");

        IDisputeResolution.Dispute memory dispute = disputeResolution.getDispute(disputeId);
        assertEq(uint8(dispute.status), uint8(IDisputeResolution.DisputeStatus.Rejected), "status");
    }

    function testResolveDisputeUnauthorizedReverts() public {
        bytes32 disputeId = _fileDispute();

        vm.expectRevert(Errors.NotAuthorized.selector);
        disputeResolution.resolveDispute(disputeId, true, "upheld");
    }

    function testResolveDisputeTwiceReverts() public {
        bytes32 disputeId = _fileDispute();

        vm.prank(ADMIN);
        disputeResolution.resolveDispute(disputeId, true, "upheld");

        vm.prank(ADMIN);
        vm.expectRevert(Errors.InvalidStateTransition.selector);
        disputeResolution.resolveDispute(disputeId, true, "again");
    }

    function _fileDispute() internal returns (bytes32 disputeId) {
        vm.prank(FILER);
        disputeId = disputeResolution.fileDispute(RESPONDENT, bytes32(uint256(42)), "incorrect score");
    }
}
