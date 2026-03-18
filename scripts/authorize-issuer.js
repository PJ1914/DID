const hre = require("hardhat");

async function main() {
  console.log("==============================================");
  console.log("Authorize Certificate Issuer");
  console.log("==============================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Admin/Deployer:", deployer.address);

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId.toString();
  console.log("Network Chain ID:", chainId);
  console.log("");

  // Registry addresses per network
  const registryAddresses = {
    "1337": "0xD3749f0a65DA86AeE65245E07D13fe912F1cF182",  // Ganache
    "11155111": "0x6D2Fc93f04D90774CfBF028EBf21e0Ba99DCB096"  // Sepolia
  };
  
  const registryAddress = registryAddresses[chainId];
  if (!registryAddress) {
    throw new Error(`No registry address configured for chain ID ${chainId}`);
  }

  console.log("Registry Address:", registryAddress);
  console.log("Authorizing:", deployer.address);
  console.log("");

  // Get contract instance
  const CertificateHashRegistry = await hre.ethers.getContractFactory("CertificateHashRegistry");
  const registry = CertificateHashRegistry.attach(registryAddress);

  // Check if already authorized
  console.log("Checking authorization status...");
  const isAuthorized = await registry.isAuthorizedIssuer(deployer.address);
  console.log("Is authorized:", isAuthorized);
  console.log("");

  if (isAuthorized) {
    console.log("✅ Already authorized!");
  } else {
    console.log("Calling authorizeIssuer...");
    const tx = await registry.authorizeIssuer(deployer.address);
    console.log("Transaction sent:", tx.hash);
    
    console.log("Waiting for confirmation...");
    await tx.wait();
    
    console.log("✅ Issuer authorized!");
  }

  console.log("");
  console.log("==============================================");
  console.log("Done! You can now issue certificates.");
  console.log("==============================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
