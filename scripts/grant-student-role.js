const hre = require("hardhat");

async function main() {
  console.log("==============================================");
  console.log("Grant Certificate Holder (Student) Role");
  console.log("==============================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer/Admin:", deployer.address);

  // The student account you want to grant holder role to
  const studentAddress = "0xCBD0f2Ee8A6c74eF971858491B47aC1644CF83Ad";
  
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
  
  console.log("Student Account:", studentAddress);
  console.log("Registry Address:", registryAddress);
  console.log("Network:", chainId === "11155111" ? "Sepolia" : "Ganache");
  console.log("");

  // Get contract instance
  const CertificateHashRegistry = await hre.ethers.getContractFactory("CertificateHashRegistry");
  const registry = CertificateHashRegistry.attach(registryAddress);

  // Compute CERTIFICATE_HOLDER role hash
  const CERTIFICATE_HOLDER = hre.ethers.id("CERTIFICATE_HOLDER");
  console.log("CERTIFICATE_HOLDER role hash:", CERTIFICATE_HOLDER);
  console.log("");

  // Check current role status
  console.log("Checking if account already has role...");
  const hasRole = await registry.hasRole(CERTIFICATE_HOLDER, studentAddress);
  console.log("Has role:", hasRole);
  console.log("");

  if (hasRole) {
    console.log("✅ Account already has CERTIFICATE_HOLDER role!");
    console.log("Student can access the student portal at /bc-cvs/student");
  } else {
    console.log("Granting CERTIFICATE_HOLDER role...");
    
    // Use the grantHolderRole function (wrapper for student role)
    const tx = await registry.grantHolderRole(studentAddress);
    console.log("Transaction sent:", tx.hash);
    console.log("Waiting for confirmation...");
    
    await tx.wait();
    console.log("✅ Role granted successfully!");
    console.log("");
    
    // Verify the role was granted
    const hasRoleNow = await registry.hasRole(CERTIFICATE_HOLDER, studentAddress);
    console.log("Verification - Has role now:", hasRoleNow);
  }

  console.log("");
  console.log("==============================================");
  console.log("Done! Student", studentAddress);
  console.log("can now:");
  console.log("  - Access the student portal");
  console.log("  - View their certificates");
  console.log("  - Share certificates with verifiers");
  console.log("==============================================");
  console.log("");
  console.log("Next steps:");
  console.log("1. Refresh the frontend page");
  console.log("2. You should see student navigation and dashboard");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
