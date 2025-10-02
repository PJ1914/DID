import type { ComponentType } from 'react';
import {
    BadgeCheck,
    Building2,
    FileCheck2,
    FileText,
    Gauge,
    Home,
    LockKeyhole,
    Users,
    Workflow
} from 'lucide-react';

export type NavItem = {
    title: string;
    description?: string;
    href: string;
    icon: ComponentType<{ className?: string }>;
};

export const mainNavItems: NavItem[] = [
    { title: 'Overview', href: '/dashboard', icon: Home },
    {
        title: 'Trust Score',
        href: '/dashboard#trust-score',
        icon: Gauge
    },
    { title: 'Verifications', href: '/verifications', icon: BadgeCheck },
    { title: 'Zero-Knowledge Proofs', href: '/zk-proofs', icon: LockKeyhole },
    { title: 'Organizations', href: '/organizations', icon: Building2 },
    { title: 'Admin', href: '/admin', icon: Workflow }
];

export const secondaryNavItems: NavItem[] = [
    { title: 'Activity Log', href: '/dashboard#activity', icon: FileText },
    { title: 'Providers', href: '/verifications/providers', icon: Users },
    { title: 'Templates', href: '/verifications/templates', icon: FileCheck2 }
];
