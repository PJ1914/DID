'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
    Sparkles,
    ChevronRight,
} from 'lucide-react'

const sidebarItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: Home,
        gradient: 'from-purple-500 to-indigo-500',
    },
    {
        title: 'Identity',
        href: '/identity',
        icon: User,
        gradient: 'from-pink-500 to-rose-500',
    },
    {
        title: 'Verification',
        href: '/verification',
        icon: Shield,
        gradient: 'from-cyan-500 to-blue-500',
    },
    {
        title: 'Organizations',
        href: '/organizations',
        icon: Building,
        gradient: 'from-emerald-500 to-green-500',
    },
    {
        title: 'Certificates',
        href: '/certificates',
        icon: Award,
        gradient: 'from-amber-500 to-orange-500',
    },
    {
        title: 'Guardians',
        href: '/guardians',
        icon: Users,
        gradient: 'from-violet-500 to-purple-500',
    },
    {
        title: 'Recovery',
        href: '/recovery',
        icon: LifeBuoy,
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        gradient: 'from-slate-500 to-gray-500',
    },
]

export function FloatingSidebar() {
    const [isExpanded, setIsExpanded] = useState(false)
    const pathname = usePathname()

    return (
        <motion.aside
            initial={false}
            animate={{
                width: isExpanded ? 280 : 60,
            }}
            transition={{
                type: 'spring',
                stiffness: 300,
                damping: 20,
            }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            className="fixed left-0 top-0 h-screen bg-white/5 backdrop-blur-md border-r border-white/10 z-40 hidden md:block"
        >
            <div className="flex flex-col h-full p-3">
                {/* Logo Area */}
                <div className="mb-8 mt-4">
                    <motion.div
                        className="flex items-center gap-3 px-2"
                        animate={{
                            justifyContent: isExpanded ? 'flex-start' : 'center',
                        }}
                    >
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                                >
                                    DID Portal
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide" style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                }}>
                    <style jsx>{`
                        nav::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link key={item.href} href={item.href}>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                        'relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group overflow-hidden',
                                        isActive
                                            ? 'bg-white/10 shadow-lg'
                                            : 'hover:bg-white/5'
                                    )}
                                >
                                    {/* Active Indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-r-full"
                                            transition={{
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 20,
                                            }}
                                        />
                                    )}

                                    {/* Icon with Gradient Background */}
                                    <div
                                        className={cn(
                                            'relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200',
                                            isActive
                                                ? `bg-gradient-to-br ${item.gradient}`
                                                : 'bg-white/5 group-hover:bg-white/10'
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                'w-5 h-5 transition-colors',
                                                isActive
                                                    ? 'text-white'
                                                    : 'text-gray-400 group-hover:text-white'
                                            )}
                                        />
                                    </div>

                                    {/* Label */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ duration: 0.2 }}
                                                className="flex-1 flex items-center justify-between"
                                            >
                                                <span
                                                    className={cn(
                                                        'text-sm font-medium',
                                                        isActive
                                                            ? 'text-white'
                                                            : 'text-gray-400 group-hover:text-white'
                                                    )}
                                                >
                                                    {item.title}
                                                </span>
                                                {isActive && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0 }}
                                                    >
                                                        <ChevronRight className="w-4 h-4 text-purple-400" />
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Hover Glow Effect */}
                                    {!isActive && (
                                        <motion.div
                                            className={cn(
                                                'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl',
                                                `bg-gradient-to-r ${item.gradient}`,
                                                'blur-xl -z-10'
                                            )}
                                            initial={false}
                                        />
                                    )}
                                </motion.div>
                            </Link>
                        )
                    })}
                </nav>

                {/* Pro Feature Banner */}
                <div className="mt-auto pt-4">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="glass p-3 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 cursor-pointer overflow-hidden relative group"
                    >
                        {/* Animated Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/30">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex-1"
                                    >
                                        <p className="text-sm font-semibold text-white">
                                            Upgrade Pro
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Advanced features
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.aside>
    )
}
