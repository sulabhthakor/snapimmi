'use client';

/**
 * DecorativeBackground Component
 * 
 * Provides an animated gradient background with floating decorative orbs
 * for a modern glassmorphism aesthetic.
 */

interface DecorativeBackgroundProps {
    variant?: 'default' | 'subtle' | 'vibrant';
    showOrbs?: boolean;
}

export function DecorativeBackground({
    variant = 'default',
    showOrbs = true
}: DecorativeBackgroundProps) {
    const gradientClasses = {
        default: 'bg-gradient-to-br from-gray-50 via-white to-primary-teal-50/30',
        subtle: 'bg-gradient-to-br from-white via-gray-50 to-gray-100',
        vibrant: 'bg-gradient-to-br from-primary-teal-50 via-white to-primary-teal-100/50'
    };

    return (
        <div className={`fixed inset-0 -z-10 ${gradientClasses[variant]}`}>
            {showOrbs && (
                <>
                    {/* Top Right Orb */}
                    <div
                        className="absolute top-0 right-0 w-96 h-96 bg-primary-teal-400/20 rounded-full blur-3xl animate-pulse"
                        style={{ animationDuration: '8s' }}
                    />

                    {/* Bottom Left Orb */}
                    <div
                        className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"
                        style={{ animationDuration: '10s', animationDelay: '2s' }}
                    />

                    {/* Center Orb */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-primary-teal-300/10 rounded-full blur-3xl animate-pulse"
                        style={{ animationDuration: '12s', animationDelay: '4s' }}
                    />
                </>
            )}

            {/* Subtle grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(44, 129, 141, 0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(44, 129, 141, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '64px 64px'
                }}
            />
        </div>
    );
}
