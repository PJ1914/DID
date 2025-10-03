# Smart Contract Features and Workflows

This document outlines the features implemented in the decentralized identity (DID) smart contract ecosystem and explains the primary workflows.

## Table of Contents
1.  [Core Components](#core-components)
    -   [IdentityRegistry](#identityregistry)
    -   [TrustScore](#trustscore)
    -   [VerificationLogger](#verificationlogger)
2.  [Verification Mechanisms](#verification-mechanisms)
    -   [VerificationManager](#verificationmanager)
    -   [ZKProofManager](#zkproofmanager)
3.  [Organizations](#organizations)
    -   [OrganizationManager](#organizationmanager)
    -   [CertificateManager](#certificatemanager)
4.  [Advanced Features: Account Abstraction](#advanced-features-account-abstraction)
    -   [AAWalletManager](#aawalletmanager)
    -   [GuardianManager](#guardianmanager)
    -   [SessionKeyManager](#sessionkeymanager)
    -   [RecoveryManager](#recoverymanager)
    -   [AlchemyGasManager](#alchemygasmanager)
5.  [Workflows](#workflows)
    -   [User Onboarding and Identity Creation](#user-onboarding-and-identity-creation)
    -   [On-Chain Verification Workflow](#on-chain-verification-workflow)
    -   [Zero-Knowledge Proof Verification Workflow](#zero-knowledge-proof-verification-workflow)
    -   [Organization Certificate Issuance Workflow](#organization-certificate-issuance-workflow)
    -   [Account Recovery Workflow](#account-recovery-workflow)

---

## Core Components

### IdentityRegistry
The `IdentityRegistry` is the cornerstone of the DID system, managing the lifecycle of user identities.

-   **Features**:
    -   **User Registration**: Creates a unique `identityId` for a user's wallet address.
    -   **Profile Management**: Stores a metadata URI (e.g., pointing to an IPFS file) for each identity.
    -   **Status Control**: Manages the status of an identity (e.g., `Pending`, `Active`, `Revoked`).
-   **Key Functions**: `registerIdentity`, `setIdentityStatus`, `updateMetadata`, `getIdentity`.

### TrustScore
The `TrustScore` contract provides a dynamic reputation system for identities.

-   **Features**:
    -   **Score Management**: Allows authorized contracts to increase or decrease an identity's score based on their actions.
    -   **Audit Trail**: Emits a `TrustScoreUpdated` event for every change, ensuring transparency.
-   **Key Functions**: `increaseScore`, `decreaseScore`, `getScore`.

### VerificationLogger
A centralized, role-gated logger that creates an on-chain audit trail for significant events.

-   **Features**:
    -   **Immutable Logging**: Only authorized contracts can write logs.
    -   **Structured Events**: Emits a `LogRecorded` event with a tag, actor, and content hash.
-   **Key Functions**: `logEvent`.

---

## Verification Mechanisms

### VerificationManager
Manages on-chain attestations from trusted third-party providers.

-   **Features**:
    -   **Provider Registry**: A system admin can register and manage trusted verification providers.
    -   **Attestation Recording**: Providers can record verifications (e.g., for Aadhaar, income) for a user's identity.
    -   **Trust Score Integration**: Successful verifications increase an identity's trust score, while rejections decrease it.
-   **Key Functions**: `registerProvider`, `recordVerification`, `setVerificationStatus`.

### ZKProofManager
Enables privacy-preserving verification using zero-knowledge proofs (Groth16).

-   **Features**:
    -   **Proof Type Registry**: Manages different types of ZK proofs (e.g., age check, income check), each with its own verifier contract.
    -   **Merkle Root Anchoring**: A trusted role anchors Merkle roots on-chain, which are used to generate proofs.
    -   **Nullifier Registry**: Prevents replay attacks by ensuring a nullifier is used only once.
-   **Key Functions**: `anchorRoot`, `verifyProof`.

---

## Organizations

### OrganizationManager
Allows for the creation and management of organizations, which are groups of identities.

-   **Features**:
    -   **Organization Registration**: Creates a unique `organizationId` for a new organization.
    -   **Role-Based Access Control**: Each organization can assign internal roles to its members.
-   **Key Functions**: `registerOrganization`, `assignRole`, `getOrganization`.

### CertificateManager
An ERC-721 contract that allows organizations to issue non-transferable certificates to identities.

-   **Features**:
    -   **Certificate Minting**: Active organizations with an `ISSUER_ROLE` can mint certificates for verified identities.
    -   **Revocation**: Certificates can be revoked by the issuing organization.
    -   **On-Chain Record**: Each certificate is an NFT, creating a permanent, verifiable record.
-   **Key Functions**: `issueCertificate`, `revokeCertificate`, `getCertificate`.

---

## Advanced Features: Account Abstraction

### AAWalletManager
The central manager for ERC-4337 compliant smart accounts (AA wallets).

-   **Features**:
    -   **Wallet Creation**: Deploys smart accounts for users.
    -   **User Operation Execution**: Manages the execution of user operations through a trusted entry point.
    -   **Modular Integration**: Integrates with other advanced feature modules like `GuardianManager` and `SessionKeyManager`.
-   **Key Functions**: `createWallet`, `execute`.

### GuardianManager
Implements a social recovery mechanism for user accounts.

-   **Features**:
    -   **Guardian Management**: Users can add or remove a list of trusted guardians.
    -   **Verification**: Provides a mechanism for other contracts to check if an address is a valid guardian for a user.
-   **Key Functions**: `setGuardians`, `isGuardian`.

### SessionKeyManager
Allows users to delegate limited permissions to other keys (session keys).

-   **Features**:
    -   **Key Delegation**: Users can grant temporary permissions to a session key.
    -   **Permission Scoping**: Permissions can be limited by time, spending limits, allowed functions, and target contracts.
-   **Key Functions**: `addSessionKey`, `revokeSessionKey`.

### RecoveryManager
Manages the workflow for recovering an account using guardians.

-   **Features**:
    -   **Recovery Initiation**: A guardian can start the recovery process for a user's account.
    -   **Confirmation**: Other guardians must confirm the recovery request.
    -   **Execution**: Once a threshold of confirmations is met and a time delay has passed, the recovery can be executed.
-   **Key Functions**: `requestRecovery`, `confirmRecovery`, `executeRecovery`.

### AlchemyGasManager
Provides gas sponsorship for user operations based on a set of rules.

-   **Features**:
    -   **Rule-Based Sponsorship**: Defines rules for when a user's transaction should be sponsored (e.g., based on trust score).
    -   **Usage Tracking**: Monitors gas usage to enforce daily and monthly limits.
-   **Key Functions**: `updateSponsorshipRule`, `getDecision`.

---

## Workflows

### User Onboarding and Identity Creation
1.  **Admin Action**: A system admin calls `IdentityRegistry.registerIdentity()`, providing the user's wallet address and a metadata URI.
2.  **Contract Action**: The `IdentityRegistry` creates a new `identityId`, sets the initial status to `Pending`, and emits an `IdentityRegistered` event.
3.  **Result**: The user now has a decentralized identity linked to their wallet.

### On-Chain Verification Workflow
1.  **User Action**: The user submits their credentials to a trusted off-chain verification provider.
2.  **Provider Action**: The provider verifies the credentials and calls `VerificationManager.recordVerification()`, providing the user's `identityId` and evidence.
3.  **Contract Action**:
    -   The `VerificationManager` records the verification.
    -   It then calls `TrustScore.increaseScore()` to boost the user's reputation.
4.  **Result**: The user has an on-chain, verifiable credential, and their trust score is increased.

### Zero-Knowledge Proof Verification Workflow
1.  **User Action**: The user generates a ZK proof locally to prove a fact (e.g., "I am over 18") without revealing their birthdate. The proof is generated against a Merkle root previously anchored on-chain by an admin.
2.  **DApp Action**: The user submits the proof to a decentralized application (DApp).
3.  **Contract Action**: The DApp calls `ZKProofManager.verifyProof()`, which checks the proof's validity, the Merkle root, and ensures the nullifier has not been used.
4.  **Result**: The DApp can confirm the user's claim without accessing any private data.

### Organization Certificate Issuance Workflow
1.  **Organization Action**: An admin of an organization grants the `ISSUER_ROLE` to a member.
2.  **Issuer Action**: The issuer calls `CertificateManager.issueCertificate()`, specifying the recipient's `identityId` and a metadata URI for the certificate.
3.  **Contract Action**:
    -   The `CertificateManager` validates that the issuer has the required role and the organization is active.
    -   It mints a new ERC-721 token (the certificate) and assigns it to the recipient.
    -   It logs the event using the `VerificationLogger`.
4.  **Result**: The user receives a verifiable, non-transferable NFT certificate from the organization.

### Account Recovery Workflow
1.  **Guardian Action**: A guardian initiates the recovery process by calling `RecoveryManager.requestRecovery()`, providing the user's wallet address and the proposed new owner address.
2.  **Other Guardians' Action**: Other guardians are notified off-chain and call `RecoveryManager.confirmRecovery()` to approve the request.
3.  **Contract Action**: The `RecoveryManager` tracks the confirmations.
4.  **New Owner Action**: After a predefined delay and once enough guardians have confirmed, the new owner can call `RecoveryManager.executeRecovery()` to take control of the account.
5.  **Result**: The user's account is successfully recovered and now controlled by the new owner address.
