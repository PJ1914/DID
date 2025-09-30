// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import {Groth16Verifier as IncomeVerifierBase} from "../../../tools/zk-circuits/build/IncomeVerifier.sol";

/// @notice Thin wrapper that re-exports the snarkjs-generated income ≥ verifier.
contract Groth16Verifier is IncomeVerifierBase {

}
