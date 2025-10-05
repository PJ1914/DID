"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    spotlightColor?: string;
}

export const Spotlight = React.forwardRef<HTMLDivElement, SpotlightProps>(
    ({ children, className, spotlightColor = "rgba(0, 212, 255, 0.15)", ...props }, ref) => {
        const divRef = useRef<HTMLDivElement>(null);
        const [isHovered, setIsHovered] = useState(false);

        const mouseX = useMotionValue(0);
        const mouseY = useMotionValue(0);

        const springX = useSpring(mouseX, { stiffness: 200, damping: 20 });
        const springY = useSpring(mouseY, { stiffness: 200, damping: 20 });

        const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            if (!divRef.current) return;
            const rect = divRef.current.getBoundingClientRect();
            mouseX.set(e.clientX - rect.left);
            mouseY.set(e.clientY - rect.top);
        };

        return (
            <div
                ref={divRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn("group relative overflow-hidden", className)}
                {...props}
            >
                {children}

                {/* Spotlight effect */}
                <motion.div
                    className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
                    style={{
                        background: `radial-gradient(600px circle at ${springX}px ${springY}px, ${spotlightColor}, transparent 40%)`,
                    }}
                />
            </div>
        );
    }
);

Spotlight.displayName = "Spotlight";
