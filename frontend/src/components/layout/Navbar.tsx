'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './ThemeToggle'
import { Bell, Search, Menu } from 'lucide-react'
import Link from 'next/link'

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-did-electric to-blue-500" />
                    <span className="font-bold text-xl gradient-text">DID Platform</span>
                </Link>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
                    <Link
                        href="/dashboard"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/identity"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        Identity
                    </Link>
                    <Link
                        href="/verification"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        Verification
                    </Link>
                    <Link
                        href="/organizations"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        Organizations
                    </Link>
                    <Link
                        href="/certificates"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        Certificates
                    </Link>
                </nav>

                <div className="flex flex-1 items-center justify-end space-x-4">
                    {/* Search */}
                    <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                        <Search className="h-4 w-4" />
                    </Button>

                    {/* Notifications */}
                    <Button variant="ghost" size="icon">
                        <Bell className="h-4 w-4" />
                    </Button>

                    {/* Theme Toggle */}
                    <ThemeToggle />

                    {/* Wallet Connection */}
                    <ConnectButton />

                    {/* Mobile Menu */}
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </nav>
    )
}