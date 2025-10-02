import { formatDistanceToNow, fromUnixTime } from 'date-fns';
import { IdentityStatus } from '@/types/identity';
import { VerificationStatus } from '@/types/verification';
import { OrganizationStatus } from '@/types/organization';

export const shortAddress = (address?: string | null, chars = 4) => {
    if (!address) return '—';
    return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
};

export const formatTimestamp = (timestamp?: number | null) => {
    if (!timestamp) return '—';
    return formatDistanceToNow(fromUnixTime(Number(timestamp)), { addSuffix: true });
};

export const identityStatusLabel: Record<IdentityStatus, string> = {
    [IdentityStatus.Pending]: 'Pending',
    [IdentityStatus.Active]: 'Active',
    [IdentityStatus.Suspended]: 'Suspended',
    [IdentityStatus.Revoked]: 'Revoked'
};

export const identityStatusBadge: Record<IdentityStatus, string> = {
    [IdentityStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    [IdentityStatus.Active]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
    [IdentityStatus.Suspended]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
    [IdentityStatus.Revoked]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
};

export const verificationStatusLabel: Record<VerificationStatus, string> = {
    [VerificationStatus.Pending]: 'Pending',
    [VerificationStatus.Approved]: 'Approved',
    [VerificationStatus.Rejected]: 'Rejected',
    [VerificationStatus.Revoked]: 'Revoked'
};

export const organizationStatusLabel: Record<OrganizationStatus, string> = {
    [OrganizationStatus.Pending]: 'Pending',
    [OrganizationStatus.Active]: 'Active',
    [OrganizationStatus.Suspended]: 'Suspended',
    [OrganizationStatus.Archived]: 'Archived'
};

export const trustScoreColor = (score: number) => {
    if (score >= 700) return 'text-green-500';
    if (score >= 300) return 'text-yellow-500';
    return 'text-red-500';
};
