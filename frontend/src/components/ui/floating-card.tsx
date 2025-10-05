"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingCardProps extends React.HTMLAttributes<HTMLDivElement> {
    delay?: number;
    children: React.ReactNode;
}

export function FloatingCard({
    delay = 0,
    children,
    className,
    ...props
}: FloatingCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{
                y: -10,
                transition: { duration: 0.2 }
            }}
            className={cn(
                "relative p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10",
                "hover:bg-white/10 hover:border-white/20 transition-colors",
                className
            )}
            {...(props as any)}
        >
            {children}

            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00D4FF]/0 via-[#00D4FF]/20 to-[#9C40FF]/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 -z-10" />
        </motion.div>
    );
}
