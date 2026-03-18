const hre = require("hardhat");

async function main() {
  const certificateHash = "0xab6401ab92087900224b0ca696d4509a50cfd957f606954057f0664bf2bdef04";
  
  const registryAddress = process.env.NETWORK === "ganache"
    ? "0xD37490b6981BB1F024Ae1C678A6A0E6b4e49f182"
    : "0x6D2Fc93f04D90774CfBF028EBf21e0Ba99DCB096"; // Sepolia
  
  console.log(`\n🔍 Checking certificate: ${certificateHash}`);
  console.log(`📍 Registry: ${registryAddress}`);
  console.log(`🌐 Network: ${hre.network.name} (${(await hre.ethers.provider.getNetwork()).chainId})`);
  
  const registry = await hre.ethers.getContractAt(
    "CertificateHashRegistry",
    registryAddress
  );
  
  try {
    const cert = await registry.getCertificate(certificateHash);
    
    console.log(`\n✅ Certificate EXISTS:`);
    console.log(`   Issuer: ${cert.issuer}`);
    console.log(`   Holder: ${cert.holder}`);
    console.log(`   Issue Date: ${new Date(Number(cert.issueDate) * 1000).toLocaleString()}`);
    console.log(`   Metadata: ${cert.metadata}`);
    console.log(`   Valid: ${cert.isValid}`);
    console.log(`\n⚠️  Cannot issue again - certificate already exists!`);
    console.log(`💡 Solution: Upload a DIFFERENT file to get a new hash\n`);
  } catch (error) {
    if (error.message.includes("CertificateNotFound")) {
      console.log(`\n✅ Certificate does NOT exist - safe to issue`);
      console.log(`⚠️  But transaction still failing - check other requirements:\n`);
      console.log(`   1. Issuer authorized? Run: npx hardhat run scripts/authorize-issuer.js --network sepolia`);
      console.log(`   2. Valid holder address? Check it's not zero address`);
      console.log(`   3. Valid signature format? Check RSA signature is correct\n`);
    } else {
      console.log(`\n❌ Error: ${error.message}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
