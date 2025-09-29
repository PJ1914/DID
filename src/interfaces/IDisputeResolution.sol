// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDisputeResolution {
    enum DisputeStatus {
        Filed,
        UnderReview,
        Resolved,
        Rejected
    }

    struct Dispute {
        bytes32 id;
        address filer;
        address respondent;
        bytes32 subjectId;
        string reason;
        DisputeStatus status;
        uint64 createdAt;
        uint64 resolvedAt;
        string resolution;
    }

    event DisputeFiled(bytes32 indexed disputeId, address indexed filer, address indexed respondent);
    event DisputeStatusChanged(bytes32 indexed disputeId, DisputeStatus status, string resolution);

    function fileDispute(address respondent, bytes32 subjectId, string calldata reason) external returns (bytes32);

    function resolveDispute(bytes32 disputeId, bool uphold, string calldata resolution) external;

    function getDispute(bytes32 disputeId) external view returns (Dispute memory);
}
