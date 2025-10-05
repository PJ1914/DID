"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
    Home,
    Shield,
    CheckCircle2,
    Building2,
    Award,
    KeyRound,
    Sparkles,
} from "lucide-react";

const navItems = [
    { icon: Home, label: "Home", href: "/", color: "#A78BFA" },
    { icon: Shield, label: "Identity", href: "/identity", color: "#EC4899" },
    { icon: CheckCircle2, label: "Verify", href: "/verify", color: "#8B5CF6" },
    { icon: Building2, label: "Orgs", href: "/organizations", color: "#A78BFA" },
    { icon: Award, label: "Certs", href: "/certificates", color: "#EC4899" },
    { icon: KeyRound, label: "Recovery", href: "/recovery", color: "#8B5CF6" },
];

export default function BottomNavigation() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

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
                                                className="absolute inset-0 rounded-full"
                                                style={{
                                                    background: `linear-gradient(135deg, ${item.color}30, ${item.color}10)`,
                                                    border: `1px solid ${item.color}40`,
                                                }}
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
                                                    className="absolute inset-0 rounded-full"
                                                    initial={{ scale: 1, opacity: 0 }}
                                                    animate={{ scale: 1.5, opacity: 0 }}
                                                    transition={{
                                                        duration: 1,
                                                        repeat: Infinity,
                                                        ease: "easeOut",
                                                    }}
                                                    style={{
                                                        border: `2px solid ${item.color}`,
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
                                            style={{
                                                color: isActive || isHovered ? item.color : "#ffffff60",
                                            }}
                                            animate={{
                                                opacity: isHovered || isActive ? 1 : 0.6,
                                                y: isHovered ? -2 : 0,
                                            }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    </motion.div>

                                    {/* Hover Tooltip */}
                                    {isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: -60 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg backdrop-blur-xl bg-black/60 border whitespace-nowrap text-sm"
                                            style={{
                                                borderColor: `${item.color}40`,
                                                color: item.color,
                                            }}
                                        >
                                            {item.label}
                                            <motion.div
                                                className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 w-2 h-2 rotate-45 bg-black/60"
                                                style={{ borderRight: `1px solid ${item.color}40`, borderBottom: `1px solid ${item.color}40` }}
                                            />
                                        </motion.div>
                                    )}
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
