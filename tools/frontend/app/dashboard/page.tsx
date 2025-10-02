'use client';

import { useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WalletConnectButton } from '@/components/shared/wallet-connect-button';
import { useIdentity } from '@/hooks/useIdentity';
import { useTrustScoreHistory } from '@/hooks/useTrustScore';
import { circuitFiles, deployedNetwork, contracts, zkVerifiers, resolveCircuitKey } from '@/lib/contracts';
import { env } from '@/lib/env';
import { deploymentConfig } from '@/lib/deployment';
import { resolveIpfsUri } from '@/lib/ipfs';
import { IdentityStatus } from '@/types/identity';
import { IdentityActionsCard } from './_components/identity-actions';
import { VerificationActionsCard } from './_components/verification-actions';
import { Check, Copy, Server } from 'lucide-react';
import { useState } from 'react';

const truncateAddress = (address?: string) => {
    if (!address) return '0x0';
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
};

type AddressItem = {
    label: string;
    value?: string;
    description?: string;
};

type VerifierItem = {
    id: string;
    label: string;
    value?: string;
};

function AddressRow({ item }: { item: AddressItem }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        if (!item.value) return;
        try {
            await navigator.clipboard.writeText(item.value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1_500);
        } catch (error) {
            console.warn('Unable to copy value to clipboard', error);
        }
    }, [item.value]);

    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border bg-background px-4 py-3">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <p className="font-mono text-sm">{item.value ?? 'Not configured'}</p>
                {item.description ? <p className="text-xs text-muted-foreground">{item.description}</p> : null}
            </div>
            <Button variant="outline" size="icon" onClick={handleCopy} disabled={!item.value} aria-label={`Copy ${item.label} address`}>
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>
        </div>
    );
}

const statusText: Record<IdentityStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    [IdentityStatus.Pending]: { label: 'Pending', variant: 'secondary' },
    [IdentityStatus.Active]: { label: 'Active', variant: 'default' },
    [IdentityStatus.Suspended]: { label: 'Suspended', variant: 'destructive' },
    [IdentityStatus.Revoked]: { label: 'Revoked', variant: 'destructive' }
};

function IdentityStatusBadge({ status }: { status: IdentityStatus }) {
    const entry = statusText[status];
    return <Badge variant={entry.variant}>{entry.label}</Badge>;
}

export default function DashboardPage() {
    const rpcUrl = env.NEXT_PUBLIC_RPC_URL ?? '';
    const { identity, trustScore, isLoading: identityLoading } = useIdentity();
    const { data: trustHistory } = useTrustScoreHistory(identity?.id);

    const verifierItems: VerifierItem[] = Object.entries(zkVerifiers).map(([key, value]) => ({
        id: key,
        label: key.replace(/_/g, ' ').toUpperCase(),
        value
    }));

    const coreContracts: AddressItem[] = [
        {
            label: 'IdentityRegistry',
            value: contracts.identityRegistry,
            description: 'Primary registry storing user identities and metadata.'
        },
        {
            label: 'TrustScore',
            value: contracts.trustScore,
            description: 'Reputation and scoring engine aggregated across verifications.'
        },
        {
            label: 'VerificationManager',
            value: contracts.verificationManager,
            description: 'Central module orchestrating verification workflows.'
        },
        {
            label: 'VerificationLogger',
            value: contracts.verificationLogger,
            description: 'Event log that tracks verification lifecycle changes.'
        }
    ];

    const moduleContracts: AddressItem[] = [
        {
            label: 'OrganizationManager',
            value: contracts.organizationManager,
            description: 'Handles issuer onboarding and organization governance.'
        },
        {
            label: 'ZKProofManager',
            value: contracts.zkProofManager,
            description: 'Registers and manages zero-knowledge proof templates.'
        }
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-semibold">Network wiring overview</h1>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        Contracts, verifiers, and infrastructure endpoints are sourced automatically from the latest
                        Sepolia deployment artifact and mirrored environment variables.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <WalletConnectButton />
                    <Badge className="flex items-center gap-2 text-sm">
                        <Server className="h-4 w-4" />
                        {deployedNetwork.name} · Chain ID {deployedNetwork.chainId}
                    </Badge>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Your identity snapshot</CardTitle>
                    <CardDescription>Resolved automatically from the on-chain registry using your connected wallet.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Identity ID</p>
                        <p className="font-mono text-sm">{identity?.id ?? 'Not registered'}</p>
                        <p className="text-xs text-muted-foreground">Owner: {identity?.owner ?? '—'}</p>
                        <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">Status</p>
                            {identity ? <IdentityStatusBadge status={identity.status} /> : <Badge variant="secondary">Unknown</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">Metadata: {identity?.metadataURI ? resolveIpfsUri(identity.metadataURI) : 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Trust score</p>
                        <p className="text-3xl font-bold">{identityLoading ? '—' : trustScore}</p>
                        <div className="space-y-1 text-xs text-muted-foreground">
                            <p>Recent changes:</p>
                            {trustHistory && trustHistory.length > 0 ? (
                                trustHistory.slice(0, 3).map((event) => (
                                    <p key={`${event.transactionHash}-${event.timestamp}`}>
                                        • Δ {event.delta.toString()} → {event.newScore.toString()} at{' '}
                                        {new Date(event.timestamp * 1000).toLocaleString()}
                                    </p>
                                ))
                            ) : (
                                <p>No historical updates for this identity.</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <IdentityActionsCard />

            <Card>
                <CardHeader>
                    <CardTitle>Wallet connectivity</CardTitle>
                    <CardDescription>
                        Connect with browser wallets or Safe smart accounts to execute transactions from this
                        dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                        The connect button now supports{' '}
                        <span className="font-medium text-foreground">Safe smart wallets</span> alongside the usual
                        MetaMask, WalletConnect, Coinbase, and injected options.
                    </p>
                    <ul className="list-disc space-y-1 pl-5">
                        <li>Open the Safe app in the same browser tab and click connect to load your safe.</li>
                        <li>
                            Once connected, all actions on this page use the selected signer, including identity and
                            verification mutations.
                        </li>
                        <li>
                            Keep your RPC and project ID environment variables configured to ensure signatures hit the
                            intended network.
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <VerificationActionsCard />

            <Card>
                <CardHeader>
                    <CardTitle>RPC & Infrastructure</CardTitle>
                    <CardDescription>These settings power read/write calls within the dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border bg-background p-4">
                        <p className="text-sm font-medium text-muted-foreground">RPC Endpoint</p>
                        <p className="truncate font-mono text-sm" title={rpcUrl}>
                            {rpcUrl || 'Not configured'}
                        </p>
                    </div>
                    <div className="rounded-lg border bg-background p-4">
                        <p className="text-sm font-medium text-muted-foreground">Circuit bundle path</p>
                        <p className="font-mono text-sm">{env.NEXT_PUBLIC_ZK_CIRCUITS_BASE_PATH}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Local artifacts mapped:{' '}
                            <span className="font-semibold">{Object.keys(circuitFiles).length}</span>
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Core contracts</CardTitle>
                    <CardDescription>Addresses critical to identity lifecycle operations.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {coreContracts.map((item) => (
                        <AddressRow key={item.label} item={item} />
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Module & governance contracts</CardTitle>
                    <CardDescription>Optional modules wired into this deployment.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {moduleContracts.map((item) => (
                        <AddressRow key={item.label} item={item} />
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Groth16 verifiers</CardTitle>
                    <CardDescription>Active circuits mirrored from the on-chain verifier registry.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    {verifierItems.length === 0 ? (
                        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                            No verifiers detected. Ensure the deployment artifact exposes zk.verifiers entries.
                        </div>
                    ) : (
                        verifierItems.map((item) => {
                            const circuitKey = resolveCircuitKey(item.id);
                            const circuitEntry = circuitFiles[circuitKey];
                            return (
                                <div key={item.id} className="flex flex-col gap-2 rounded-lg border bg-background p-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                                        <p className="font-mono text-sm">{item.value ?? 'Not configured'}</p>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        <p>Alias: {truncateAddress(item.value)}</p>
                                        <p>
                                            Circuit files:{' '}
                                            {circuitEntry ? (
                                                <span className="text-emerald-500">available</span>
                                            ) : (
                                                <span className="text-destructive">missing</span>
                                            )}
                                        </p>
                                        {circuitEntry ? (
                                            <div className="mt-1 space-y-0.5 font-mono">
                                                <p>wasm: {circuitEntry.wasm}</p>
                                                <p>zkey: {circuitEntry.zkey}</p>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-4 text-xs text-muted-foreground sm:grid-cols-2">
                <div>
                    <p className="font-semibold">Deployment metadata</p>
                    <p>Deployer: {deploymentConfig.deployer?.address ?? 'Unknown'}</p>
                    <p>
                        Generated:{' '}
                        {deploymentConfig.meta?.generatedAt
                            ? new Date(deploymentConfig.meta.generatedAt * 1000).toLocaleString()
                            : 'No timestamp'}
                    </p>
                </div>
                <div>
                    <p className="font-semibold">Helpful tips</p>
                    <ul className="list-disc pl-5">
                        <li>Use the sidebar to explore verifications, organizations, and ZK workflows.</li>
                        <li>Copy addresses above to configure external services or block explorers.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
