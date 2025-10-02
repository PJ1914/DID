"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useIdentity } from '@/hooks/useIdentity';
import { IdentityStatus } from '@/types/identity';

const registerSchema = z.object({
    displayName: z
        .string()
        .max(140, 'Display name is too long')
        .optional(),
    email: z
        .string()
        .email('Enter a valid email address')
        .optional()
        .or(z.literal('')),
    metadataJson: z
        .string()
        .optional()
});

type RegisterFormValues = z.infer<typeof registerSchema>;

type StatusOption = {
    label: string;
    value: IdentityStatus;
};

const identityStatusOptions: StatusOption[] = [
    { label: 'Pending', value: IdentityStatus.Pending },
    { label: 'Active', value: IdentityStatus.Active },
    { label: 'Suspended', value: IdentityStatus.Suspended },
    { label: 'Revoked', value: IdentityStatus.Revoked }
];

const buildMetadataPayload = (values: RegisterFormValues) => {
    const base: Record<string, unknown> = {};
    if (values.displayName) base.displayName = values.displayName;
    if (values.email) base.email = values.email;

    if (values.metadataJson && values.metadataJson.trim().length > 0) {
        try {
            const parsed = JSON.parse(values.metadataJson);
            if (typeof parsed === 'object' && parsed !== null) {
                return { ...base, ...parsed };
            }
            throw new Error('JSON metadata must be an object');
        } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Unable to parse JSON metadata');
        }
    }

    if (Object.keys(base).length === 0) {
        throw new Error('Provide either form fields or JSON metadata');
    }

    return base;
};

export function IdentityActionsCard() {
    const { identity, registerIdentity, updateMetadata, setStatus } = useIdentity();
    const [feedback, setFeedback] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
    const [statusValue, setStatusValue] = useState<IdentityStatus>(IdentityStatus.Active);

    const registerForm = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            displayName: '',
            email: '',
            metadataJson: ''
        }
    });

    const handleSubmit = registerForm.handleSubmit(async (values) => {
        setFeedback(null);
        setError(null);
        try {
            const metadata = buildMetadataPayload(values);
            if (!identity) {
                await registerIdentity({ metadata });
                setFeedback('Identity registration submitted. Waiting for confirmation…');
            } else {
                await updateMetadata({ identityId: identity.id, metadata });
                setFeedback('Metadata update submitted. Waiting for confirmation…');
            }
            registerForm.reset();
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unexpected error processing metadata';
            setError(message);
        }
    });

    const handleStatusChange = async () => {
        if (!identity) return;
        setFeedback(null);
        setError(null);
        setIsSubmittingStatus(true);
        try {
            await setStatus({ identityId: identity.id, status: statusValue });
            setFeedback('Status update submitted. Waiting for confirmation…');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to submit status update';
            setError(message);
        } finally {
            setIsSubmittingStatus(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Identity actions</CardTitle>
                <CardDescription>
                    Register an identity, update metadata, or manage lifecycle status directly against the
                    on-chain registry.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Form {...registerForm}>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <FormField
                                control={registerForm.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Alice Onchain" {...field} />
                                        </FormControl>
                                        <FormDescription>Optional label saved within your identity metadata.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={registerForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="alice@example.com" {...field} />
                                        </FormControl>
                                        <FormDescription>Useful for off-chain notifications or references.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={registerForm.control}
                            name="metadataJson"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional metadata (JSON)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder='{ "twitter": "@alice", "avatar": "https://..." }'
                                            rows={6}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Merge any extra attributes by pasting a JSON object. Form values above are merged first.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full sm:w-auto">
                            {identity ? 'Update metadata' : 'Register identity'}
                        </Button>
                    </form>
                </Form>

                <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Lifecycle status</p>
                        <Badge variant="outline">{identity ? IdentityStatus[identity.status] : 'Not registered'}</Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                        <select
                            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={statusValue}
                            onChange={(event) => setStatusValue(Number(event.target.value) as IdentityStatus)}
                            disabled={!identity}
                        >
                            {identityStatusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleStatusChange}
                            disabled={!identity || isSubmittingStatus}
                        >
                            Update status
                        </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        Status changes require identity owner or operator permissions as enforced by the contract.
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
