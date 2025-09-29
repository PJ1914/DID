import { useEffect, useMemo, useState } from "react";
import type { BrowserProvider, JsonRpcProvider } from "ethers";
import WalletConnector from "./components/WalletConnector";
import ContractCard from "./components/ContractCard";
import IdentityLookup from "./components/IdentityLookup";
import TrustScoreViewer from "./components/TrustScoreViewer";
import { createReadProvider } from "./lib/ethersProvider";
import { ensureNetwork, fetchDeploymentConfig, type DeploymentConfig } from "./lib/contracts";

const App = () => {
    const [deployment, setDeployment] = useState<DeploymentConfig | null>(null);
    const [readProvider, setReadProvider] = useState<JsonRpcProvider | null>(null);
    const [browserProvider, setBrowserProvider] = useState<BrowserProvider | null>(null);
    const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [identityId, setIdentityId] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                setError(null);
                const config = await fetchDeploymentConfig();
                const provider = createReadProvider();
                await ensureNetwork(provider, config.network.chainId);
                setDeployment(config);
                setReadProvider(provider);
            } catch (err) {
                const message = err instanceof Error ? err.message : "Failed to initialise app";
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    const onWalletConnected = (provider: BrowserProvider, account: string) => {
        setBrowserProvider(provider);
        setConnectedAccount(account);
    };

    const zkContracts = useMemo(() => {
        if (!deployment) return [];
        const entries = Object.entries(deployment.zk.verifiers);
        return entries.map(([key, address]) => ({
            title: key.replace(/_/g, " "),
            address
        }));
    }, [deployment]);

    if (loading) {
        return (
            <main>
                <h1>DID Control Center</h1>
                <p>Loading deployment configuration…</p>
            </main>
        );
    }

    if (error || !deployment || !readProvider) {
        return (
            <main>
                <h1>DID Control Center</h1>
                <div className="alert error">{error ?? "Missing deployment configuration"}</div>
            </main>
        );
    }

    return (
        <main>
            <header style={{ marginBottom: "2rem" }}>
                <h1>DID Control Center</h1>
                <p className="small">
                    Network: {deployment.network.name} (chainId {deployment.network.chainId})
                </p>
            </header>

            <WalletConnector
                expectedChainId={deployment.network.chainId}
                connectedAccount={connectedAccount}
                onConnected={onWalletConnected}
            />

            <section>
                <h2>Core contracts</h2>
                <div className="grid">
                    <ContractCard title="Identity Registry" address={deployment.core.userIdentityRegistry} />
                    <ContractCard title="Trust Score" address={deployment.core.trustScore} />
                    <ContractCard title="Verification Logger" address={deployment.core.verificationLogger} />
                    <ContractCard title="Guardian Manager" address={deployment.identity.guardianManager} />
                </div>
            </section>

            <section>
                <h2>ZK stack</h2>
                <div className="grid">
                    <ContractCard title="ZK Proof Manager" address={deployment.zk.manager} />
                    {zkContracts.map((contract) => (
                        <ContractCard key={contract.address} title={contract.title} address={contract.address} />
                    ))}
                </div>
            </section>

            <IdentityLookup
                readProvider={readProvider}
                registryAddress={deployment.core.userIdentityRegistry}
                onIdentityResolved={setIdentityId}
            />

            <TrustScoreViewer
                readProvider={readProvider}
                browserProvider={browserProvider}
                trustScoreAddress={deployment.core.trustScore}
                identityId={identityId}
            />
        </main>
    );
};

export default App;
