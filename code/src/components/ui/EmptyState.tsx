'use client';

import { ReactNode } from 'react';
import { LucideIcon, Plus } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick?: () => void;
        href?: string;
    };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Icon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 mb-4 max-w-xs">{description}</p>
            {action && (
                action.href ? (
                    <a
                        href={action.href}
                        className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        {action.label}
                    </a>
                ) : (
                    <button
                        onClick={action.onClick}
                        className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        {action.label}
                    </button>
                )
            )}
        </div>
    );
}
