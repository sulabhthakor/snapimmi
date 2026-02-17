import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    variant?: 'default' | 'strong' | 'weak';
    hover?: boolean;
}

export function GlassCard({
    children,
    variant = 'default',
    hover = true,
    className,
    ...props
}: GlassCardProps) {
    const variantClasses = {
        default: 'bg-white/70 backdrop-blur-xl border border-white/30 shadow-[0_8px_32px_0_rgba(44,129,141,0.15)]',
        strong: 'bg-white/90 backdrop-blur-2xl border border-white/40 shadow-[0_8px_32px_0_rgba(44,129,141,0.25)]',
        weak: 'bg-white/50 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(44,129,141,0.1)]',
    };

    return (
        <div
            className={cn(
                'rounded-2xl p-6 transition-all duration-300',
                variantClasses[variant],
                hover && 'hover:shadow-[0_8px_32px_0_rgba(44,129,141,0.25)] hover:-translate-y-1',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

interface DecorativeOrbProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function DecorativeOrb({
    size = 'md',
    className,
    ...props
}: DecorativeOrbProps) {
    const sizeClasses = {
        sm: 'absolute w-32 h-32 bg-primary-teal-400/20 rounded-full blur-3xl',
        md: 'absolute w-48 h-48 bg-primary-teal-400/30 rounded-full blur-3xl',
        lg: 'absolute w-64 h-64 bg-primary-teal-400/40 rounded-full blur-3xl',
    };

    return <div className={cn(sizeClasses[size], className)} {...props} />;
}

interface GradientBackgroundProps {
    children: React.ReactNode;
    className?: string;
    withOrbs?: boolean;
}

export function GradientBackground({
    children,
    className,
    withOrbs = true,
}: GradientBackgroundProps) {
    return (
        <div className={cn('relative bg-gradient-to-br from-gray-50 via-primary-teal-50/30 to-primary-teal-100/50 min-h-screen', className)}>
            {withOrbs && (
                <>
                    <DecorativeOrb
                        size="lg"
                        className="top-10 right-20 animate-float"
                        style={{ animationDelay: '0s' }}
                    />
                    <DecorativeOrb
                        size="md"
                        className="bottom-40 left-10 animate-float"
                        style={{ animationDelay: '2s' }}
                    />
                    <DecorativeOrb
                        size="sm"
                        className="top-1/2 left-1/3 animate-float"
                        style={{ animationDelay: '4s' }}
                    />
                </>
            )}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
