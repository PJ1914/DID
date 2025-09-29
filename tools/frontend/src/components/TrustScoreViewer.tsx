import { useEffect, useState } from "react";
import { Contract, BrowserProvider, JsonRpcProvider } from "ethers";
import { trustScoreAbi, formatAddress } from "../lib/contracts";

interface TrustScoreViewerProps {
    readProvider: JsonRpcProvider;
    browserProvider: BrowserProvider | null;
    trustScoreAddress: string;
    identityId: string | null;
}

const TrustScoreViewer = ({ readProvider, browserProvider, trustScoreAddress, identityId }: TrustScoreViewerProps) => {
    const [score, setScore] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [watching, setWatching] = useState(false);

    useEffect(() => {
        if (!identityId) {
            setScore(null);
            return;
        }

        const trustScore = new Contract(trustScoreAddress, trustScoreAbi, readProvider);

        const load = async () => {
            try {
                setError(null);
                const value = await trustScore.getScore(identityId);
                setScore(value.toString());
            } catch (err) {
                const message = err instanceof Error ? err.message : "Unable to fetch trust score";
                setError(message);
            }
        };

        load();

        let stopWatching = false;

        const setupWatcher = async () => {
            if (!browserProvider) return;

            try {
                const signer = await browserProvider.getSigner();
                const writableTrustScore = trustScore.connect(signer);
                setWatching(true);
                writableTrustScore.on("ScoreUpdated", (_identityId: string, newScore: bigint) => {
                    if (stopWatching) return;
                    if (_identityId.toLowerCase() === identityId.toLowerCase()) {
                        setScore(newScore.toString());
                    }
                });
            } catch (err) {
                console.warn("Unable to subscribe to ScoreUpdated", err);
            }
        };

        setupWatcher();

        return () => {
            stopWatching = true;
            trustScore.removeAllListeners();
            setWatching(false);
        };
    }, [identityId, trustScoreAddress, readProvider, browserProvider]);

    return (
        <section>
            <h2>Trust score</h2>
            <p>
                Contract: <strong>{formatAddress(trustScoreAddress)}</strong>
            </p>
            {identityId ? (
                <p className="small">Watching identity {identityId}</p>
            ) : (
                <p className="small">Enter an identity above to view trust score.</p>
            )}

            {score && (
                <div className="card">
                    <h3>Current score</h3>
                    <p className="large">{score}</p>
                    {watching && <p className="small">Listening for live updates…</p>}
                </div>
            )}

            {error && <div className="alert error">{error}</div>}
        </section>
    );
};

export default TrustScoreViewer;
