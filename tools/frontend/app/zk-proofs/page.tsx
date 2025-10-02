'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WalletConnectButton } from '@/components/shared/wallet-connect-button';
import { useZkProofs } from '@/hooks/useZkProofs';
import { contracts, zkVerifiers } from '@/lib/contracts';
import { env } from '@/lib/env';
import { Loader2, RefreshCcw, ShieldCheck } from 'lucide-react';

export default function ZkProofsPage() {
    const { proofTypes, isLoading, refetchProofTypes } = useZkProofs();

    const handleRefresh = useCallback(() => {
        void refetchProofTypes();
    }, [refetchProofTypes]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold">Zero-knowledge proofs</h1>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        Generate Groth16 proofs locally and submit them to the on-chain proof manager. Circuits are
                        served from <span className="font-mono">{env.NEXT_PUBLIC_ZK_CIRCUITS_BASE_PATH}</span> and
                        anchored to the verifier registry.
                    </p>
                </div>
                <WalletConnectButton />
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle>Registered proof templates</CardTitle>
                        <CardDescription>
                            Loaded from the on-chain proof manager at <span className="font-mono">{contracts.zkProofManager}</span>.
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="gap-2">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                        Refresh
                    </Button>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    {isLoading && proofTypes.length === 0 ? (
                        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                            Loading proof templates…
                        </div>
                    ) : null}

                    {!isLoading && proofTypes.length === 0 ? (
                        <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                            No proof templates found. Use the contract admin flow to register verifiers.
                        </div>
                    ) : null}

                    {proofTypes.map((proof) => (
                        <div key={proof.id} className="flex flex-col gap-2 rounded-lg border bg-background p-4">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold">{proof.name}</p>
                                <Badge variant={proof.active ? 'default' : 'secondary'}>
                                    {proof.active ? 'Active' : 'Disabled'}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Verifier: {proof.verifier}</p>
                            <p className="text-xs text-muted-foreground">
                                Circuit folder: <span className="font-mono">{proof.name.toLowerCase()}</span>
                            </p>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Local circuit availability
                    </CardTitle>
                    <CardDescription>
                        Mirrors the verifier configuration from <span className="font-mono">deployment.json</span>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {Object.entries(zkVerifiers).map(([id, address]) => (
                        <div key={id} className="rounded-lg border bg-background p-3">
                            <p className="text-xs uppercase text-muted-foreground">{id.replace(/_/g, ' ')}</p>
                            <p className="font-mono text-sm">{address ?? 'Not configured'}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
