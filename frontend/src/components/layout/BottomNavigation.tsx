"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
    Home,
    Shield,
    CheckCircle2,
    Building2,
    Award,
    KeyRound,
    Wallet,
    Sparkles,
    FileCheck,
    Clock,
    Users,
} from "lucide-react";
import { useRoles } from "@/hooks/useRoles";

export default function BottomNavigation() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const { isInstitute, isStudent, isVerifier, hasAnyRole } = useRoles();

    // Dynamically generate navigation items based on user role
    const navItems = useMemo(() => {
        const baseItems = [
            { icon: Home, label: "Home", href: "/", color: "#A78BFA", roles: ["all"] },
        ];

        if (!hasAnyRole) {
            // If no role, only show home and dashboard
            return [
                ...baseItems,
                { icon: Shield, label: "Dashboard", href: "/bc-cvs/dashboard", color: "#EC4899", roles: ["all"] },
            ];
        }

        // Institute-specific navigation
        if (isInstitute) {
            return [
                ...baseItems,
                { icon: Building2, label: "Dashboard", href: "/bc-cvs/institute", color: "#EC4899", roles: ["institute"] },
                { icon: FileCheck, label: "Issue Cert", href: "/bc-cvs/institute/issue-certificate", color: "#8B5CF6", roles: ["institute"] },
                { icon: Users, label: "Voting", href: "/bc-cvs/institute/validator-voting", color: "#A78BFA", roles: ["institute"] },
                { icon: Clock, label: "Activity", href: "/bc-cvs/institute/dashboard", color: "#EC4899", roles: ["institute"] },
            ];
        }

        // Student-specific navigation
        if (isStudent) {
            return [
                ...baseItems,
                { icon: Award, label: "Dashboard", href: "/bc-cvs/student", color: "#EC4899", roles: ["student"] },
                { icon: KeyRound, label: "My Certs", href: "/bc-cvs/student/my-certificates", color: "#8B5CF6", roles: ["student"] },
                { icon: Shield, label: "Share", href: "/bc-cvs/student/share", color: "#A78BFA", roles: ["student"] },
                { icon: Wallet, label: "Wallet", href: "/bc-cvs/student/wallet", color: "#60A5FA", roles: ["student"] },
                { icon: Clock, label: "History", href: "/bc-cvs/student/history", color: "#EC4899", roles: ["student"] },
            ];
        }

        // Verifier-specific navigation
        if (isVerifier) {
            return [
                ...baseItems,
                { icon: CheckCircle2, label: "Dashboard", href: "/bc-cvs/verifier", color: "#EC4899", roles: ["verifier"] },
                { icon: FileCheck, label: "Verify", href: "/bc-cvs/verifier/verify-certificate", color: "#8B5CF6", roles: ["verifier"] },
                { icon: Shield, label: "Bulk Verify", href: "/bc-cvs/verifier/bulk-verification", color: "#A78BFA", roles: ["verifier"] },
                { icon: Clock, label: "History", href: "/bc-cvs/verifier/history", color: "#EC4899", roles: ["verifier"] },
            ];
        }

        // Default fallback
        return [
            ...baseItems,
            { icon: Shield, label: "Dashboard", href: "/bc-cvs/dashboard", color: "#EC4899", roles: ["all"] },
        ];
    }, [isInstitute, isStudent, isVerifier, hasAnyRole]);

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
            suppressHydrationWarning
        >
            <div className="relative" suppressHydrationWarning>
                {/* Glow Effect */}
                {/* Animated gradient border - removed flashing animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-purple-500/30 rounded-full blur-sm" suppressHydrationWarning />

                {/* Main Navigation Container */}
                <div className="relative backdrop-blur-xl bg-black/40 border border-white/10 rounded-full px-4 py-3 shadow-2xl" suppressHydrationWarning>
                    <div className="flex items-center gap-2" suppressHydrationWarning>
                        {navItems.map((item, index) => {
                            const Icon = item.icon;
                            const isHovered = hoveredIndex === index;
                            const isActive = activeIndex === index;

                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    onClick={() => setActiveIndex(index)}
                                    className="relative group"
                                >
                                    <motion.div
                                        className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-full cursor-pointer"
                                        whileHover={{ y: -8 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        {/* Active Indicator */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 rounded-full bg-white/10 border border-white/30"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}

                                        {/* Icon Container */}
                                        <motion.div
                                            className="relative z-10"
                                            animate={{
                                                scale: isHovered ? 1.1 : 1,
                                                rotate: isHovered ? 10 : 0, // Reduced from 360° to 10° for cleaner look
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {/* Glow Ring */}
                                            {isHovered && (
                                                <motion.div
                                                    className="absolute inset-0 rounded-full border-2 border-purple-300/80"
                                                    initial={{ scale: 1, opacity: 0 }}
                                                    animate={{ scale: 1.5, opacity: 0 }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                        ease: "easeOut",
                                                    }}
                                                />
                                            )}

                                            {/* Icon */}
                                            <Icon
                                                className="w-6 h-6 relative z-10 transition-colors"
                                                style={{
                                                    color: isActive || isHovered ? item.color : "#ffffff80",
                                                }}
                                            />

                                            {/* Sparkle Effect on Hover */}
                                            {isHovered && (
                                                <>
                                                    <motion.div
                                                        className="absolute -top-1 -right-1"
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                    >
                                                        <Sparkles className="w-3 h-3" style={{ color: item.color }} />
                                                    </motion.div>
                                                    <motion.div
                                                        className="absolute -bottom-1 -left-1"
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                        transition={{ delay: 0.1 }}
                                                    >
                                                        <Sparkles className="w-3 h-3" style={{ color: item.color }} />
                                                    </motion.div>
                                                </>
                                            )}
                                        </motion.div>

                                        {/* Label */}
                                        <motion.span
                                            className="text-xs font-medium whitespace-nowrap relative z-10"
                                            animate={{
                                                color: isActive || isHovered ? item.color : "#ffffff60",
                                                opacity: isHovered || isActive ? 1 : 0.6,
                                                y: isHovered ? -2 : 0,
                                            }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Shadow */}
                {/* Glow effect at bottom */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent blur-xl" suppressHydrationWarning />
            </div>
        </motion.div>
    );
}
