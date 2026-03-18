const hre = require("hardhat");

async function main() {
  console.log("==============================================");
  console.log("Grant Verifier Role");
  console.log("==============================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer/Admin:", deployer.address);

  // The verifier account you want to grant role to (properly checksummed)
  const verifierAddress = hre.ethers.getAddress("0x8fc61434cd4278602b23e15f1ee77c15a368d41c");
  
  // Your deployed contract addresses - auto-detect based on network
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId.toString();
  
  const registryAddresses = {
    "1337": "0xD3749f0a65DA86AeE65245E07D13fe912F1cF182",  // Ganache
    "11155111": "0x6D2Fc93f04D90774CfBF028EBf21e0Ba99DCB096"  // Sepolia
  };
  
  const registryAddress = registryAddresses[chainId];
  if (!registryAddress) {
    throw new Error(`No registry address configured for chain ID ${chainId}`);
  }
  
  console.log("Verifier Account:", verifierAddress);
  console.log("Registry Address:", registryAddress);
  console.log("Network:", chainId === "11155111" ? "Sepolia" : "Ganache");
  console.log("");

  // Get contract instance
  const CertificateHashRegistry = await hre.ethers.getContractFactory("CertificateHashRegistry");
  const registry = CertificateHashRegistry.attach(registryAddress);

  // Compute VERIFIER role hash
  const VERIFIER = hre.ethers.id("VERIFIER");
  console.log("VERIFIER role hash:", VERIFIER);
  console.log("");

  // Check current role status
  console.log("Checking if account already has role...");
  const hasRole = await registry.hasRole(VERIFIER, verifierAddress);
  console.log("Has role:", hasRole);
  console.log("");

  if (hasRole) {
    console.log("✅ Account already has VERIFIER role!");
    console.log("Verifier can access the verifier portal at /bc-cvs/verifier");
  } else {
    console.log("Granting VERIFIER role...");
    
    // Use the grantVerifierRole function
    const tx = await registry.grantVerifierRole(verifierAddress);
    console.log("Transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");
    
    await tx.wait();
    console.log("✅ Role granted successfully!");
    console.log("");
    
    // Verify the role was granted
    const hasRoleNow = await registry.hasRole(VERIFIER, verifierAddress);
    console.log("Verification - Has role now:", hasRoleNow);
  }

  console.log("");
  console.log("==============================================");
  console.log("Done! Verifier", verifierAddress);
  console.log("can now:");
  console.log("  - Access the verifier portal");
  console.log("  - Verify certificates");
  console.log("  - Perform bulk verification");
  console.log("==============================================");
  console.log("");
  console.log("Next steps:");
  console.log("1. Refresh the frontend page");
  console.log("2. You should see verifier navigation and dashboard");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
