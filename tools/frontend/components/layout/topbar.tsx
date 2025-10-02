"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';
import { WalletConnectButton } from '@/components/shared/wallet-connect-button';
import { cn } from '@/utils/cn';

const breadcrumbs: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/verifications': 'Verifications',
    '/zk-proofs': 'Zero-Knowledge Proofs',
    '/organizations': 'Organizations',
    '/admin': 'Admin'
};

export function Topbar() {
    const pathname = usePathname();
    const title = breadcrumbs[pathname ?? ''] ?? 'Overview';

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
                <div>
                    <p className="text-xs text-muted-foreground">Current Module</p>
                    <h1 className="text-xl font-semibold">{title}</h1>
                </div>
                <nav className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
                    {Object.entries(breadcrumbs).map(([href, label]) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                'rounded-md px-2 py-1 transition-colors hover:text-foreground',
                                pathname === href ? 'bg-accent text-foreground' : undefined
                            )}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
            </div>
            <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-md border px-3 py-1.5 md:flex">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input className="h-8 border-0 bg-transparent p-0 text-sm focus-visible:ring-0" placeholder="Search identities, proofs..." />
                </div>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                </Button>
                <ThemeToggle />
                <WalletConnectButton />
            </div>
        </header>
    );
}
