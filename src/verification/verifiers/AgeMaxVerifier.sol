// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import {Groth16Verifier as AgeMaxVerifierBase} from "../../../tools/zk-circuits/build/AgeMaxVerifier.sol";

/// @notice Thin wrapper that re-exports the snarkjs-generated AgeMax Groth16 verifier within the src tree.
contract Groth16Verifier is AgeMaxVerifierBase {

}
