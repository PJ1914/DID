#!/bin/bash

# Fix legacy hook ABI imports to use PascalCase

echo "🔧 Fixing legacy hook ABI imports..."

cd "$(dirname "$0")/../src/hooks"

# Fix useIdentity.ts
echo "  Fixing useIdentity.ts..."
sed -i 's/identityRegistryAbi/IdentityRegistryABI/g' useIdentity.ts
sed -i 's/trustScoreAbi/TrustScoreABI/g' useIdentity.ts

# Fix useVerifications.ts
echo "  Fixing useVerifications.ts..."
sed -i 's/verificationManagerAbi/VerificationManagerABI/g' useVerifications.ts

# Fix useOrganizations.ts
echo "  Fixing useOrganizations.ts..."
sed -i 's/organizationManagerAbi/OrganizationManagerABI/g' useOrganizations.ts

# Fix useZkProofs.ts
echo "  Fixing useZkProofs.ts..."
sed -i 's/zkProofManagerAbi/ZKProofManagerABI/g' useZkProofs.ts

echo "✅ All legacy hooks fixed!"
echo ""
echo "You may need to restart the dev server:"
echo "  cd /home/alen/solidity/DID/tools/frontend"
echo "  npm run dev"
