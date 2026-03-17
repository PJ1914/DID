# Sajjan Role-Based Access Control (RBAC)

## Overview

The Sajjan system implements role-based access control using smart contract roles stored on-chain. User roles are checked against the blockchain before granting access to specific pages.

## Available Roles

Based on `src/libs/Roles.sol`:

- **ADMINISTRATOR** - Full system control
- **VALIDATOR_INSTITUTION** - Can vote on new institution proposals
- **CERTIFICATE_ISSUER** - Can issue and revoke certificates (institutes)
- **CERTIFICATE_HOLDER** - Student who holds certificates
- **VERIFIER** - Employer/third-party who verifies certificates
- **BLOOM_FILTER_MANAGER** - System role for bloom filter updates

## Using Role Checking

### 1. useRoles Hook

Check user roles in any component:

```typescript
import { useRoles } from "@/hooks/useRoles"

function MyComponent() {
  const {
    address,
    isConnected,
    isAdmin,
    isValidator,
    isIssuer,
    isHolder,
    isVerifier,
    isInstitute,  // isIssuer OR isValidator
    isStudent,    // isHolder
    hasAnyRole,
  } = useRoles()

  if (!isConnected) {
    return <div>Please connect wallet</div>
  }

  if (isIssuer) {
    return <div>Institute Dashboard</div>
  }

  return <div>Default View</div>
}
```

### 2. ProtectedRoute Component

Wrap pages to require specific roles:

```typescript
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function IssueCertificatePage() {
  return (
    <ProtectedRoute requiredRole="issuer" fallbackPath="/bc-cvs/dashboard">
      {/* Page content - only accessible to issuers */}
      <IssueForm />
    </ProtectedRoute>
  )
}
```

Available `requiredRole` values:
- `"admin"` - Administrators only
- `"issuer"` - Certificate issuers only
- `"validator"` - Validator institutions only
- `"holder"` - Certificate holders (students) only
- `"verifier"` - Verifiers only
- `"institute"` - Issuers OR validators
- `"student"` - Certificate holders

### 3. Dashboard Routing

The unified dashboard (`/bc-cvs/dashboard`) automatically routes users based on their role:

1. **Admin** → `/bc-cvs/institute/dashboard`
2. **Issuer/Validator** → `/bc-cvs/institute`
3. **Holder** → `/bc-cvs/student`
4. **Verifier** → `/bc-cvs/verifier`

## Page Access Control Examples

### Institute Pages (Issuer Role Required)

```typescript
// app/bc-cvs/institute/issue-certificate/page.tsx
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function IssueCertificatePage() {
  return (
    <ProtectedRoute requiredRole="issuer">
      {/* Only accessible to certificate issuers */}
      <IssueCertificateForm />
    </ProtectedRoute>
  )
}
```

### Student Pages (Holder Role Required)

```typescript
// app/bc-cvs/student/my-certificates/page.tsx
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function MyCertificatesPage() {
  return (
    <ProtectedRoute requiredRole="holder">
      {/* Only accessible to certificate holders */}
      <CertificatesList />
    </ProtectedRoute>
  )
}
```

### Verifier Pages (Verifier Role Required)

```typescript
// app/bc-cvs/verifier/verify-certificate/page.tsx
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function VerifyCertificatePage() {
  return (
    <ProtectedRoute requiredRole="verifier">
      {/* Only accessible to verifiers */}
      <VerificationForm />
    </ProtectedRoute>
  )
}
```

### Admin Only Pages

```typescript
// app/bc-cvs/admin/manage-roles/page.tsx
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function ManageRolesPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      {/* Only accessible to administrators */}
      <RoleManagement />
    </ProtectedRoute>
  )
}
```

## Role Assignment

Roles are assigned on-chain by administrators using the smart contracts:

### Granting Roles

```solidity
// Grant issuer role to an institution
certificateRegistry.grantRole(CERTIFICATE_ISSUER, institutionAddress);

// Grant holder role when issuing certificate
certificateRegistry.grantRole(CERTIFICATE_HOLDER, studentAddress);

// Grant verifier role
certificateRegistry.grantRole(VERIFIER, employerAddress);
```

### Scripts for Role Management

Use Foundry scripts in `script/roles/`:

```bash
# Grant issuer role
forge script script/roles/GrantIssuerRole.s.sol --broadcast

# Grant validator role
forge script script/roles/GrantValidatorRole.s.sol --broadcast
```

Or use Hardhat scripts:

```bash
npx hardhat run scripts/grant-issuer-role.js --network sepolia
```

## Navigation

Bottom navigation adapts based on user roles:

- **Home** - Landing page (public)
- **Dashboard** - Role-based routing to appropriate dashboard
- **Verify** - Certificate verification (for verifiers)
- **Institute** - Institute portal (for issuers/validators)
- **Student** - Student portal (for holders)
- **Certs** - My Certificates (for holders)

## User Flow

1. **Connect Wallet** - User connects MetaMask/wallet
2. **Role Check** - System queries blockchain for user's roles
3. **Route to Dashboard** - Automatic redirect based on role
4. **Access Pages** - Protected routes enforce role requirements

## Error States

### No Wallet Connected
Users see a prompt to connect their wallet before accessing any protected page.

### No Role Assigned
Users without any role receive instructions on how to get access:
- Students: Wait for certificate issuance
- Institutions: Contact admin for issuer role
- Verifiers: Contact admin for verifier role

### Insufficient Permissions
Users trying to access pages without required roles are redirected to their dashboard.

## Security Notes

- Role checks happen **on-chain** - cannot be spoofed
- Roles are checked on **every page load**
- Access control is **enforced at component level**
- Failed access attempts redirect to appropriate dashboard
- All role checks use **wagmi/viem** for blockchain queries

## Implementation Checklist

- [x] Role constants defined in `useRoles.ts`
- [x] `useRoles()` hook for role checking
- [x] `ProtectedRoute` component for page protection
- [x] Unified dashboard with role-based routing
- [x] Bottom navigation restored
- [x] Role-based access documentation

## Next Steps

To implement RBAC on existing pages:

1. Import `ProtectedRoute` component
2. Wrap page content with appropriate `requiredRole`
3. Test access with different wallet addresses
4. Ensure roles are granted via smart contracts

Example migration:

```typescript
// Before
export default function MyPage() {
  return <div>Content</div>
}

// After
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function MyPage() {
  return (
    <ProtectedRoute requiredRole="issuer">
      <div>Content</div>
    </ProtectedRoute>
  )
}
```
