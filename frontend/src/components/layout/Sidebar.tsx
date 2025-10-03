'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    Home,
    User,
    Shield,
    Building,
    Award,
    Settings,
    LifeBuoy,
    Users,
    Zap,
} from 'lucide-react'

const sidebarItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
    },
    {
        title: 'Identity',
        href: '/identity',
        icon: User,
    },
    {
        title: 'Verification',
        href: '/verification',
        icon: Shield,
    },
    {
        title: 'Organizations',
        href: '/organizations',
        icon: Building,
    },
    {
        title: 'Certificates',
        href: '/certificates',
        icon: Award,
    },
    {
        title: 'Guardians',
        href: '/guardians',
        icon: Users,
    },
    {
        title: 'Recovery',
        href: '/recovery',
        icon: LifeBuoy,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="hidden md:flex w-64 flex-col bg-card border-r border-border">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 flex-1 px-2 space-y-1">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                                    isActive
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'mr-3 flex-shrink-0 h-5 w-5',
                                        isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                                    )}
                                />
                                {item.title}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Pro Feature Banner */}
            <div className="flex-shrink-0 p-4">
                <div className="glass p-4 rounded-lg border border-did-electric/20">
                    <div className="flex items-center">
                        <Zap className="h-5 w-5 text-did-electric mr-2" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                                Upgrade to Pro
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Advanced features
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}