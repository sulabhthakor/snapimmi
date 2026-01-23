'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Users, FileText, Briefcase, ArrowRight } from 'lucide-react';

interface OnboardingGuideProps {
    firmId: string;
    stats: {
        totalCustomers: number;
        activeApplications: number;
    };
}

export function OnboardingGuide({ firmId, stats }: OnboardingGuideProps) {
    const [dismissed, setDismissed] = useState(false);

    // Calculate completion
    const steps = [
        { id: 'customer', label: 'Create your first customer', done: stats.totalCustomers > 0, href: `/dashboard/${firmId}/customers/new` },
        { id: 'application', label: 'Start an application', done: stats.activeApplications > 0, href: `/dashboard/${firmId}/applications/new` },
        { id: 'docs', label: 'Upload documents', done: stats.activeApplications > 0, href: null }, // Estimated based on apps
    ];

    const completedCount = steps.filter(s => s.done).length;
    const isComplete = completedCount === steps.length;

    if (dismissed || isComplete) return null;

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 mb-8">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        🚀 Getting Started
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        Complete these steps to set up your workspace
                    </p>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                >
                    Dismiss
                </button>
            </div>

            <div className="space-y-3">
                {steps.map((step, idx) => (
                    <div
                        key={step.id}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${step.done ? 'bg-white/50' : 'bg-white'}`}
                    >
                        {step.done ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                            <Circle className="h-5 w-5 text-gray-300" />
                        )}
                        <span className={`text-sm flex-1 ${step.done ? 'text-gray-400 line-through' : 'text-gray-900 font-medium'}`}>
                            {step.label}
                        </span>
                        {!step.done && step.href && (
                            <Link
                                href={step.href}
                                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                            >
                                Do it <ArrowRight className="h-3 w-3" />
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                    <div
                        className="h-full bg-blue-500 transition-all duration-500"
                        style={{ width: `${(completedCount / steps.length) * 100}%` }}
                    />
                </div>
                <span className="text-xs text-gray-500">{completedCount}/{steps.length}</span>
            </div>
        </div>
    );
}
