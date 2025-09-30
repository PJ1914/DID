// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import {Groth16Verifier as AgeVerifierBase} from "../../../tools/zk-circuits/build/AgeVerifier.sol";

/// @notice Thin wrapper that re-exports the snarkjs-generated Age ≥ verifier.
contract Groth16Verifier is AgeVerifierBase {

}
