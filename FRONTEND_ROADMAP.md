# Frontend Development Roadmap

This document outlines the complete implementation plan for the DID Platform frontend.

## Phase 1: Foundation ✅ COMPLETE

- [x] Project initialization with Next.js 14
- [x] Install core dependencies (wagmi, viem, RainbowKit)
- [x] Install UI libraries (shadcn/ui, Magic UI)
- [x] Set up directory structure
- [x] Create Web3Provider with RainbowKit
- [x] Build MainLayout with animated background
- [x] Create Navigation component
- [x] Design Homepage with animations
- [x] Add base UI components from shadcn
- [x] Add Magic UI animated components

## Phase 2: Smart Contract Integration 🔨 IN PROGRESS

### Step 1: Copy Contract ABIs
```bash
# From the root DID directory
cd /home/alen/solidity/DID
forge build

# Copy ABIs to frontend
cp out/IdentityRegistry.sol/IdentityRegistry.json frontend/src/contracts/abis/
cp out/TrustScore.sol/TrustScore.json frontend/src/contracts/abis/
cp out/VerificationLogger.sol/VerificationLogger.json frontend/src/contracts/abis/
cp out/VerificationManager.sol/VerificationManager.json frontend/src/contracts/abis/
cp out/ZKProofManager.sol/ZKProofManager.json frontend/src/contracts/abis/
cp out/OrganizationManager.sol/OrganizationManager.json frontend/src/contracts/abis/
cp out/CertificateManager.sol/CertificateManager.json frontend/src/contracts/abis/
cp out/AAWalletManager.sol/AAWalletManager.json frontend/src/contracts/abis/
cp out/GuardianManager.sol/GuardianManager.json frontend/src/contracts/abis/
cp out/RecoveryManager.sol/RecoveryManager.json frontend/src/contracts/abis/
cp out/SessionKeyManager.sol/SessionKeyManager.json frontend/src/contracts/abis/
cp out/AlchemyGasManager.sol/AlchemyGasManager.json frontend/src/contracts/abis/
```

### Step 2: Deploy Contracts
```bash
# Deploy to Sepolia testnet
forge script script/deploy/DeployAll.s.sol:DeployAll \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  --broadcast \
  --verify
```

### Step 3: Update Contract Addresses
Update `frontend/.env.local` with deployed addresses from broadcast files.

## Phase 3: Core Pages Development 📄

### 3.1 Identity Management Page (`/identity`)
**Components to Build:**
- `src/app/identity/page.tsx` - Main identity page
- `src/components/features/identity/RegisterIdentityForm.tsx`
- `src/components/features/identity/IdentityCard.tsx`
- `src/components/features/identity/MetadataEditor.tsx`
- `src/components/features/identity/StatusBadge.tsx`

**Hooks to Create:**
- `src/hooks/useIdentityRegistry.ts`
  - `useRegisterIdentity()`
  - `useGetIdentity()`
  - `useUpdateMetadata()`
  - `useSetIdentityStatus()`

**Features:**
- Register new identity with IPFS metadata upload
- View current identity details
- Edit metadata URI
- Display identity status with color-coded badge
- Show creation/update timestamps

### 3.2 Trust Score Dashboard
**Components:**
- `src/components/features/identity/TrustScoreWidget.tsx`
- `src/components/features/identity/TrustScoreHistory.tsx`
- `src/components/features/identity/ScoreBreakdown.tsx`

**Hooks:**
- `src/hooks/useTrustScore.ts`
  - `useGetScore()`
  - `useScoreHistory()`
  - `useWatchScoreUpdates()`

**Features:**
- Large animated score display with NumberTicker
- Score trend graph (Chart.js or Recharts)
- Event history timeline
- Breakdown by source (verifications, certificates, etc.)

### 3.3 Verification Center (`/verify`)
**Components:**
- `src/app/verify/page.tsx`
- `src/components/features/verification/ProviderList.tsx`
- `src/components/features/verification/VerificationForm.tsx`
- `src/components/features/verification/StatusTracker.tsx`
- `src/components/features/verification/ZKProofGenerator.tsx`

**Hooks:**
- `src/hooks/useVerificationManager.ts`
  - `useRegisterProvider()`
  - `useRecordVerification()`
  - `useGetVerification()`
- `src/hooks/useZKProofManager.ts`
  - `useVerifyProof()`
  - `useAnchorRoot()`
  - `useIsValidRoot()`

**Features:**
- Browse verification providers
- Submit verification requests
- Upload evidence to IPFS
- Track verification status
- Generate ZK proofs (age, income, attributes)
- Verify proofs without revealing data

### 3.4 Organizations Page (`/organizations`)
**Components:**
- `src/app/organizations/page.tsx`
- `src/components/features/organizations/CreateOrgForm.tsx`
- `src/components/features/organizations/OrgCard.tsx`
- `src/components/features/organizations/MemberList.tsx`
- `src/components/features/organizations/RoleManager.tsx`

**Hooks:**
- `src/hooks/useOrganizationManager.ts`
  - `useRegisterOrganization()`
  - `useGetOrganization()`
  - `useAssignRole()`
  - `useRevokeRole()`

**Features:**
- Create new organization
- View organization details
- Add/remove members
- Assign/revoke roles (ORGANIZATION_ADMIN, ISSUER_ROLE)
- Update organization metadata

### 3.5 Certificates Page (`/certificates`)
**Components:**
- `src/app/certificates/page.tsx`
- `src/components/features/certificates/CertificateGallery.tsx`
- `src/components/features/certificates/IssueCertificateForm.tsx`
- `src/components/features/certificates/CertificateCard.tsx` (NFT-style)
- `src/components/features/certificates/CertificateDetails.tsx`

**Hooks:**
- `src/hooks/useCertificateManager.ts`
  - `useIssueCertificate()`
  - `useRevokeCertificate()`
  - `useGetCertificate()`
  - `useGetUserCertificates()`

**Features:**
- NFT-style certificate gallery
- Issue certificate to identity
- View certificate metadata
- Revoke certificates
- Download/share certificate
- Display issuer and organization info

### 3.6 Account Recovery (`/recovery`)
**Components:**
- `src/app/recovery/page.tsx`
- `src/components/features/recovery/GuardianList.tsx`
- `src/components/features/recovery/AddGuardianForm.tsx`
- `src/components/features/recovery/RecoveryRequestForm.tsx`
- `src/components/features/recovery/RecoveryTimeline.tsx`
- `src/components/features/recovery/SessionKeyManager.tsx`

**Hooks:**
- `src/hooks/useGuardianManager.ts`
  - `useSetGuardians()`
  - `useAddGuardian()`
  - `useRemoveGuardian()`
  - `useGetGuardians()`
- `src/hooks/useRecoveryManager.ts`
  - `useRequestRecovery()`
  - `useConfirmRecovery()`
  - `useExecuteRecovery()`
- `src/hooks/useSessionKeyManager.ts`
  - `useAddSessionKey()`
  - `useRevokeSessionKey()`
  - `useGetSessionKeys()`

**Features:**
- Manage guardians (add/remove)
- Initiate recovery process
- Confirm recovery as guardian
- Execute recovery after delay
- Create session keys with permissions
- Manage active session keys

## Phase 4: Web3 Components 🌐

### Shared Web3 Components
Create these reusable components in `src/components/web3/`:

1. **TransactionButton.tsx**
   - Handles transaction states (idle, preparing, pending, success, error)
   - Shows loading states and confirmations
   - Displays gas estimates

2. **AddressDisplay.tsx**
   - Shortened address with copy button
   - ENS name resolution (if available)
   - Link to block explorer

3. **NetworkSwitcher.tsx**
   - Detect current network
   - Prompt to switch if on wrong network
   - Visual network indicator

4. **GasEstimator.tsx**
   - Real-time gas price display
   - Estimated total cost
   - Slow/Standard/Fast options

5. **BlockchainExplorerLink.tsx**
   - Links to Etherscan/block explorer
   - For transactions, addresses, blocks

6. **ErrorBoundary.tsx**
   - Catch Web3 errors
   - Display user-friendly messages
   - Retry functionality

## Phase 5: Enhanced Features ⭐

### 5.1 IPFS Integration
- File upload component with drag-drop
- IPFS gateway configuration
- Metadata preview
- Pinning service integration (Pinata/Web3.Storage)

### 5.2 Real-time Updates
- WebSocket event listeners
- Live transaction confirmations
- Toast notifications for events
- Activity feed updates

### 5.3 Data Visualization
- Trust score charts
- Verification statistics
- Organization member graphs
- Certificate issuance trends

### 5.4 Search & Filters
- Search identities by address
- Filter verifications by type/status
- Organization member search
- Certificate filtering

## Phase 6: Polish & Optimization 🎨

### 6.1 Performance
- [ ] Code splitting by route
- [ ] Lazy load heavy components
- [ ] Image optimization
- [ ] Reduce bundle size
- [ ] Implement service worker (PWA)

### 6.2 Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus indicators
- [ ] Color contrast check

### 6.3 Testing
- [ ] Unit tests (Jest)
- [ ] Component tests (React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] Web3 integration tests

### 6.4 Documentation
- [ ] Component Storybook
- [ ] API documentation
- [ ] User guide
- [ ] Developer docs

## Phase 7: Deployment 🚀

### 7.1 Build Optimization
```bash
npm run build
npm run start # test production build
```

### 7.2 Environment Setup
- Production environment variables
- RPC endpoints (Alchemy/Infura)
- IPFS gateway configuration
- WalletConnect project ID

### 7.3 Deployment Platforms
- **Vercel** (recommended for Next.js)
- **Netlify**
- **IPFS** (for decentralized hosting)
- **Fleek** (Web3-native hosting)

### 7.4 Monitoring
- Error tracking (Sentry)
- Analytics (Vercel Analytics)
- Performance monitoring
- Web3 transaction monitoring

## Development Tips

### Using MCP Servers for UI Components

You have access to:
1. **Magic UI** (@magicuidesign/mcp)
   - Premium animated components
   - Special effects (particles, confetti)
   - Text animations

2. **21st.dev** (@21st-dev/magic)
   - Search for UI components
   - Get modern component implementations
   - UI refinement

Example usage:
```bash
# Add more Magic UI components
npx shadcn@latest add "https://magicui.design/r/cool-mode.json"
npx shadcn@latest add "https://magicui.design/r/hyper-text.json"
```

### Best Practices

1. **Always use TypeScript** with strict mode
2. **Test on mobile** devices frequently
3. **Handle all error states** gracefully
4. **Show transaction previews** before confirmation
5. **Implement loading states** for all async operations
6. **Use optimistic updates** for better UX
7. **Cache blockchain data** appropriately
8. **Provide clear feedback** for all user actions

### Common Patterns

#### Transaction Flow
```typescript
const { write, isLoading, isSuccess, error } = useContractWrite({
  address,
  abi,
  functionName: 'yourFunction',
})

// In component
{isLoading && <Spinner />}
{isSuccess && <SuccessMessage />}
{error && <ErrorMessage error={error} />}
```

#### Contract Read with Caching
```typescript
const { data, isLoading } = useContractRead({
  address,
  abi,
  functionName: 'getIdentity',
  args: [identityId],
  watch: true, // Auto-refresh on events
})
```

## Getting Help

- Review `/FEATURES.md` for contract workflows
- Check `/CONTRACT_ANALYSIS_GUIDE.md` for contract details
- See `/DOCUMENTATION.md` for system overview
- Use MCP servers for UI component inspiration

---

**Start with Phase 2, then build each page incrementally in Phase 3!**
