import { useState } from "react";
import type { BrowserProvider } from "ethers";
import { connectBrowserWallet } from "../lib/ethersProvider";

interface WalletConnectorProps {
    expectedChainId: number;
    connectedAccount: string | null;
    onConnected: (provider: BrowserProvider, account: string) => void;
}

const WalletConnector = ({ expectedChainId, connectedAccount, onConnected }: WalletConnectorProps) => {
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const connect = async () => {
        setLoading(true);
        setError(null);
        setStatus(null);

        try {
            const { provider, account, chainId } = await connectBrowserWallet();
            if (chainId !== expectedChainId) {
                setError(
                    `Connected wallet is on chain ${chainId}. Switch to ${expectedChainId} in your wallet and try again.`
                );
                setLoading(false);
                return;
            }

            setStatus(`Connected to ${account}`);
            onConnected(provider, account);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown connection error";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <h2>Wallet connection</h2>
            <p>
                Target network: <strong>{expectedChainId}</strong>
            </p>
            {connectedAccount ? (
                <p className="small">Active account: {connectedAccount}</p>
            ) : (
                <button type="button" onClick={connect} disabled={loading}>
                    {loading ? "Connecting…" : "Connect wallet"}
                </button>
            )}
            {status && <div className="alert success">{status}</div>}
            {error && <div className="alert error">{error}</div>}
        </section>
    );
};

export default WalletConnector;
