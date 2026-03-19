/**
 * Role constants for BC-CVS contracts
 * These match the role definitions in src/libs/Roles.sol
 * Solidity: keccak256("ROLE_NAME") = keccak256 of UTF-8 bytes
 * viem:     keccak256(toBytes("ROLE_NAME")) = same result ✅
 * WRONG:    keccak256(toHex("ROLE_NAME"))  = hashes the hex string, not bytes ❌
 */

import { keccak256, toBytes } from "viem"

// Core DID roles
export const ADMINISTRATOR = keccak256(toBytes("ADMINISTRATOR"))
export const VERIFIER = keccak256(toBytes("VERIFIER"))
export const GUARDIAN = keccak256(toBytes("GUARDIAN"))

// BC-CVS roles
export const CERTIFICATE_ISSUER = keccak256(toBytes("CERTIFICATE_ISSUER"))
export const CERTIFICATE_HOLDER = keccak256(toBytes("CERTIFICATE_HOLDER"))
export const BLOOM_FILTER_MANAGER = keccak256(toBytes("BLOOM_FILTER_MANAGER"))
export const VALIDATOR_INSTITUTION = keccak256(toBytes("VALIDATOR_INSTITUTION"))

// Organization roles
export const ORGANIZATION_ADMIN = keccak256(toBytes("ORGANIZATION_ADMIN"))
export const MEMBERSHIP_MANAGER = keccak256(toBytes("MEMBERSHIP_MANAGER"))
export const CERTIFICATE_MANAGER = keccak256(toBytes("CERTIFICATE_MANAGER"))
export const CREDENTIAL_ISSUER = keccak256(toBytes("CREDENTIAL_ISSUER"))
