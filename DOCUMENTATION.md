# Decentralized Identity (DID) and Verification Platform Documentation

## Table of Contents
1. [High-Level Overview](#high-level-overview)
2. [Core Contracts](#core-contracts)
    - [IdentityRegistry.sol](#identityregistrysol)
    - [TrustScore.sol](#trustscoresol)
    - [VerificationLogger.sol](#verificationloggersol)
3. [Organizations](#organizations)
    - [OrganizationManager.sol](#organizationmanagersol)
4. [Verification Infrastructure](#verification-infrastructure)
    - [VerificationManager.sol](#verificationmanagersol)
    - [ZKProofManager.sol](#zkproofmanagersol)
5. [Privacy and Cross-Chain (Deprecated)](#privacy-and-cross-chain-deprecated)
6. [Zero-Knowledge (ZK) Circuits](#zero-knowledge-zk-circuits)
    - [Overview](#overview)
    - [Circuits](#circuits)

---

## 1. High-Level Overview

This platform provides a comprehensive framework for managing decentralized identities (DIDs), building trust through a dynamic scoring system, and verifying user credentials both on-chain and through privacy-preserving zero-knowledge proofs.

The key pillars of the system are:

- **Identity Management**: At its core, the system allows users to register a unique, non-transferable identity profile, represented by an `IdentityRegistry`. This profile serves as the central anchor for all interactions within the ecosystem.
- **Trust Score**: Each identity is associated with a `TrustScore`, a numerical representation of its reputation. This score is dynamically adjusted based on positive actions (e.g., successful verifications) and negative events (e.g., rejected verifications, disputes).
- **Verifiable Credentials**: The platform supports a robust verification system managed by `VerificationManager`. Trusted providers can issue on-chain attestations about user attributes (e.g., Aadhaar, income), which contribute to the identity's trust score.
- **Zero-Knowledge Proofs**: For enhanced privacy, the `ZKProofManager` and associated Circom circuits enable users to prove facts about their identity (e.g., "I am over 18") without revealing the underlying sensitive data. This is achieved by verifying proofs against on-chain Merkle root anchors.
- **Organizations**: The platform supports managing collections of identities within organizations (`OrganizationManager`), enabling complex, rule-based interactions without relying on the retired governance/dispute module.

---

## 2. Core Contracts

### `IdentityRegistry.sol`

The `IdentityRegistry` is the central hub for creating and managing user identities.

**Key Features:**

- **Identity Registration**: An `IDENTITY_ADMIN` can register a new identity for a given wallet address (`owner`). Each identity is assigned a unique `identityId`.
- **Status Management**: Identities have a status (`Pending`, `Active`, `Suspended`, `Revoked`) that can be updated by an `IDENTITY_ADMIN`.
- **Metadata**: Each identity can link to off-chain metadata (e.g., in IPFS) via a `metadataURI`. This can be updated by the owner or an admin.
- **Trust Score Integration**: The contract integrates with `ITrustScore` to fetch and display the trust score associated with an identity.

**Important Functions:**

- `registerIdentity(address owner, string calldata metadataURI)`: Creates a new identity profile.
- `setIdentityStatus(bytes32 identityId, IdentityStatus status)`: Updates the status of an identity.
- `updateMetadata(bytes32 identityId, string calldata metadataURI)`: Updates the metadata link.
- `getIdentity(bytes32 identityId)`: Retrieves the full identity profile, including the current trust score.
- `resolveIdentity(address owner)`: Finds the `identityId` associated with a wallet address.

---

### `TrustScore.sol`

This contract manages the reputation score for each identity.

**Key Features:**

- **Score Management**: A `TRUST_SCORE_UPDATER` role (typically held by other system contracts like `VerificationManager`) can increase or decrease an identity's score.
- **Direct Score Setting**: A `SYSTEM_ADMIN` can directly set a score for administrative purposes.
- **Event-Driven**: Emits a `TrustScoreUpdated` event for every change, providing a transparent audit trail.

**Important Functions:**

- `increaseScore(bytes32 identityId, uint256 amount, string calldata reason)`: Increases the score.
- `decreaseScore(bytes32 identityId, uint256 amount, string calldata reason)`: Decreases the score.
- `setScore(bytes32 identityId, uint256 amount, string calldata reason)`: Sets the score to a specific value.
- `getScore(bytes32 identityId)`: Retrieves the current score for an identity.

---

### `VerificationLogger.sol`

A simple, role-based event logger for creating a minimal, on-chain audit trail.

**Key Features:**

- **Role-Gated Logging**: Only accounts with the `LOGGER_ROLE` can write logs.
- **Structured Events**: Emits a `LogRecorded` event with a tag, actor, caller, content hash, and timestamp.

**Important Functions:**

- `logEvent(string calldata tag, address actor, bytes32 contentHash)`: Records a new log entry.

---

## 3. Organizations

### `OrganizationManager.sol`

Manages groups of identities, allowing for sub-communities with their own roles and permissions.

**Key Features:**

- **Registration**: An `ORGANIZATION_ADMIN` can register a new organization.
- **Role Management**: Each organization has its own internal roles (e.g., `ORGANIZATION_ADMIN`) that can be assigned to members.
- **Status Control**: A `SYSTEM_ADMIN` can manage the status (`Pending`, `Active`, `Suspended`) of any organization.

**Important Functions:**

- `registerOrganization(string calldata name, string calldata metadataURI)`: Creates a new organization.
- `assignRole(bytes32 organizationId, address account, bytes32 role)`: Assigns a role to a member within an organization.
- `revokeRole(bytes32 organizationId, address account, bytes32 role)`: Revokes a role from a member.
- `hasOrganizationRole(bytes32 organizationId, address account, bytes32 role)`: Checks if a member has a specific role.

---

## 4. Verification Infrastructure

### `VerificationManager.sol`

Manages on-chain attestations from trusted verification providers.

**Key Features:**

- **Provider Registry**: A `SYSTEM_ADMIN` can register and manage trusted `Verification Providers`.
- **Verification Recording**: Registered providers can record verifications for an identity against a specific `templateId` (e.g., Aadhaar, Face, Income).
- **Trust Score Integration**: Successfully recording a verification increases the identity's trust score. A rejected verification decreases it.
- **Status Updates**: Verifications can be `Approved`, `Pending`, `Rejected`, etc.

**Important Functions:**

- `registerProvider(address provider, string calldata name, string calldata metadataURI)`: Adds a new verification provider.
- `recordVerification(bytes32 identityId, bytes32 templateId, ...)`: Records a generic verification.
- `recordAadhaarVerification(...)`, `recordFaceVerification(...)`, `recordIncomeVerification(...)`: Convenience functions for common verification types.
- `setVerificationStatus(bytes32 verificationId, VerificationStatus status)`: Updates the status of a verification, potentially impacting the trust score.

---

### `ZKProofManager.sol`

The core contract for verifying zero-knowledge proofs.

**Key Features:**

- **Proof Type Registry**: Manages a list of supported proof types (e.g., "age_gte_18"), each linked to a specific `Groth16Verifier` contract.
- **Root Anchoring**: A `ROOT_MANAGER_ROLE` is responsible for anchoring valid Merkle roots on-chain. Proofs must be generated against one of these roots.
- **Nullifier Registry**: To prevent replay attacks, the contract tracks used `nullifiers`. Each valid proof consumes a unique nullifier.
- **Proof Verification**: Verifies a ZK proof by checking the verifier contract, the root's validity, and the nullifier's uniqueness.

**Important Functions:**

- `anchorRoot(bytes32 root)`: Anchors a new Merkle root.
- `verifyProof(uint256 typeId, bytes32 root, bytes32 nullifier, ...)`: The main function for verifying a generic Groth16 proof.
- `verifyAgeProof(...)`, `verifyIncomeProof(...)`, etc.: Convenience wrappers for specific, named proof types.
- `addProofType(...)`, `updateProofType(...)`: Administrative functions for managing the list of supported ZK circuits.

---

## 5. Privacy and Cross-Chain (Removed)

Earlier iterations of the platform experimented with cross-chain privacy bridges (for example `ChainRegistry`, `GlobalCredentialAnchor`, and `ZkKeyRegistry`). These modules have now been **fully removed** from the repository to simplify the core identity stack. Any historical references to these contracts in scripts or documentation are retained only for archival context.

If cross-chain functionality is reintroduced in the future, it should be implemented behind fresh interfaces that align with the simplified contract set described above.

---

## 6. Zero-Knowledge (ZK) Circuits

### Overview

The ZK circuits, located in `tools/zk-circuits/circuits/`, are built using **Circom** and are designed to prove facts about private identity attributes without revealing the attributes themselves. These attributes are stored off-chain in a Poseidon-based Merkle tree.

The general flow is:
1. A user's private data (e.g., birth year) is combined with a `salt` to create a leaf in a Merkle tree.
2. The root of this tree is anchored on-chain via `ZKProofManager.anchorRoot()`.
3. The user generates a proof locally, using their private data and the Merkle path as private inputs.
4. The proof is submitted to `ZKProofManager`, which verifies it against the public inputs (root, policy parameters) without ever seeing the private data.

### Circuits

The following circuits are available:

- **`age_check.circom`**: Proves that a user's age is greater than or equal to a specified minimum age (`minAge`).
- **`age_max_check.circom`**: Proves that a user's age is less than or equal to a specified maximum age.
- **`attr_equals.circom`**: A generic circuit to prove that a specific attribute (e.g., last 4 digits of Aadhaar) matches a given public value.
- **`income_check.circom`**: Proves that a user's income is greater than or equal to a specified minimum threshold.

For instructions on compiling the circuits and deploying their verifier contracts, see the `tools/zk-circuits/README.md` file.
