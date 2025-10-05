import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GradientButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
    variant?: 'purple' | 'pink' | 'cyan' | 'green' | 'orangePink';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

const variantClasses = {
    purple: 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:shadow-neon-purple',
    pink: 'bg-gradient-to-r from-pink-500 to-rose-400 hover:shadow-neon-pink',
    cyan: 'bg-gradient-to-r from-cyan-500 to-sky-400 hover:shadow-neon-cyan',
    green: 'bg-gradient-to-r from-emerald-500 to-green-400 hover:shadow-emerald-500/50',
    orangePink: 'bg-gradient-to-r from-amber-500 to-pink-500 hover:shadow-pink-500/50'
};

const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
};

export const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
    ({ variant = 'purple', size = 'md', className, children, disabled, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: disabled ? 1 : 1.05 }}
                whileTap={{ scale: disabled ? 1 : 0.95 }}
                className={cn(
                    'relative rounded-lg font-medium text-white transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    variantClasses[variant],
                    sizeClasses[size],
                    className
                )}
                disabled={disabled}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);

GradientButton.displayName = 'GradientButton';
