"use client";

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';
import { mainNavItems, secondaryNavItems } from '@/utils/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Sidebar() {
    const pathname = usePathname();

    const renderNav = (items: typeof mainNavItems) => (
        <ul className="space-y-1">
            {items.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                                isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    </li>
                );
            })}
        </ul>
    );

    return (
        <aside className="flex h-full w-64 flex-col border-r bg-background">
            <div className="flex h-16 items-center gap-3 border-b px-6">
                <Image src="/logo.svg" alt="DID Platform" width={40} height={40} className="h-10 w-10" priority />
                <div>
                    <p className="font-semibold">DID Platform</p>
                    <p className="text-xs text-muted-foreground">Decentralized Identity Suite</p>
                </div>
            </div>
            <ScrollArea className="flex-1 px-4 py-6">
                <div className="space-y-6">
                    <div>
                        <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">Main</p>
                        {renderNav(mainNavItems)}
                    </div>
                    <div>
                        <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">Modules</p>
                        {renderNav(secondaryNavItems)}
                    </div>
                </div>
            </ScrollArea>
        </aside>
    );
}
