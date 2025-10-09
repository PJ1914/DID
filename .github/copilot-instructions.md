# DID Smart Contracts - AI Coding Guide

## Project Overview
This is a modular, production-grade suite of Solidity contracts for decentralized identity (DID) and verifiable credentials on Ethereum-compatible chains. The system integrates privacy-preserving ZK proofs, ERC-4337 account abstraction, and organization-managed credentials.

## Architecture Patterns

### Core Component Structure
- **Core Layer**: `src/core/` contains the foundation - `IdentityRegistry`, `TrustScore`, `VerificationLogger`
- **Verification Layer**: `src/verification/` handles proof validation and ZK integration
- **Organization Layer**: `src/organizations/` manages credential issuance via ERC721 certificates
- **Advanced Features**: `src/advanced_features/` includes account abstraction, gas management, session keys

### Key Design Patterns
- **Role-Based Access Control**: All contracts use OpenZeppelin's `AccessControl` with custom roles defined in `src/libs/Roles.sol`
- **Interface Separation**: Interfaces are decoupled in `src/interfaces/` - import specific interfaces per contract, not monolithic shared files
- **Custom Errors**: Use custom errors from `src/libs/Errors.sol` for gas efficiency and clear failure reasons
- **Structured Types**: Common data structures defined in `src/libs/IdentityTypes.sol`

### Data Flow Architecture
1. **Identity Registration**: `IdentityRegistry` creates unique identity IDs linked to owner addresses
2. **Trust Scoring**: `TrustScore` contract manages dynamic scoring based on verifications
3. **Event Logging**: `VerificationLogger` provides audit trail for all verification events
4. **ZK Proofs**: `ZKProofManager` validates Groth16 proofs against anchored Merkle roots

## Development Workflows

### Build & Test
```bash
# Standard Foundry workflow
forge build               # Build all contracts
forge test                # Run test suite  
make build                # Alternative via Makefile
make test                 # Alternative via Makefile
```

### Deployment Patterns
- **Modular Scripts**: Deployment scripts in `script/deploy/`, `script/roles/`, `script/identity/` etc.
- **Environment Variables**: Use `RPC_URL`, `PRIVATE_KEY` for network deployment
- **Artifacts**: Deployment data stored in `broadcast/` by chain ID

Common deployment sequence:
```bash
# 1. Deploy core contracts
make deploy FOUNDRY_SCRIPT=script/deploy/DeployAll.s.sol:DeployAll

# 2. Setup roles
forge script script/roles/BootstrapRoles.s.sol:BootstrapRoles --broadcast

# 3. Deploy ZK components (requires verifier addresses in env)
forge script script/zk/DeployAndWireZK.s.sol:DeployAndWireZK --broadcast
```

### Configuration Files
- **foundry.toml**: Uses `viaIR=true`, `solc_optimize_runs=200`, specific remappings for OpenZeppelin
- **Remappings**: `@openzeppelin/contracts`, `@foundry-devops`, `@openzeppelin/contracts-upgradeable/`
- **File Permissions**: Configured for `broadcast/` and `deployments/` directory access

## ZK Integration Specifics

### Circuit Architecture
- **Location**: `tools/zk-circuits/` contains Circom circuits for age, income, attribute proofs
- **Merkle Trees**: Uses Poseidon hashing with configurable depth (20-32 levels)
- **Verifiers**: Generated Groth16 verifiers deployed as separate contracts in `src/verification/verifiers/`

### ZK Proof Flow
1. Off-chain: Generate witness from private data + Merkle path
2. Generate proof using circuit-specific proving key
3. On-chain: Submit proof to `ZKProofManager` for verification
4. Trust score updated based on successful verification

## Frontend Integration

### Tech Stack
- **Next.js** with Turbopack for fast development
- **RainbowKit** + **wagmi** for wallet connection
- **Radix UI** components for consistent design
- **React Three Fiber** for 3D elements

### Contract Integration
- **Addresses**: Environment-based contract addresses in `frontend/src/contracts/addresses.ts`
- **Multi-network**: Supports Sepolia (11155111) and localhost (31337)
- **Type Safety**: TypeScript throughout frontend codebase

## Critical Developer Notes

### Recent Refactor (Sept 2025)
- **Session Keys**: Now require external EOA signer, use bytes4 selector allowlists
- **Subscription Module**: Failure handling changed to return bool instead of reverting
- **Account Locking**: New `lockAccount`/`unlockAccount` functionality gates module operations
- **Recognition System**: Removed `RecognitionManager` - use `CertificateManager` for credentials

### Gas Optimization
- **Custom Errors**: Always use custom errors over string reverts
- **IR Compilation**: `viaIR=true` enabled for better optimization
- **Alchemy Integration**: `AlchemyGasManager` for sponsored transactions

### Testing Conventions
- **Unit Tests**: `tests/unit/` for isolated contract testing
- **Integration Tests**: `tests/integration/` for cross-contract workflows
- **Mocking**: Use interfaces for dependency injection in tests

When working with this codebase, always check the recent changes in README.md and respect the modular architecture. Deploy in sequence (core → roles → ZK), and use the provided Makefile for standard operations.