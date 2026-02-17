import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
    variant?: 'page' | 'card' | 'inline' | 'table';
    message?: string;
    className?: string;
}

export function LoadingState({
    variant = 'card',
    message = 'Loading...',
    className
}: LoadingStateProps) {
    if (variant === 'page') {
        return (
            <div className={cn('flex flex-col items-center justify-center min-h-[400px] space-y-4', className)}>
                <Loader2 className="h-8 w-8 animate-spin text-primary-teal-500" />
                <p className="text-sm text-gray-500 font-medium">{message}</p>
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                <Loader2 className="h-4 w-4 animate-spin text-primary-teal-500" />
                <span className="text-sm text-gray-500">{message}</span>
            </div>
        );
    }

    if (variant === 'table') {
        return (
            <div className="p-12 text-center">
                <Loader2 className=" h-8 w-8 animate-spin text-primary-teal-500 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">{message}</p>
            </div>
        );
    }

    // Default: card variant
    return (
        <div className={cn('bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-[0_4px_16px_0_rgba(44,129,141,0.08)] p-8 sm:p-12', className)}>
            <div className="flex flex-col items-center justify-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary-teal-500" />
                <p className="text-sm text-gray-500 font-medium">{message}</p>
            </div>
        </div>
    );
}

// Skeleton loaders for specific use cases
export function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6 animate-pulse">
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
                {Array.from({ length: rows }).map((_, idx) => (
                    <div key={idx} className="p-4 animate-pulse">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                            </div>
                            <div className="h-8 w-20 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function SkeletonList({ items = 3 }: { items?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
