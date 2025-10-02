"use client";

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/utils/cn';

function MobileSidebar({ children }: { children: React.ReactNode }) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
                {children}
            </SheetContent>
        </Sheet>
    );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            <div className={cn('hidden h-full md:flex', isSidebarOpen ? 'w-64' : 'w-20')}>
                <Sidebar />
            </div>
            <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between border-b px-4 py-2 md:hidden">
                    <MobileSidebar>
                        <Sidebar />
                    </MobileSidebar>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen((prev) => !prev)} aria-label="Toggle sidebar" className="hidden md:inline-flex">
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>
                <Topbar />
                <main className="flex flex-1 flex-col overflow-y-auto bg-muted/30 p-6">
                    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6">{children}</div>
                </main>
            </div>
        </div>
    );
}
