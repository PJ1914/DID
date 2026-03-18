const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("==============================================");
  console.log("Sajjan Deployment (Hardhat)");
  console.log("==============================================");

  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log("Deployer/Admin:", deployer.address);
  console.log("Network:", network.name, "(Chain ID:", network.chainId.toString(), ")");
  console.log("");

  // ============================================
  // Step 1: Deploy BloomFilter
  // ============================================
  console.log("Deploying BloomFilter...");
  const BloomFilter = await hre.ethers.getContractFactory("BloomFilter");
  const bloomFilter = await BloomFilter.deploy(deployer.address);
  await bloomFilter.waitForDeployment();
  const bloomFilterAddress = await bloomFilter.getAddress();
  console.log("  ✅ BloomFilter deployed at:", bloomFilterAddress);
  console.log("");

  // ============================================
  // Step 2: Deploy RevocationRegistry
  // ============================================
  console.log("Deploying RevocationRegistry...");
  const RevocationRegistry = await hre.ethers.getContractFactory("RevocationRegistry");
  const revocationRegistry = await RevocationRegistry.deploy(deployer.address);
  await revocationRegistry.waitForDeployment();
  const revocationRegistryAddress = await revocationRegistry.getAddress();
  console.log("  ✅ RevocationRegistry deployed at:", revocationRegistryAddress);
  console.log("");

  // ============================================
  // Step 3: Deploy ValidatorConsensus
  // ============================================
  console.log("Deploying ValidatorConsensus...");
  const ValidatorConsensus = await hre.ethers.getContractFactory("ValidatorConsensus");
  const initialValidators = [deployer.address]; // Admin as first validator
  const validatorConsensus = await ValidatorConsensus.deploy(
    deployer.address,
    initialValidators
  );
  await validatorConsensus.waitForDeployment();
  const validatorConsensusAddress = await validatorConsensus.getAddress();
  console.log("  ✅ ValidatorConsensus deployed at:", validatorConsensusAddress);
  console.log("");

  // ============================================
  // Step 4: Deploy CertificateHashRegistry
  // ============================================
  console.log("Deploying CertificateHashRegistry...");
  const CertificateHashRegistry = await hre.ethers.getContractFactory("CertificateHashRegistry");
  const certificateRegistry = await CertificateHashRegistry.deploy(
    deployer.address
  );
  await certificateRegistry.waitForDeployment();
  const certificateRegistryAddress = await certificateRegistry.getAddress();
  console.log("  ✅ CertificateHashRegistry deployed at:", certificateRegistryAddress);
  console.log("");

  // ============================================
  // Step 5: Wire Contracts Together (Grant Roles)
  // ============================================
  console.log("Wiring contracts together...");

  // Compute role hashes (same as in Roles.sol)
  const BLOOM_FILTER_MANAGER = hre.ethers.id("BLOOM_FILTER_MANAGER");
  const CERTIFICATE_ISSUER = hre.ethers.id("CERTIFICATE_ISSUER");

  // Grant CertificateHashRegistry permission to write to BloomFilter
  console.log("  Granting BLOOM_FILTER_MANAGER role to CertificateRegistry...");
  const tx1 = await bloomFilter.grantRole(BLOOM_FILTER_MANAGER, certificateRegistryAddress);
  await tx1.wait();
  console.log("  ✅ Role granted");

  // Grant CertificateHashRegistry permission to write to RevocationRegistry
  console.log("  Granting CERTIFICATE_ISSUER role to CertificateRegistry...");
  const tx2 = await revocationRegistry.grantRole(CERTIFICATE_ISSUER, certificateRegistryAddress);
  await tx2.wait();
  console.log("  ✅ Role granted");
  console.log("");

  // ============================================
  // Deployment Summary
  // ============================================
  console.log("==============================================");
  console.log("✅ DEPLOYMENT COMPLETE!");
  console.log("==============================================");
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log("─────────────────────────────────────────────");
  console.log("NEXT_PUBLIC_BLOOM_FILTER=" + bloomFilterAddress);
  console.log("NEXT_PUBLIC_REVOCATION_REGISTRY=" + revocationRegistryAddress);
  console.log("NEXT_PUBLIC_VALIDATOR_CONSENSUS=" + validatorConsensusAddress);
  console.log("NEXT_PUBLIC_CERTIFICATE_HASH_REGISTRY=" + certificateRegistryAddress);
  console.log("");
  console.log("📝 Copy the above addresses to your frontend/.env file");
  console.log("");

  // Save deployment info to JSON
  const deploymentData = {
    network: {
      name: network.name,
      chainId: network.chainId.toString(),
    },
    deployer: deployer.address,
    contracts: {
      bloomFilter: bloomFilterAddress,
      revocationRegistry: revocationRegistryAddress,
      validatorConsensus: validatorConsensusAddress,
      certificateHashRegistry: certificateRegistryAddress,
    },
    timestamp: new Date().toISOString(),
  };

  const deploymentDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentDir,
    `bc-cvs-deployment.${network.chainId}.json`
  );
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentData, null, 2));
  console.log("💾 Deployment data saved to:", deploymentFile);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
