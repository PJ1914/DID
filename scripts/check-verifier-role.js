const hre = require("hardhat");

async function main() {
  console.log("==============================================");
  console.log("Check Verifier Role");
  console.log("==============================================");

  // The verifier account to check
  const verifierAddress = hre.ethers.getAddress("0x8fc61434cd4278602b23e15f1ee77c15a368d41c");
  
  // Get contract address
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId.toString();
  
  const registryAddresses = {
    "1337": "0xD3749f0a65DA86AeE65245E07D13fe912F1cF182",
    "11155111": "0x6D2Fc93f04D90774CfBF028EBf21e0Ba99DCB096"
  };
  
  const registryAddress = registryAddresses[chainId];
  
  console.log("Verifier Account:", verifierAddress);
  console.log("Registry Address:", registryAddress);
  console.log("Network:", chainId === "11155111" ? "Sepolia" : "Ganache");
  console.log("");

  // Get contract instance
  const CertificateHashRegistry = await hre.ethers.getContractFactory("CertificateHashRegistry");
  const registry = CertificateHashRegistry.attach(registryAddress);

  // Compute VERIFIER role hash
  const VERIFIER = hre.ethers.id("VERIFIER");

  // Check role status
  const hasRole = await registry.hasRole(VERIFIER, verifierAddress);
  
  console.log("✅ Has VERIFIER role:", hasRole);
  
  if (hasRole) {
    console.log("");
    console.log("🎉 SUCCESS! The verifier role is now assigned.");
    console.log("Refresh your browser and you should see verifier access.");
  } else {
    console.log("");
    console.log("⚠️  Role not yet assigned. Transaction may still be pending.");
    console.log("Wait a few seconds and run this script again.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
