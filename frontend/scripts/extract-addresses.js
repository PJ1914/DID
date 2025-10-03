#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

/**
 * Script to extract contract addresses from deployment files
 * and generate a config file for the frontend
 */

const DEPLOYMENTS_DIR = path.join(__dirname, '../../deployments');
const BROADCAST_DIR = path.join(__dirname, '../../broadcast');
const OUTPUT_PATH = path.join(__dirname, '../src/lib/contracts/addresses.ts');

function readJsonFile(filePath) {
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.warn(`Failed to read ${filePath}:`, error.message);
    }
    return null;
}

function extractAddressesFromDeployment() {
    const addresses = {};

    // Check main deployment file
    const deploymentFile = path.join(DEPLOYMENTS_DIR, 'deployment.11155111.json');
    const deployment = readJsonFile(deploymentFile);

    if (deployment) {
        Object.entries(deployment).forEach(([key, value]) => {
            if (typeof value === 'string' && value.startsWith('0x')) {
                addresses[key] = value;
            } else if (typeof value === 'object' && value.address) {
                addresses[key] = value.address;
            }
        });
    }

    return addresses;
}

function extractAddressesFromBroadcast() {
    const addresses = {};
    const broadcastPath = path.join(BROADCAST_DIR, 'DeployAll.s.sol/11155111');

    if (fs.existsSync(broadcastPath)) {
        const files = fs.readdirSync(broadcastPath);
        const runFiles = files.filter(f => f.startsWith('run-') && f.endsWith('.json'));

        // Get the latest run file
        if (runFiles.length > 0) {
            const latestRun = runFiles.sort().pop();
            const runData = readJsonFile(path.join(broadcastPath, latestRun));

            if (runData && runData.transactions) {
                runData.transactions.forEach(tx => {
                    if (tx.contractName && tx.contractAddress) {
                        addresses[tx.contractName] = tx.contractAddress;
                    }
                });
            }
        }
    }

    return addresses;
}

function generateContractAddresses() {
    console.log('🔍 Extracting contract addresses...');

    // Try both deployment sources
    const deploymentAddresses = extractAddressesFromDeployment();
    const broadcastAddresses = extractAddressesFromBroadcast();

    // Merge addresses (broadcast takes precedence)
    const allAddresses = { ...deploymentAddresses, ...broadcastAddresses };

    if (Object.keys(allAddresses).length === 0) {
        console.warn('⚠️  No contract addresses found in deployment files');
        console.log('Make sure contracts are deployed and deployment files exist in:');
        console.log(`- ${DEPLOYMENTS_DIR}`);
        console.log(`- ${BROADCAST_DIR}`);
    }

    // Generate TypeScript file
    const contractsContent = `// Auto-generated contract addresses
// Generated on: ${new Date().toISOString()}

export const CONTRACT_ADDRESSES = {
${Object.entries(allAddresses)
            .map(([name, address]) => `  ${name}: '${address}' as const,`)
            .join('\n')}
} as const;

export type ContractName = keyof typeof CONTRACT_ADDRESSES;

// Sepolia testnet chain ID
export const CHAIN_ID = 11155111;

// Common contract name mappings
export const CONTRACTS = {
  // Core Identity Contracts
  UserIdentityRegistry: CONTRACT_ADDRESSES.UserIdentityRegistry || '',
  TrustScore: CONTRACT_ADDRESSES.TrustScore || '',
  VerificationLogger: CONTRACT_ADDRESSES.VerificationLogger || '',
  
  // Verification Managers
  VerificationManager: CONTRACT_ADDRESSES.VerificationManager || '',
  AadhaarVerificationManager: CONTRACT_ADDRESSES.AadhaarVerificationManager || '',
  FaceVerificationManager: CONTRACT_ADDRESSES.FaceVerificationManager || '',
  IncomeVerificationManager: CONTRACT_ADDRESSES.IncomeVerificationManager || '',
  OfflineVerificationManager: CONTRACT_ADDRESSES.OfflineVerificationManager || '',
  
  // Organizations
  OrganizationLogic: CONTRACT_ADDRESSES.OrganizationLogic || '',
  OrganizationRegistryProxy: CONTRACT_ADDRESSES.OrganizationRegistryProxy || '',
  OrganizationStorage: CONTRACT_ADDRESSES.OrganizationStorage || '',
  
  // Certificates
  CertificateManager: CONTRACT_ADDRESSES.CertificateManager || '',
  RecognitionManager: CONTRACT_ADDRESSES.RecognitionManager || '',
  
  // Account Abstraction
  IdentityAccountFactory: CONTRACT_ADDRESSES.IdentityAccountFactory || '',
  IdentityAccountDeployer: CONTRACT_ADDRESSES.IdentityAccountDeployer || '',
  IdentityModularAccount: CONTRACT_ADDRESSES.IdentityModularAccount || '',
  IdentityEntryPoint: CONTRACT_ADDRESSES.IdentityEntryPoint || '',
  
  // AA Modules
  SessionKeyModule: CONTRACT_ADDRESSES.SessionKeyModule || '',
  SubscriptionModule: CONTRACT_ADDRESSES.SubscriptionModule || '',
  BaseAccountModule: CONTRACT_ADDRESSES.BaseAccountModule || '',
  
  // AA Managers
  AAWalletManager: CONTRACT_ADDRESSES.AAWalletManager || '',
  SessionKeyManager: CONTRACT_ADDRESSES.SessionKeyManager || '',
  GuardianManager: CONTRACT_ADDRESSES.GuardianManager || '',
  RecoveryManager: CONTRACT_ADDRESSES.RecoveryManager || '',
  
  // Gas Management
  AlchemyGasManager: CONTRACT_ADDRESSES.AlchemyGasManager || '',
  PaymasterManager: CONTRACT_ADDRESSES.PaymasterManager || '',
  
  // ZK Proofs
  ZKProofManager: CONTRACT_ADDRESSES.ZKProofManager || '',
  
  // Governance & Migration
  DisputeResolution: CONTRACT_ADDRESSES.DisputeResolution || '',
  MigrationManager: CONTRACT_ADDRESSES.MigrationManager || '',
  
  // Stats & Interfaces
  WalletStatsManager: CONTRACT_ADDRESSES.WalletStatsManager || '',
  MobileVerificationInterface: CONTRACT_ADDRESSES.MobileVerificationInterface || '',
  
  // Registry
  ContractRegistry: CONTRACT_ADDRESSES.ContractRegistry || '',
} as const;

// Validation helper
export function validateContractAddress(contractName: string, address: string): boolean {
  return address && address.startsWith('0x') && address.length === 42;
}

// Get contract address with validation
export function getContractAddress(contractName: keyof typeof CONTRACTS): string {
  const address = CONTRACTS[contractName];
  if (!validateContractAddress(contractName, address)) {
    console.warn(\`⚠️  Invalid or missing address for contract: \${contractName}\`);
  }
  return address;
}
`;

    // Ensure directory exists
    const outputDir = path.dirname(OUTPUT_PATH);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(OUTPUT_PATH, contractsContent);

    console.log(`✅ Contract addresses generated: ${OUTPUT_PATH}`);
    console.log(`📋 Found ${Object.keys(allAddresses).length} contracts:`);
    Object.entries(allAddresses).forEach(([name, address]) => {
        console.log(`   ${name}: ${address}`);
    });

    return allAddresses;
}

// Run the script
if (require.main === module) {
    generateContractAddresses();
}

module.exports = { generateContractAddresses };