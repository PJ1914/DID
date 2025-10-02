'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ADMIN_ADDRESS } from '@/lib/addresses';
import { useTrustScore, useVerificationManager, useIdentityRegistry } from '@/hooks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, UserCheck, UserX, TrendingUp, TrendingDown, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import { Address } from 'viem';
import { VerificationLogViewer } from './VerificationLogViewer';

export function AdminDashboard() {
    const { address } = useAccount();
    const isAdmin = address?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

    const trustScore = useTrustScore();
    const verificationManager = useVerificationManager();
    const identityRegistry = useIdentityRegistry();

    // Trust Score Management State
    const [scoreAddress, setScoreAddress] = useState('');
    const [scoreAmount, setScoreAmount] = useState('');
    const [scoreReason, setScoreReason] = useState('');

    // Verification Management State
    const [verifyAddress, setVerifyAddress] = useState('');
    const [verificationType, setVerificationType] = useState('');
    const [newVerificationType, setNewVerificationType] = useState('');

    // Identity Management State
    const [identityAddress, setIdentityAddress] = useState('');

    if (!isAdmin) {
        return (
            <Alert variant="destructive">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                    Access denied. This dashboard is only accessible to the admin address: {ADMIN_ADDRESS}
                </AlertDescription>
            </Alert>
        );
    }

    const handleIncreaseScore = async () => {
        try {
            await trustScore.increaseScore(
                scoreAddress as Address,
                BigInt(scoreAmount),
                scoreReason
            );
            setScoreAddress('');
            setScoreAmount('');
            setScoreReason('');
        } catch (error) {
            console.error('Failed to increase score:', error);
        }
    };

    const handleDecreaseScore = async () => {
        try {
            await trustScore.decreaseScore(
                scoreAddress as Address,
                BigInt(scoreAmount),
                scoreReason
            );
            setScoreAddress('');
            setScoreAmount('');
            setScoreReason('');
        } catch (error) {
            console.error('Failed to decrease score:', error);
        }
    };

    const handleApproveVerification = async () => {
        try {
            await verificationManager.approveVerification(
                verifyAddress as Address,
                verificationType
            );
            setVerifyAddress('');
            setVerificationType('');
        } catch (error) {
            console.error('Failed to approve verification:', error);
        }
    };

    const handleRevokeVerification = async () => {
        try {
            await verificationManager.revokeVerification(
                verifyAddress as Address,
                verificationType
            );
            setVerifyAddress('');
            setVerificationType('');
        } catch (error) {
            console.error('Failed to revoke verification:', error);
        }
    };

    const handleAddVerificationType = async () => {
        try {
            await verificationManager.addVerificationType(newVerificationType);
            setNewVerificationType('');
        } catch (error) {
            console.error('Failed to add verification type:', error);
        }
    };

    const handleRevokeIdentity = async () => {
        try {
            await identityRegistry.revokeIdentity(identityAddress as Address);
            setIdentityAddress('');
        } catch (error) {
            console.error('Failed to revoke identity:', error);
        }
    };

    const handleReactivateIdentity = async () => {
        try {
            await identityRegistry.reactivateIdentity(identityAddress as Address);
            setIdentityAddress('');
        } catch (error) {
            console.error('Failed to reactivate identity:', error);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6" />
                        <div>
                            <CardTitle>Admin Dashboard</CardTitle>
                            <CardDescription>
                                Manage identities, verifications, and trust scores
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <Tabs defaultValue="verifications" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="verifications">Verifications</TabsTrigger>
                    <TabsTrigger value="trustscores">Trust Scores</TabsTrigger>
                    <TabsTrigger value="identities">Identities</TabsTrigger>
                    <TabsTrigger value="logs">Verification Logs</TabsTrigger>
                </TabsList>

                {/* Verification Management */}
                <TabsContent value="verifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Approve/Revoke Verifications</CardTitle>
                            <CardDescription>
                                Manually approve or revoke user verifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="verify-address">User Address</Label>
                                <Input
                                    id="verify-address"
                                    placeholder="0x..."
                                    value={verifyAddress}
                                    onChange={(e) => setVerifyAddress(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="verification-type">Verification Type</Label>
                                <Input
                                    id="verification-type"
                                    placeholder="e.g., email, phone, kyc"
                                    value={verificationType}
                                    onChange={(e) => setVerificationType(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleApproveVerification}
                                    disabled={!verifyAddress || !verificationType || verificationManager.isPending}
                                    className="flex-1"
                                >
                                    {verificationManager.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <UserCheck className="mr-2 h-4 w-4" />
                                    )}
                                    Approve
                                </Button>
                                <Button
                                    onClick={handleRevokeVerification}
                                    disabled={!verifyAddress || !verificationType || verificationManager.isPending}
                                    variant="destructive"
                                    className="flex-1"
                                >
                                    {verificationManager.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <UserX className="mr-2 h-4 w-4" />
                                    )}
                                    Revoke
                                </Button>
                            </div>
                            {verificationManager.isSuccess && (
                                <Alert>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertDescription>Verification updated successfully!</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Add Verification Type</CardTitle>
                            <CardDescription>
                                Add new verification types to the system
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-verification-type">New Type</Label>
                                <Input
                                    id="new-verification-type"
                                    placeholder="e.g., biometric, document"
                                    value={newVerificationType}
                                    onChange={(e) => setNewVerificationType(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={handleAddVerificationType}
                                disabled={!newVerificationType || verificationManager.isPending}
                                className="w-full"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Verification Type
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Trust Score Management */}
                <TabsContent value="trustscores" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Trust Scores</CardTitle>
                            <CardDescription>
                                Increase or decrease user trust scores with reason
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="score-address">User Address</Label>
                                <Input
                                    id="score-address"
                                    placeholder="0x..."
                                    value={scoreAddress}
                                    onChange={(e) => setScoreAddress(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="score-amount">Amount</Label>
                                <Input
                                    id="score-amount"
                                    type="number"
                                    placeholder="e.g., 10"
                                    value={scoreAmount}
                                    onChange={(e) => setScoreAmount(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="score-reason">Reason</Label>
                                <Textarea
                                    id="score-reason"
                                    placeholder="Explain why the score is being adjusted..."
                                    value={scoreReason}
                                    onChange={(e) => setScoreReason(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleIncreaseScore}
                                    disabled={!scoreAddress || !scoreAmount || !scoreReason || trustScore.isPending}
                                    className="flex-1"
                                >
                                    {trustScore.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                    )}
                                    Increase Score
                                </Button>
                                <Button
                                    onClick={handleDecreaseScore}
                                    disabled={!scoreAddress || !scoreAmount || !scoreReason || trustScore.isPending}
                                    variant="destructive"
                                    className="flex-1"
                                >
                                    {trustScore.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <TrendingDown className="mr-2 h-4 w-4" />
                                    )}
                                    Decrease Score
                                </Button>
                            </div>
                            {trustScore.isSuccess && (
                                <Alert>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertDescription>Trust score updated successfully!</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Identity Management */}
                <TabsContent value="identities" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Manage Identities</CardTitle>
                            <CardDescription>
                                Revoke or reactivate user identities
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="identity-address">User Address</Label>
                                <Input
                                    id="identity-address"
                                    placeholder="0x..."
                                    value={identityAddress}
                                    onChange={(e) => setIdentityAddress(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleRevokeIdentity}
                                    disabled={!identityAddress || identityRegistry.isPending}
                                    variant="destructive"
                                    className="flex-1"
                                >
                                    {identityRegistry.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <UserX className="mr-2 h-4 w-4" />
                                    )}
                                    Revoke Identity
                                </Button>
                                <Button
                                    onClick={handleReactivateIdentity}
                                    disabled={!identityAddress || identityRegistry.isPending}
                                    className="flex-1"
                                >
                                    {identityRegistry.isPending ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <UserCheck className="mr-2 h-4 w-4" />
                                    )}
                                    Reactivate Identity
                                </Button>
                            </div>
                            {identityRegistry.isSuccess && (
                                <Alert>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertDescription>Identity updated successfully!</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Verification Logs */}
                <TabsContent value="logs">
                    <VerificationLogViewer />
                </TabsContent>
            </Tabs>
        </div>
    );
}
