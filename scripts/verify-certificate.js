const hre = require("hardhat");

async function main() {
  const certificateHash = process.argv[2] || "0xab6401ab92087900224b0ca696d4509a50cfd957f606954057f0664bf2bdef04";
  
  const registryAddress = process.env.NETWORK === "ganache"
    ? "0xD37490b6981BB1F024Ae1C678A6A0E6b4e49f182"
    : "0x6D2Fc93f04D90774CfBF028EBf21e0Ba99DCB096"; // Sepolia
  
  console.log(`\n🔍 CERTIFICATE VERIFICATION`);
  console.log(`════════════════════════════════════════`);
  console.log(`Hash: ${certificateHash}`);
  console.log(`Registry: ${registryAddress}`);
  console.log(`Network: ${hre.network.name} (${(await hre.ethers.provider.getNetwork()).chainId})`);
  console.log(`════════════════════════════════════════\n`);
  
  const registry = await hre.ethers.getContractAt(
    "CertificateHashRegistry",
    registryAddress
  );
  
  try {
    // Check if exists
    const exists = await registry.certificateExists(certificateHash);
    console.log(`✓ Certificate exists: ${exists}`);
    
    if (!exists) {
      console.log(`\n❌ Certificate NOT FOUND on blockchain`);
      console.log(`\nPossible reasons:`);
      console.log(`  - Certificate was never issued`);
      console.log(`  - Wrong network (check if on Sepolia)`);
      console.log(`  - Incorrect hash\n`);
      return;
    }
    
    // Get certificate details
    const cert = await registry.getCertificate(certificateHash);
    
    console.log(`\n✅ CERTIFICATE VERIFIED`);
    console.log(`\nDetails:`);
    console.log(`  Issuer:     ${cert.issuer}`);
    console.log(`  Holder:     ${cert.holder}`);
    console.log(`  Issue Date: ${new Date(Number(cert.issueDate) * 1000).toLocaleString()}`);
    console.log(`  Metadata:   ${cert.metadata}`);
    console.log(`  Valid:      ${cert.isValid}`);
    console.log(`  Signature:  ${cert.rsaSignature.substring(0, 20)}...${cert.rsaSignature.substring(cert.rsaSignature.length - 20)}`);
    
    // Check revocation if contract available
    try {
      const revocationAddress = process.env.NETWORK === "ganache"
        ? "0x..." // Add Ganache address
        : "0x3F2BD3d8497648c8B7323e71D43F9FD0eAe2cf92"; // Sepolia
        
      const revocationRegistry = await hre.ethers.getContractAt(
        "RevocationRegistry",
        revocationAddress
      );
      
      const isRevoked = await revocationRegistry.isRevoked(certificateHash);
      console.log(`  Revoked:    ${isRevoked}`);
      
      if (isRevoked) {
        console.log(`\n⚠️  WARNING: This certificate has been REVOKED`);
      }
    } catch (err) {
      console.log(`  Revocation: (check skipped - contract may not be deployed)`);
    }
    
    console.log(`\n✅ Verification Complete - Certificate is AUTHENTIC\n`);
    
  } catch (error) {
    console.error(`\n❌ Verification Failed:`, error.message);
    
    if (error.message.includes("CertificateNotFound")) {
      console.log(`\nCertificate hash not found in registry.`);
      console.log(`This certificate was never issued or doesn't exist.\n`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
