"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface Card3DProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    containerClassName?: string;
}

export const Card3DContainer = React.forwardRef<HTMLDivElement, Card3DProps>(
    ({ children, className, containerClassName, ...props }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);

        const mouseX = useMotionValue(0);
        const mouseY = useMotionValue(0);

        const rotateX = useTransform(mouseY, [-0.5, 0.5], [10, -10]);
        const rotateY = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);

        const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 });
        const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 });

        const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            const mouseXVal = e.clientX - rect.left;
            const mouseYVal = e.clientY - rect.top;

            const xPct = mouseXVal / width - 0.5;
            const yPct = mouseYVal / height - 0.5;

            mouseX.set(xPct);
            mouseY.set(yPct);
        };

        const handleMouseLeave = () => {
            mouseX.set(0);
            mouseY.set(0);
        };

        return (
            <motion.div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    perspective: "1000px",
                }}
                className={cn("relative", containerClassName)}
                {...props}
            >
                <motion.div
                    style={{
                        rotateX: springRotateX,
                        rotateY: springRotateY,
                        transformStyle: "preserve-3d",
                    }}
                    className={cn("relative", className)}
                >
                    {children}
                </motion.div>
            </motion.div>
        );
    }
);

Card3DContainer.displayName = "Card3DContainer";

export const Card3DBody = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn("", className)}
            style={{
                transformStyle: "preserve-3d",
            }}
            {...props}
        >
            {children}
        </div>
    );
});

Card3DBody.displayName = "Card3DBody";

export const Card3DItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { translateZ?: number }
>(({ children, className, translateZ = 50, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn("", className)}
            style={{
                transform: `translateZ(${translateZ}px)`,
                transformStyle: "preserve-3d",
            }}
            {...props}
        >
            {children}
        </div>
    );
});

Card3DItem.displayName = "Card3DItem";
