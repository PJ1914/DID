"use client";

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useIdentity } from '@/hooks/useIdentity';
import { useVerifications } from '@/hooks/useVerifications';
import { VerificationStatus } from '@/types/verification';

const recordSchema = z.object({
    identityId: z.string().min(2, 'Identity ID is required'),
    templateId: z.string().min(2, 'Template ID is required'),
    metadataJson: z.string().min(2, 'Metadata payload is required'),
    expiresAt: z.string().optional()
});

type RecordFormValues = z.infer<typeof recordSchema>;

const statusSchema = z.object({
    verificationId: z.string().min(2, 'Enter a verification ID'),
    status: z.nativeEnum(VerificationStatus)
});

type StatusFormValues = z.infer<typeof statusSchema>;

const statusLabels: Record<VerificationStatus, string> = {
    [VerificationStatus.Pending]: 'Pending',
    [VerificationStatus.Approved]: 'Approved',
    [VerificationStatus.Rejected]: 'Rejected',
    [VerificationStatus.Revoked]: 'Revoked'
};

const parseMetadata = (json: string) => {
    try {
        const parsed = JSON.parse(json);
        if (typeof parsed !== 'object' || parsed === null) {
            throw new Error('Metadata JSON must be an object');
        }
        return parsed as Record<string, unknown>;
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Unable to parse metadata JSON');
    }
};

const toExpiryTimestamp = (value?: string) => {
    if (!value) return Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days default
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new Error('Expiration date is invalid');
    }
    return Math.floor(date.getTime() / 1000);
};

export function VerificationActionsCard() {
    const { identity } = useIdentity();
    const { recordVerification, setVerificationStatus } = useVerifications(identity?.id);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const recordForm = useForm<RecordFormValues>({
        resolver: zodResolver(recordSchema),
        defaultValues: {
            identityId: identity?.id ?? '',
            templateId: '',
            metadataJson: '',
            expiresAt: ''
        }
    });

    const statusForm = useForm<StatusFormValues>({
        resolver: zodResolver(statusSchema),
        defaultValues: {
            verificationId: '',
            status: VerificationStatus.Pending
        }
    });

    const statusOptions = useMemo(
        () =>
            Object.entries(statusLabels).map(([value, label]) => ({
                value: Number(value) as VerificationStatus,
                label
            })),
        []
    );

    const handleRecordSubmit = recordForm.handleSubmit(async (values) => {
        setFeedback(null);
        setError(null);
        try {
            const metadata = parseMetadata(values.metadataJson);
            const expiresAt = toExpiryTimestamp(values.expiresAt);
            await recordVerification({
                identityId: values.identityId,
                templateId: values.templateId,
                metadata,
                expiresAt
            });
            setFeedback('Verification record submitted. Waiting for confirmation…');
            recordForm.reset({
                identityId: identity?.id ?? '',
                templateId: '',
                metadataJson: '',
                expiresAt: ''
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to submit verification';
            setError(message);
        }
    });

    const handleStatusSubmit = statusForm.handleSubmit(async (values) => {
        setFeedback(null);
        setError(null);
        try {
            await setVerificationStatus({
                verificationId: values.verificationId,
                status: values.status
            });
            setFeedback('Verification status update submitted. Waiting for confirmation…');
            statusForm.reset({ verificationId: '', status: VerificationStatus.Pending });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update verification status';
            setError(message);
        }
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Verification manager</CardTitle>
                <CardDescription>
                    Record new verification entries or adjust their status using your connected signer.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Form {...recordForm}>
                    <form className="space-y-4" onSubmit={handleRecordSubmit}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={recordForm.control}
                                name="identityId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Identity ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0xidentity" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Defaults to your connected identity if available.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={recordForm.control}
                                name="templateId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Template ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0xtemplate" {...field} />
                                        </FormControl>
                                        <FormDescription>Reference a registered verification template ID.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={recordForm.control}
                            name="metadataJson"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Evidence metadata (JSON)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='{ "issuer": "Example Org", "notes": "Manual approval" }'
                                            rows={5}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        JSON payload will be uploaded to IPFS and linked to the verification entry.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={recordForm.control}
                            name="expiresAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Expiry (optional)</FormLabel>
                                    <FormControl>
                                        <Input type="datetime-local" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Leave empty to default to 30 days from now.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full sm:w-auto">
                            Record verification
                        </Button>
                    </form>
                </Form>

                <div className="border-t pt-4">
                    <p className="mb-3 text-sm font-medium text-muted-foreground">Update verification status</p>
                    <Form {...statusForm}>
                        <form className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end" onSubmit={handleStatusSubmit}>
                            <FormField
                                control={statusForm.control}
                                name="verificationId"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-1">
                                        <FormLabel>Verification ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="0xverification" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={statusForm.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <FormControl>
                                            <select
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                value={field.value}
                                                onChange={(event) => field.onChange(Number(event.target.value))}
                                            >
                                                {statusOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" variant="secondary">
                                Set status
                            </Button>
                        </form>
                    </Form>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Requires the caller to hold verifier permissions or elevated roles as configured on-chain.
                    </p>
                </div>
            </CardContent>
            {(feedback || error) && (
                <CardFooter>
                    <p className={`text-sm ${error ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {error ?? feedback}
                    </p>
                </CardFooter>
            )}
        </Card>
    );
}
