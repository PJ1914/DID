import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    blur?: 'sm' | 'md' | 'lg' | 'xl';
    noPadding?: boolean;
    hoverable?: boolean;
}

const blurMap = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
};

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
    ({ children, className, blur = 'md', noPadding = false, hoverable = false }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'bg-white/5 border border-white/10 rounded-xl shadow-glass',
                    blurMap[blur],
                    !noPadding && 'p-6',
                    hoverable && 'hover:shadow-glass-sm hover:border-white/20 transition-all duration-300',
                    className
                )}
            >
                {children}
            </div>
        );
    }
);

GlassCard.displayName = 'GlassCard';
