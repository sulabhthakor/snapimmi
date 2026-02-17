'use client';

import { ReactNode } from 'react';
import { LucideIcon, Plus } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick?: () => void;
        href?: string;
    };
    secondaryAction?: {
        label: string;
        onClick?: () => void;
        href?: string;
    };
}

export function EmptyState({ icon: Icon, title, description, action, secondaryAction }: EmptyStateProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
            <div className="max-w-md mx-auto">
                {Icon && (
                    <div className="inline-flex items-center justify-center p-3 bg-gray-50 rounded-full mb-4">
                        <Icon className="h-6 w-6 text-gray-400" />
                    </div>
                )}
                <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
                {description && (
                    <p className="text-sm text-gray-500 mb-6">{description}</p>
                )}
                {(action || secondaryAction) && (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        {action && (
                            action.href ? (
                                <Link
                                    href={action.href}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-md transition-all"
                                >
                                    <Plus className="h-4 w-4" />
                                    {action.label}
                                </Link>
                            ) : (
                                <button
                                    onClick={action.onClick}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 shadow-md transition-all"
                                >
                                    <Plus className="h-4 w-4" />
                                    {action.label}
                                </button>
                            )
                        )}
                        {secondaryAction && (
                            secondaryAction.href ? (
                                <Link
                                    href={secondaryAction.href}
                                    className="w-full sm:w-auto border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                                >
                                    {secondaryAction.label}
                                </Link>
                            ) : (
                                <button
                                    onClick={secondaryAction.onClick}
                                    className="w-full sm:w-auto border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
                                >
                                    {secondaryAction.label}
                                </button>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
