"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagneticCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    magneticStrength?: number;
    tiltStrength?: number;
}

export const MagneticCard = React.forwardRef<HTMLDivElement, MagneticCardProps>(
    ({ children, className, magneticStrength = 0.15, tiltStrength = 5, ...props }, ref) => {
        const cardRef = useRef<HTMLDivElement>(null);
        const [isHovered, setIsHovered] = useState(false);

        const mouseX = useMotionValue(0);
        const mouseY = useMotionValue(0);

        const rotateX = useTransform(mouseY, [-200, 200], [tiltStrength, -tiltStrength]);
        const rotateY = useTransform(mouseX, [-200, 200], [-tiltStrength, tiltStrength]);

        const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
        const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

        const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            if (!cardRef.current) return;

            const rect = cardRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;

            mouseX.set(deltaX);
            mouseY.set(deltaY);
        };

        const handleMouseLeave = () => {
            setIsHovered(false);
            mouseX.set(0);
            mouseY.set(0);
        };

        return (
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX: rotateX as any,
                    rotateY: rotateY as any,
                    transformStyle: "preserve-3d",
                }}
                whileHover={{ scale: 1.02 }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                }}
                className={cn(
                    "relative transform-gpu",
                    className
                )}
                {...(props as any)}
            >
                {/* Glow effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#00D4FF]/20 via-[#9C40FF]/20 to-[#00D4FF]/20 rounded-2xl blur-xl opacity-0"
                    animate={{
                        opacity: isHovered ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                />

                {/* Card content */}
                <div
                    className="relative"
                    style={{
                        transform: "translateZ(20px)",
                        transformStyle: "preserve-3d",
                    }}
                >
                    {children}
                </div>
            </motion.div>
        );
    }
);

MagneticCard.displayName = "MagneticCard";
