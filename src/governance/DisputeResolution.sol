// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IDisputeResolution} from "../interfaces/IDisputeResolution.sol";
import {Roles} from "../libs/Roles.sol";
import {Errors} from "../libs/Errors.sol";

contract DisputeResolution is AccessControl, IDisputeResolution {
    mapping(bytes32 => Dispute) private disputes;
    uint256 private disputeNonce;

    constructor(address admin) {
        require(admin != address(0), "admin");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.SYSTEM_ADMIN, admin);
        _grantRole(Roles.GOVERNANCE_ADMIN, admin);
    }

    function fileDispute(address respondent, bytes32 subjectId, string calldata reason)
        external
        override
        returns (bytes32)
    {
        if (respondent == address(0) || subjectId == bytes32(0)) {
            revert Errors.InvalidInput();
        }
        if (bytes(reason).length == 0) revert Errors.InvalidInput();

        bytes32 disputeId = keccak256(abi.encode(msg.sender, respondent, subjectId, block.timestamp, disputeNonce++));
        Dispute storage dispute = disputes[disputeId];
        dispute.id = disputeId;
        dispute.filer = msg.sender;
        dispute.respondent = respondent;
        dispute.subjectId = subjectId;
        dispute.reason = reason;
        dispute.status = DisputeStatus.Filed;
        dispute.createdAt = uint64(block.timestamp);

        emit DisputeFiled(disputeId, msg.sender, respondent);
        return disputeId;
    }

    function resolveDispute(bytes32 disputeId, bool uphold, string calldata resolution) external override {
        if (!hasRole(Roles.GOVERNANCE_ADMIN, msg.sender) && !hasRole(Roles.ARBITRATOR, msg.sender)) {
            revert Errors.NotAuthorized();
        }

        Dispute storage dispute = disputes[disputeId];
        if (dispute.id == bytes32(0)) revert Errors.DisputeNotFound();
        if (dispute.status == DisputeStatus.Resolved || dispute.status == DisputeStatus.Rejected) {
            revert Errors.InvalidStateTransition();
        }

        dispute.status = uphold ? DisputeStatus.Resolved : DisputeStatus.Rejected;
        dispute.resolvedAt = uint64(block.timestamp);
        dispute.resolution = resolution;

        emit DisputeStatusChanged(disputeId, dispute.status, resolution);
    }

    function getDispute(bytes32 disputeId) external view override returns (Dispute memory) {
        Dispute memory dispute = disputes[disputeId];
        if (dispute.id == bytes32(0)) revert Errors.DisputeNotFound();
        return dispute;
    }
}
