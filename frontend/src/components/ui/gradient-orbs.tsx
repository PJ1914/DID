import React from 'react';
import { cn } from '@/lib/utils';

interface GradientOrbsProps {
    className?: string;
}

export const GradientOrbs: React.FC<GradientOrbsProps> = ({ className }) => {
    return (
        <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
            {/* Purple Orb - Top Left */}
            <div
                className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float"
                style={{
                    background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)',
                    animationDelay: '0s',
                    animationDuration: '20s'
                }}
            />

            {/* Pink Orb - Top Right */}
            <div
                className="absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full opacity-15 blur-3xl animate-float"
                style={{
                    background: 'radial-gradient(circle, #EC4899 0%, transparent 70%)',
                    animationDelay: '3s',
                    animationDuration: '25s'
                }}
            />

            {/* Cyan Orb - Bottom Left */}
            <div
                className="absolute -bottom-28 -left-28 w-[32rem] h-[32rem] rounded-full opacity-20 blur-3xl animate-float"
                style={{
                    background: 'radial-gradient(circle, #06B6D4 0%, transparent 70%)',
                    animationDelay: '5s',
                    animationDuration: '22s'
                }}
            />

            {/* Green Orb - Bottom Right */}
            <div
                className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full opacity-15 blur-3xl animate-float"
                style={{
                    background: 'radial-gradient(circle, #10B981 0%, transparent 70%)',
                    animationDelay: '7s',
                    animationDuration: '18s'
                }}
            />

            {/* Center Accent Orb */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full opacity-10 blur-3xl animate-pulse-slow"
                style={{
                    background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)',
                    animationDuration: '15s'
                }}
            />
        </div>
    );
};
