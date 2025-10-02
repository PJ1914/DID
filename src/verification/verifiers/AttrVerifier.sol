// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

import {Groth16Verifier as AttrVerifierBase} from "../../../tools/zk-circuits/build/AttrVerifier.sol";

/// @notice Thin wrapper that re-exports the snarkjs-generated attribute equality verifier.
contract Groth16Verifier is AttrVerifierBase {}
