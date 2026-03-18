import { createPublicClient, createWalletClient, http, parseAccount } from "viem";
import { sepolia } from "viem/chains";

const rpcUrl = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const registryAddress = process.env.NEXT_PUBLIC_CERTIFICATE_HASH_REGISTRY;
const issuerAddress = process.env.ISSUER_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

if (!registryAddress || registryAddress === "0x") {
  throw new Error("Missing NEXT_PUBLIC_CERTIFICATE_HASH_REGISTRY in environment.");
}

if (!issuerAddress || !issuerAddress.startsWith("0x") || issuerAddress.length !== 42) {
  throw new Error("Missing or invalid ISSUER_ADDRESS.");
}

if (!privateKey || !privateKey.startsWith("0x") || privateKey.length !== 66) {
  throw new Error("Missing or invalid PRIVATE_KEY. Expected 0x-prefixed 32-byte key.");
}

const abi = [
  {
    name: "isAuthorizedIssuer",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "issuer", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "authorizeIssuer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "issuer", type: "address" }],
    outputs: [],
  },
];

const account = parseAccount(privateKey);
const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(rpcUrl),
});

const walletClient = createWalletClient({
  account,
  chain: sepolia,
  transport: http(rpcUrl),
});

console.log("Authorizing issuer on Sepolia...");
console.log("Admin:", account.address);
console.log("Registry:", registryAddress);
console.log("Issuer:", issuerAddress);

const alreadyAuthorized = await publicClient.readContract({
  address: registryAddress,
  abi,
  functionName: "isAuthorizedIssuer",
  args: [issuerAddress],
});

if (alreadyAuthorized) {
  console.log("Issuer is already authorized. Nothing to do.");
  process.exit(0);
}

const txHash = await walletClient.writeContract({
  address: registryAddress,
  abi,
  functionName: "authorizeIssuer",
  args: [issuerAddress],
  account,
  chain: sepolia,
});

console.log("Tx submitted:", txHash);

const receipt = await publicClient.waitForTransactionReceipt({
  hash: txHash,
});

console.log("Tx confirmed in block:", receipt.blockNumber.toString());
console.log("Success: issuer is now authorized on-chain.");
