# Sajjan DID Platform - Full Application Detailed View

## 1. Executive Summary
Sajjan is a blockchain-based decentralized identity and certificate verification platform built for secure issuance, validation, sharing, and revocation of academic/professional credentials. It combines Ethereum smart contracts (Solidity), a modern web frontend (Next.js + TypeScript), and role-governed workflows (Institute, Student, Verifier, Validator/Admin).

The application is designed to solve three core problems:
- Certificate forgery and tampering
- Slow, manual, institution-dependent verification
- Lack of auditable and immutable credential lifecycle tracking

Instead of storing sensitive certificate documents on-chain, Sajjan stores cryptographic certificate hashes and lifecycle state, preserving privacy while enabling trustless verification.

---

## 2. Objectives

| Objective | Description | Business Value |
|---|---|---|
| Anti-fraud verification | Detect fake/modified certificates using immutable hash proofs | Reduces hiring/admission fraud |
| Decentralized trust | Remove dependency on manual institution confirmation | Faster verification across organizations |
| Role-secured operations | Restrict issue/revoke actions to authorized entities | Prevents unauthorized credential activity |
| End-to-end lifecycle | Support issue, verify, revoke, and correction workflows | Complete operational coverage |
| Usability at scale | Provide single and bulk verification interfaces | Practical for institutions and recruiters |

---

## 3. System Scope
### Included
- On-chain certificate issuance and validation
- Revocation and correction tracking
- Role-aware dashboards for Institute, Student, Verifier
- Mobile-friendly verification route
- Bulk verification (CSV flow)
- Cloud deployment readiness (Vercel)

### Excluded (current scope)
- Full decentralized file storage for certificate payloads (hash-first approach is used)
- Advanced institutional governance tokenomics
- Cross-chain bridge verification (single target chain deployment in current setup)

---

## 4. High-Level Architecture

## 4.1 Logical Layers
1. Presentation Layer (Next.js frontend)
2. Access/Identity Layer (wallet + app auth model)
3. Smart Contract Layer (certificate lifecycle + governance)
4. Blockchain Network Layer (Sepolia/local EVM)

## 4.2 Component View

| Layer | Main Components | Responsibilities |
|---|---|---|
| Frontend | Institute/Student/Verifier portals | User interactions and workflows |
| Web3 Integration | wagmi, viem, RainbowKit | Wallet connection and contract calls |
| Contracts | CertificateHashRegistry, RevocationRegistry, BloomFilter, ValidatorConsensus | Immutable state and authorization logic |
| Configuration | Environment variables, contract addresses | Runtime wiring per environment |
| Deployment | GitHub + Vercel | CI build and production hosting |

---

## 5. Core Functional Modules

| Module | What it does | Key Inputs | Key Outputs |
|---|---|---|---|
| Certificate Issuance | Writes certificate hash and metadata reference to chain | Hash, holder, issuer authorization | Immutable issuance record |
| Certificate Verification | Validates status from on-chain record | Certificate hash | valid / revoked / not found |
| Revocation Management | Invalidates a credential with reason trail | Hash + reason + issuer auth | Revocation event + state update |
| Bulk Verification | Verifies multiple certificate hashes in one workflow | CSV batch | Per-item result summary |
| Mobile Verification | Verifies via URL/query params | hash, optional fields | Compact verification response |
| Role Enforcement | Restricts privileged actions by role + authorization state | Wallet, role checks | Allow/deny decision |

---

## 6. Smart Contract Domain Model

## 6.1 Main Contracts

| Contract | Primary Role | Notes |
|---|---|---|
| CertificateHashRegistry | Main certificate source of truth | Issue, query, verify, issuer authorization checks |
| RevocationRegistry | Revocation and correction tracking | Maintains immutable lifecycle trail |
| BloomFilter | Fast pre-check for potential existence | Reduces unnecessary expensive checks |
| ValidatorConsensus | Governance for institution approval workflows | Validator-driven proposal/voting model |

## 6.2 Security and Access
- Role-based access control is used for privileged actions
- On-chain authorization state is validated before issuance
- Unauthorized issuer attempts are blocked
- Contract-centric checks prevent UI bypass risk

---

## 7. Frontend Functional Topology

## 7.1 Role Portals

| Portal | Main Capabilities |
|---|---|
| Institute | Issue certificate, key management, validator voting, dashboard |
| Student | View certificates, history, share and wallet utilities |
| Verifier | Single verify, bulk verify, verification history |

## 7.2 User Journey Summary
1. User connects wallet
2. App resolves network + contract addresses
3. Role/authorization gates are evaluated
4. User performs workflow (issue/verify/revoke/etc.)
5. On-chain calls and UI state reflect final status

---

## 8. Data and Trust Model
### On-chain
- Certificate hash and lifecycle state
- Issuer/holder relationships
- Revocation/correction history

### Off-chain/app-side
- UI preferences and workflow state
- Optional supplementary metadata paths
- Verification presentation and dashboard summaries

### Integrity Principle
Document content is not required on-chain. Integrity is established by comparing the computed document hash to the on-chain fingerprint and status.

---

## 9. Methodology and Delivery Approach

| Phase | Activities | Deliverables |
|---|---|---|
| Analysis | Actor/use-case definition, threat awareness | Requirements and boundaries |
| Design | Contract interfaces, role model, frontend routes | Architecture and flow models |
| Build | Smart contracts + frontend implementation | Functional system modules |
| Integrate | ABI/address/config wiring | End-to-end operability |
| Validate | Build checks, workflow tests, role checks | Stable deployment candidate |
| Deploy | Git push, Vercel build, env provisioning | Publicly deployable app |

Development followed iterative issue-fix-validation cycles with production build verification as a release gate.

---

## 10. System Requirements

## 10.1 Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | Authorized institute can issue certificate records | High |
| FR-02 | Any verifier can validate a certificate by hash | High |
| FR-03 | Authorized issuer can revoke certificate with reason | High |
| FR-04 | Student can view and track their certificates | Medium |
| FR-05 | Verifier can execute bulk verification | Medium |
| FR-06 | Mobile verification route supports query-based checks | Medium |
| FR-07 | Unauthorized issuance attempts are blocked | High |
| FR-08 | Verification history is visible for audit context | Medium |

## 10.2 Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | Security | Contract-level RBAC + frontend guards |
| NFR-02 | Integrity | Immutable blockchain state |
| NFR-03 | Availability | Cloud-hosted frontend + public RPC |
| NFR-04 | Performance | Practical response for verification workflows |
| NFR-05 | Scalability | Supports increasing verification throughput |
| NFR-06 | Usability | Role-specific, clear portal UX |
| NFR-07 | Maintainability | Modular contracts/components/hooks |
| NFR-08 | Deployability | Build and deploy via Vercel pipeline |

---

## 11. Build and Deployment View

## 11.1 Build Status Summary
- Frontend production build completes successfully
- Static page generation for role routes is successful
- Deployment to Vercel is operational with proper env setup

## 11.2 Deployment Checklist

| Step | Action |
|---|---|
| 1 | Push code to GitHub repository |
| 2 | Import repository in Vercel |
| 3 | Set project root to frontend |
| 4 | Configure environment variables |
| 5 | Trigger deploy and verify route health |

## 11.3 Environment Variables (Core)

| Variable Group | Purpose |
|---|---|
| Firebase public keys | App service configuration |
| RPC URLs | Chain connectivity |
| WalletConnect Project ID | Wallet relay/session support |
| Contract addresses | Runtime contract binding |

---

## 12. Results and Validation Snapshot

| Evaluation Area | Result |
|---|---|
| Frontend production build | Pass |
| Route rendering and static generation | Pass |
| Single verification workflow | Pass |
| Bulk verification workflow | Pass |
| Mobile verification workflow | Pass |
| Unauthorized issuer prevention | Pass |
| Cloud deployment pipeline | Pass |

## 12.1 Observed Implementation Wins
- ABI mismatches were resolved for certificate retrieval paths
- Issuer authorization checks were strengthened using on-chain validation
- SSR build stability issues were addressed (Suspense/local storage handling)
- Framework security patching was applied and redeployed

---

## 13. Risk and Operational Notes

| Risk | Impact | Mitigation |
|---|---|---|
| Issuer not authorized on-chain | Certificate issuance fails | Admin executes issuer authorization transaction |
| Misconfigured env vars | Runtime feature failures | Validate env before deployment |
| Dependency security advisories | Build blocking/warnings | Keep framework and deps patched |
| RPC instability | Slow/failed reads | Use reliable public/provider endpoints |

---

## 14. Discussion
Sajjan demonstrates a practical and secure approach to credential verification by combining blockchain immutability with a usable role-based application layer. The hash-first trust model provides strong anti-tamper guarantees without exposing certificate content publicly. This model is suitable for institutions that need transparent, auditable verification while maintaining data minimization.

A notable implementation learning is that production quality depends as much on operational correctness as on code correctness: ABI consistency, on-chain role state, and SSR-safe frontend patterns materially influence reliability. The project addresses these concerns with explicit role checks, build-time hardening, and deployment-focused validation.

For broader production adoption, future work should prioritize stronger automation around issuer onboarding, deeper monitoring dashboards, richer test coverage across edge cases, and improved governance ergonomics.

---

## 15. Future Enhancements

| Area | Enhancement |
|---|---|
| Governance | More flexible validator approval policies |
| Storage | Optional decentralized document anchors (IPFS/Arweave references) |
| Observability | Operational analytics and alerting dashboards |
| Interoperability | Multi-network or cross-chain verification adapters |
| Security | Automated dependency and policy compliance gates |

---

## 16. Conclusion
The application is a full-stack blockchain verification platform with clear role segregation, auditable credential lifecycle management, and successful cloud deployment readiness. It is technically mature for testnet-backed operation and provides a strong foundation for institutional-grade credential trust services.