import { BrowserProvider, JsonRpcProvider, type Eip1193Provider } from "ethers";

declare global {
    interface Window {
        ethereum?: Eip1193Provider;
    }
}

export function createReadProvider(): JsonRpcProvider {
    const rpcUrl = import.meta.env.VITE_PUBLIC_RPC_URL;
    if (!rpcUrl) {
        throw new Error("VITE_PUBLIC_RPC_URL is not configured");
    }
    return new JsonRpcProvider(rpcUrl);
}

export async function connectBrowserWallet(): Promise<{
    provider: BrowserProvider;
    account: string;
    chainId: number;
}> {
    if (!window.ethereum) {
        throw new Error("No injected wallet found. Install MetaMask or another provider.");
    }

    const provider = new BrowserProvider(window.ethereum, "any");
    const accounts = await provider.send("eth_requestAccounts", []);
    if (!accounts || accounts.length === 0) {
        throw new Error("Wallet connection rejected or no accounts returned");
    }

    const network = await provider.getNetwork();
    return {
        provider,
        account: accounts[0],
        chainId: Number(network.chainId)
    };
}
