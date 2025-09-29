// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ITrustScore} from "../interfaces/ITrustScore.sol";
import {Roles} from "../libs/Roles.sol";
import {Errors} from "../libs/Errors.sol";

contract TrustScore is AccessControl, ITrustScore {
    mapping(bytes32 => uint256) private scores;

    constructor(address admin) {
        require(admin != address(0), "admin");
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(Roles.SYSTEM_ADMIN, admin);
        _grantRole(Roles.TRUST_SCORE_UPDATER, admin);
    }

    function getScore(bytes32 identityId) external view override returns (uint256) {
        return scores[identityId];
    }

    function increaseScore(bytes32 identityId, uint256 amount, string calldata reason)
        external
        override
        onlyRole(Roles.TRUST_SCORE_UPDATER)
    {
        if (amount == 0) revert Errors.InvalidInput();
        uint256 newScore = scores[identityId] + amount;
        scores[identityId] = newScore;
        emit TrustScoreUpdated(identityId, int256(uint256(amount)), newScore, reason);
    }

    function decreaseScore(bytes32 identityId, uint256 amount, string calldata reason)
        external
        override
        onlyRole(Roles.TRUST_SCORE_UPDATER)
    {
        if (amount == 0) revert Errors.InvalidInput();
        uint256 current = scores[identityId];
        uint256 newScore = current > amount ? current - amount : 0;
        scores[identityId] = newScore;
        emit TrustScoreUpdated(identityId, -int256(uint256(amount)), newScore, reason);
    }

    function setScore(bytes32 identityId, uint256 amount, string calldata reason)
        external
        override
        onlyRole(Roles.SYSTEM_ADMIN)
    {
        scores[identityId] = amount;
        emit TrustScoreUpdated(identityId, 0, amount, reason);
    }
}
