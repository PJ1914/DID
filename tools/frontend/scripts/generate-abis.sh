#!/bin/bash

# Generate all contract ABIs and save them to the frontend

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../" && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/tools/frontend"
ABI_DIR="$FRONTEND_DIR/src/lib/abis"

echo "🔨 Building contracts with Foundry..."
cd "$PROJECT_ROOT"
forge build

echo "�� Extracting ABIs..."

# Create ABI directory if it doesn't exist
mkdir -p "$ABI_DIR"

# Function to extract and format ABI
extract_abi() {
    local contract_name=$1
    local contract_path=$2
    local output_file="$ABI_DIR/${contract_name,,}.ts"
    
    local json_file="$PROJECT_ROOT/out/$contract_path/$contract_name.json"
    
    if [ -f "$json_file" ]; then
        echo "Extracting $contract_name..."
        
        # Extract ABI and format as TypeScript
        jq '.abi' "$json_file" > /tmp/temp_abi.json
        
        cat > "$output_file" << EOF
// Auto-generated ABI for $contract_name
export const ${contract_name}ABI = $(cat /tmp/temp_abi.json) as const;
EOF
        
        echo "✅ Generated $output_file"
    else
        echo "⚠️  Warning: $json_file not found"
    fi
}

# Core contracts
extract_abi "IdentityRegistry" "IdentityRegistry.sol"
extract_abi "TrustScore" "TrustScore.sol"
extract_abi "VerificationLogger" "VerificationLogger.sol"

# Verification contracts
extract_abi "VerificationManager" "VerificationManager.sol"
extract_abi "ZKProofManager" "ZKProofManager.sol"

# Organization contracts
extract_abi "OrganizationManager" "OrganizationManager.sol"
extract_abi "CertificateManager" "CertificateManager.sol"

# Advanced features
extract_abi "SessionKeyManager" "SessionKeyManager.sol"
extract_abi "AlchemyGasManager" "AlchemyGasManager.sol"
extract_abi "WalletStatsManager" "WalletStatsManager.sol"
extract_abi "RecoveryManager" "RecoveryManager.sol"
extract_abi "AAWalletManager" "AAWalletManager.sol"
extract_abi "GuardianManager" "GuardianManager.sol"

# Verifiers (optional - may not exist)
extract_abi "Groth16Verifier" "Groth16Verifier.sol"

echo ""
echo "✨ Generating index.ts..."

# Generate index file
cat > "$ABI_DIR/index.ts" << 'EOF'
// Auto-generated ABI exports
export * from './identityregistry';
export * from './trustscore';
export * from './verificationlogger';
export * from './verificationmanager';
export * from './zkproofmanager';
export * from './organizationmanager';
export * from './certificatemanager';
export * from './sessionkeymanager';
export * from './alchemygasmanager';
export * from './walletstatsmanager';
export * from './recoverymanager';
export * from './aawalletmanager';
export * from './guardianmanager';
// Note: Groth16Verifier ABI not auto-generated (multiple instances)
EOF

echo "✅ ABI generation complete!"
echo "📁 ABIs saved to: $ABI_DIR"
