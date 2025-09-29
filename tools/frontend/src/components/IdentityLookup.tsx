import { useState, type ChangeEvent } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import { identityRegistryAbi, formatAddress } from "../lib/contracts";

interface IdentityLookupProps {
    readProvider: JsonRpcProvider;
    registryAddress: string;
    onIdentityResolved?: (identityId: string | null) => void;
}

interface IdentityProfileView {
    identityId: string;
    owner: string;
    metadataURI: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    trustScore: string;
}

const STATUS_MAP = ["Pending", "Active", "Suspended", "Revoked"];

const IdentityLookup = ({ readProvider, registryAddress, onIdentityResolved }: IdentityLookupProps) => {
    const [addressInput, setAddressInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [profile, setProfile] = useState<IdentityProfileView | null>(null);

    const lookup = async () => {
        setLoading(true);
        setError(null);
        setProfile(null);
        onIdentityResolved?.(null);

        try {
            const address = addressInput.trim();
            if (!address) {
                throw new Error("Enter an address to query");
            }

            const registry = new Contract(registryAddress, identityRegistryAbi, readProvider);
            const identityId: string = await registry.resolveIdentity(address);
            const identity = await registry.getIdentity(identityId);

            const statusIndex = Number(identity.status);
            const status = STATUS_MAP[statusIndex] ?? `Unknown (${statusIndex})`;

            setProfile({
                identityId,
                owner: identity.owner,
                metadataURI: identity.metadataURI,
                status,
                createdAt: new Date(Number(identity.createdAt) * 1000).toISOString(),
                updatedAt: new Date(Number(identity.updatedAt) * 1000).toISOString(),
                trustScore: identity.trustScore.toString()
            });
            onIdentityResolved?.(identityId);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Lookup failed";
            setError(message);
            onIdentityResolved?.(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <h2>Identity registry lookup</h2>
            <label htmlFor="identity-address">Wallet address</label>
            <input
                id="identity-address"
                placeholder="0x..."
                value={addressInput}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setAddressInput(event.target.value)}
            />
            <button type="button" onClick={lookup} disabled={loading}>
                {loading ? "Searching…" : "Fetch identity"}
            </button>

            {profile && (
                <div className="card" style={{ marginTop: "1rem" }}>
                    <h3>Identity profile</h3>
                    <p><strong>Identity ID:</strong> {profile.identityId}</p>
                    <p><strong>Owner:</strong> {formatAddress(profile.owner)}</p>
                    <p><strong>Status:</strong> {profile.status}</p>
                    <p><strong>Trust score:</strong> {profile.trustScore}</p>
                    {profile.metadataURI && (
                        <p>
                            <strong>Metadata URI:</strong> {profile.metadataURI}
                        </p>
                    )}
                    <p className="small">Created: {profile.createdAt}</p>
                    <p className="small">Updated: {profile.updatedAt}</p>
                </div>
            )}

            {error && <div className="alert error">{error}</div>}
        </section>
    );
};

export default IdentityLookup;
