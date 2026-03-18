# Sajjan Deployment & Interaction Scripts

This directory contains Foundry scripts for deploying and interacting with the Sajjan (Blockchain and Cybersecurity-Based Certificate Verification System) smart contracts.

## Contract Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Sajjan System                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐      ┌───────────────────────┐  │
│  │  ValidatorConsensus  │─────▶│  Institutional        │  │
│  │  (Governance)        │      │  Onboarding           │  │
│  └──────────────────────┘      └───────────────────────┘  │
│                                                              │
│  ┌──────────────────────┐      ┌───────────────────────┐  │
│  │ CertificateRegistry  │◀─────│  Certificate          │  │
│  │ (Core)               │      │  Issuance/Verification│  │
│  └─────────┬────────────┘      └───────────────────────┘  │
│            │                                                 │
│            ├──────────┐                                     │
│            ▼          ▼                                     │
│  ┌──────────────┐  ┌─────────────────┐                   │
│  │ BloomFilter  │  │ RevocationReg   │                   │
│  │ (Fast Lookup)│  │ (Audit Trail)   │                   │
│  └──────────────┘  └─────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

## Deployment

### 1. Deploy All Sajjan Contracts

Deploy the complete Sajjan system in one transaction:

```bash
# Set environment variables
export PRIVATE_KEY="your_private_key"
export RPC_URL="https://sepolia.infura.io/v3/YOUR_KEY"

# Deploy all contracts
forge script script/deploy/DeployBCCVS.s.sol:DeployBCCVS \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY \
  --broadcast
```

This deploys:
- **BloomFilter**: Gas optimization layer (1MB bit array, ~8.4M bits)
- **RevocationRegistry**: Immutable audit trail for revocations/corrections
- **ValidatorConsensus**: Institutional governance (100% unanimous approval)
- **CertificateHashRegistry**: Core certificate management (SHA-256 + RSA)

Deployment addresses are saved to `deployments/bc-cvs-deployment.<chainid>.json`.

## Governance Operations

### 2. Add Validators

Add validator institutions that can vote on proposals:

```bash
# Edit script/bc-cvs/AddValidators.s.sol to set validator addresses

export VALIDATOR_CONSENSUS_ADDRESS="0x..."
forge script script/bc-cvs/AddValidators.s.sol:AddValidators \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY \
  --broadcast
```

### 3. Propose Institution Onboarding

Propose a new institution to be onboarded:

```bash
export VALIDATOR_CONSENSUS_ADDRESS="0x..."
export INSTITUTION_ADDRESS="0x..."
export INSTITUTION_NAME="Harvard University"
export DOCUMENT_HASH="0x..." # Hash of supporting documents

forge script script/bc-cvs/ProposeInstitution.s.sol:ProposeInstitution \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY \
  --broadcast
```

### 4. Vote on Institution Proposals

Validators vote on institutional onboarding proposals:

```bash
export VALIDATOR_CONSENSUS_ADDRESS="0x..."
export PROPOSAL_ID="0" # Get from ProposeInstitution output

# Each validator runs this:
forge script script/bc-cvs/ProposeInstitution.s.sol:VoteForInstitution \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY \
  --broadcast
```

**Important**: Requires 100% unanimous approval. Proposal auto-executes on final vote.

### 5. Reject Proposal (Admin Only)

Emergency rejection if fraud is detected:

```bash
export VALIDATOR_CONSENSUS_ADDRESS="0x..."
export PROPOSAL_ID="0"
export REJECTION_REASON="Fraud detected in documentation"

forge script script/bc-cvs/ProposeInstitution.s.sol:RejectProposal \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY \
  --broadcast
```

## Certificate Operations

### 6. Issue Certificate

Institutions issue certificates:

```bash
export CERTIFICATE_REGISTRY_ADDRESS="0x..."
export CERTIFICATE_HASH="0x..." # SHA-256 hash of certificate
export RSA_SIGNATURE="0x..." # RSA signature bytes
export HOLDER_ADDRESS="0x..." # Student/recipient address
export ISSUER_PUB_KEY="0x..." # Issuer's RSA public key
export METADATA="Bachelor of Science in Computer Science - 2024"

forge script script/bc-cvs/CertificateOperations.s.sol:IssueCertificate \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY \
  --broadcast
```

Certificate is automatically:
- Stored in `CertificateHashRegistry`
- Added to Bloom filter for O(1) lookup
- Logged for audit trail

### 7. Verify Certificate

Anyone can verify a certificate:

```bash
export CERTIFICATE_REGISTRY_ADDRESS="0x..."
export CERTIFICATE_HASH="0x..."
export RSA_SIGNATURE="0x..."

forge script script/bc-cvs/CertificateOperations.s.sol:VerifyCertificate \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY
```

Verification process:
1. **Bloom filter check** (O(1) fast pre-verification)
2. **Full verification** (hash + RSA signature validation)
3. **Revocation check** (audit trail lookup)

### 8. Get Certificate Details

Retrieve complete certificate information:

```bash
export CERTIFICATE_REGISTRY_ADDRESS="0x..."
export CERTIFICATE_HASH="0x..."

forge script script/bc-cvs/CertificateOperations.s.sol:GetCertificateDetails \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY
```

### 9. Query Certificates by Issuer

```bash
export CERTIFICATE_REGISTRY_ADDRESS="0x..."
export ISSUER_ADDRESS="0x..."
export OFFSET="0"
export LIMIT="100"

forge script script/bc-cvs/CertificateOperations.s.sol:GetCertificatesByIssuer \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY
```

### 10. Query Certificates by Holder

```bash
export CERTIFICATE_REGISTRY_ADDRESS="0x..."
export HOLDER_ADDRESS="0x..."
export OFFSET="0"
export LIMIT="100"

forge script script/bc-cvs/CertificateOperations.s.sol:GetCertificatesByHolder \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY
```

## Revocation Operations

### 11. Revoke Certificate

Issuers can revoke certificates:

```bash
export CERTIFICATE_REGISTRY_ADDRESS="0x..."
export CERTIFICATE_HASH="0x..."
export REVOCATION_REASON="Certificate lost or stolen"

forge script script/bc-cvs/RevocationOperations.s.sol:RevokeCertificate \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY \
  --broadcast
```

### 12. Correct Certificate

Replace a revoked certificate with a corrected version:

```bash
export CERTIFICATE_REGISTRY_ADDRESS="0x..."
export ORIGINAL_CERTIFICATE_HASH="0x..." # Must be revoked first
export REPLACEMENT_CERTIFICATE_HASH="0x..." # New corrected hash
export CORRECTION_REASON="Fixed date of birth error"

forge script script/bc-cvs/RevocationOperations.s.sol:CorrectCertificate \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY \
  --broadcast
```

**Important**: Original certificate must be revoked first. Then:
1. Correct certificate (links old → new)
2. Issue new certificate with replacement hash

### 13. Batch Revoke Certificates

Revoke multiple certificates in one transaction:

```bash
# Edit script/bc-cvs/RevocationOperations.s.sol to set certificate hashes

export REVOCATION_REGISTRY_ADDRESS="0x..."
forge script script/bc-cvs/RevocationOperations.s.sol:BatchRevokeCertificates \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY \
  --broadcast
```

### 14. Get Revocation Audit Trail

Retrieve complete audit trail for a certificate:

```bash
export REVOCATION_REGISTRY_ADDRESS="0x..."
export CERTIFICATE_HASH="0x..."

forge script script/bc-cvs/RevocationOperations.s.sol:GetRevocationAuditTrail \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY
```

Shows:
- Who revoked the certificate
- When it was revoked
- Reason for revocation
- Correction details (if corrected)
- Replacement certificate hash

### 15. Get Revocations by Issuer

```bash
export REVOCATION_REGISTRY_ADDRESS="0x..."
export ISSUER_ADDRESS="0x..."
export OFFSET="0"
export LIMIT="100"

forge script script/bc-cvs/RevocationOperations.s.sol:GetRevocationsByIssuer \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY
```

### 16. Get Revocation Statistics

```bash
export REVOCATION_REGISTRY_ADDRESS="0x..."

forge script script/bc-cvs/RevocationOperations.s.sol:GetRevocationStatistics \
  --rpc-url $RPC_URL \
  --private-key-env PRIVATE_KEY
```

## Complete Workflow Example

### Onboard Institution → Issue Certificate → Verify

```bash
# 1. Deploy system
forge script script/deploy/DeployBCCVS.s.sol:DeployBCCVS --broadcast

# 2. Add validators (if needed)
export VALIDATOR_CONSENSUS_ADDRESS="<from deployment>"
forge script script/bc-cvs/AddValidators.s.sol:AddValidators --broadcast

# 3. Propose institution
export INSTITUTION_ADDRESS="0xINSTITUTION"
export INSTITUTION_NAME="MIT"
export DOCUMENT_HASH="0xDOC_HASH"
forge script script/bc-cvs/ProposeInstitution.s.sol:ProposeInstitution --broadcast

# 4. All validators vote
export PROPOSAL_ID="0"
# (Each validator runs this)
forge script script/bc-cvs/ProposeInstitution.s.sol:VoteForInstitution --broadcast

# 5. Institution issues certificate (after onboarding)
export CERTIFICATE_REGISTRY_ADDRESS="<from deployment>"
export CERTIFICATE_HASH="0xCERT_HASH"
export RSA_SIGNATURE="0xSIG"
export HOLDER_ADDRESS="0xSTUDENT"
export ISSUER_PUB_KEY="0xPUB_KEY"
export METADATA="Degree info"
forge script script/bc-cvs/CertificateOperations.s.sol:IssueCertificate --broadcast

# 6. Verify certificate
forge script script/bc-cvs/CertificateOperations.s.sol:VerifyCertificate
```

## Gas Optimization

The Sajjan system uses a **Bloom Filter** to optimize gas costs:

- **Bloom Filter**: O(1) lookup, ~1MB bit array
- **False Positive Rate**: ~1% (configurable)
- **No False Negatives**: Guaranteed
- **Gas Savings**: ~50-70% on verification checks

Verification flow:
1. Check Bloom filter (very cheap, ~5k gas)
2. If exists, do full verification (expensive, ~50k gas)
3. Result: Most invalid certificates rejected instantly

## Security Features

### Sybil Attack Prevention
- Unanimous approval (100%) for institutional onboarding
- Multi-validator consensus
- No single point of failure

### Immutable Audit Trail
- All revocations permanently recorded
- Correction mechanism maintains history
- Timestamps for all operations

### RSA Signature Validation
- SHA-256 hashing
- RSA signature verification
- Issuer public key storage

## Troubleshooting

### "NotValidator" Error
- Ensure caller has VALIDATOR_INSTITUTION role
- Check with: `consensus.isValidator(address)`

### "NotAuthorizedIssuer" Error
- Institution must be onboarded via ValidatorConsensus
- Check with: `consensus.isInstitutionRegistered(address)`

### "CertificateAlreadyExists" Error
- Certificate hash must be unique
- Use different hash or check for duplicates

### "CertificateAlreadyRevoked" Error
- Cannot revoke a certificate twice
- Check revocation status first

### "UnanimousApprovalRequired" Error
- All validators must vote "yes"
- Check proposal votes: `consensus.getProposal(proposalId)`

## Next Steps

After deployment and setup:

1. **Frontend Integration**: Use deployment JSON files to connect frontend
2. **Event Monitoring**: Set up event listeners for real-time updates
3. **Key Management**: Secure RSA key generation for institutions
4. **MFA Setup**: Implement multi-factor authentication
5. **Testing**: Run integration tests with real-world scenarios

## Resources

- [Sajjan Implementation Plan](../../Sajjan_IMPLEMENTATION_PLAN.md)
- [Smart Contract Documentation](../../src/bc-cvs/)
- [Test Suites](../../tests/bc-cvs/)
- [Frontend Documentation](../../frontend/README.md)
