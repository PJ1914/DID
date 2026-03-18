const hre = require("hardhat");

async function main() {
  console.log("==============================================");
  console.log("Grant Certificate Issuer Role");
  console.log("==============================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer/Admin:", deployer.address);

  // The account you want to grant issuer role to (client laptop wallet)
  const newIssuer = hre.ethers.getAddress("0x016e0547c218a4f0749A8B5e1383e80929B40166");
  
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
  
  console.log("New Issuer Account:", newIssuer);
  console.log("Registry Address:", registryAddress);
  console.log("");

  // Get contract instance
  const CertificateHashRegistry = await hre.ethers.getContractFactory("CertificateHashRegistry");
  const registry = CertificateHashRegistry.attach(registryAddress);

  // Compute CERTIFICATE_ISSUER role hash
  const CERTIFICATE_ISSUER = hre.ethers.id("CERTIFICATE_ISSUER");
  console.log("CERTIFICATE_ISSUER role hash:", CERTIFICATE_ISSUER);
  console.log("");

  // Check current authorization status
  console.log("Checking if account is already authorized...");
  const isAuthorized = await registry.isAuthorizedIssuer(newIssuer);
  const hasRole = await registry.hasRole(CERTIFICATE_ISSUER, newIssuer);
  console.log("isAuthorizedIssuer:", isAuthorized);
  console.log("hasRole(CERTIFICATE_ISSUER):", hasRole);
  console.log("");

  if (isAuthorized && hasRole) {
    console.log("✅ Account is already fully authorized as a Certificate Issuer!");
  } else if (!isAuthorized) {
    // authorizeIssuer sets the mapping AND grants the role internally
    console.log("Calling authorizeIssuer() — this sets the authorized mapping AND grants the role...");
    const tx = await registry.authorizeIssuer(newIssuer);
    await tx.wait();
    console.log("✅ Authorization granted! Transaction:", tx.hash);
  } else {
    // Has authorized mapping but somehow missing role — grant role directly
    console.log("Granting CERTIFICATE_ISSUER role...");
    const tx = await registry.grantRole(CERTIFICATE_ISSUER, newIssuer);
    await tx.wait();
    console.log("✅ Role granted! Transaction:", tx.hash);
  }

  console.log("");
  console.log("==============================================");
  console.log("Done! Account", newIssuer);
  console.log("can now issue certificates!");
  console.log("==============================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
