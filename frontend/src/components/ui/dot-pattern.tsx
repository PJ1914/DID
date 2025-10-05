"use client";

import { cn } from "@/lib/utils";

interface DotPatternProps {
    className?: string;
    dotSize?: number;
    dotColor?: string;
    backgroundColor?: string;
}

export default function DotPattern({
    className,
    dotSize = 1,
    dotColor = "rgba(255, 255, 255, 0.3)",
    backgroundColor = "transparent",
}: DotPatternProps) {
    const id = "dot-pattern-" + Math.random().toString(36).substr(2, 9);

    return (
        <svg
            className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
            aria-hidden="true"
        >
            <defs>
                <pattern
                    id={id}
                    width="16"
                    height="16"
                    patternUnits="userSpaceOnUse"
                    patternContentUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                >
                    <circle
                        id="pattern-circle"
                        cx={dotSize}
                        cy={dotSize}
                        r={dotSize}
                        fill={dotColor}
                    />
                </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
        </svg>
    );
}
