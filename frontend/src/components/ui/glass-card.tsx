"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    blur?: "sm" | "md" | "lg";
    gradient?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, blur = "md", gradient = true, children, ...props }, ref) => {
        const blurClasses = {
            sm: "backdrop-blur-sm",
            md: "backdrop-blur-md",
            lg: "backdrop-blur-lg",
        };

        return (
            <div
                ref={ref}
                className={cn(
                    "relative rounded-2xl border transition-all duration-300",
                    blurClasses[blur],
                    gradient
                        ? "bg-gradient-to-br from-white/10 to-white/5 border-white/10 hover:border-[#00D4FF]/50"
                        : "bg-white/5 border-white/10",
                    "hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,212,255,0.2)]",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
