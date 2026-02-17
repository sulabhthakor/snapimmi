'use client';

import { useActionState } from 'react';
import { authenticate } from '@/features/auth/server/actions';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginForm() {
    const [errorMessage, formAction, isPending] = useActionState(
        authenticate,
        undefined,
    );

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-1">
                <label
                    className="text-sm font-medium text-gray-900"
                    htmlFor="email"
                >
                    Email
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-primary-teal-500" />
                    </div>
                    <input
                        className="flex h-11 w-full rounded-xl border border-gray-200/50 bg-white/90 backdrop-blur-sm pl-10 pr-3 py-2.5 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-teal-500/20 focus:border-primary-teal-500 hover:border-gray-300 transition-all shadow-sm"
                        id="email"
                        type="email"
                        name="email"
                        placeholder="name@example.com"
                        required
                        autoComplete="email"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <label
                        className="text-sm font-medium text-gray-900"
                        htmlFor="password"
                    >
                        Password
                    </label>
                    <a className="text-xs font-semibold text-primary-teal-600 hover:text-primary-teal-700" href="#">
                        Forgot password?
                    </a>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-primary-teal-500" />
                    </div>
                    <input
                        className="flex h-11 w-full rounded-xl border border-gray-200/50 bg-white/90 backdrop-blur-sm pl-10 pr-3 py-2.5 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-teal-500/20 focus:border-primary-teal-500 hover:border-gray-300 transition-all shadow-sm"
                        id="password"
                        type="password"
                        name="password"
                        required
                        placeholder="••••••••"
                        minLength={6}
                        autoComplete="current-password"
                    />
                </div>
            </div>

            <div
                className="flex h-5 items-end space-x-1"
                aria-live="polite"
                aria-atomic="true"
            >
                {errorMessage && (
                    <p className="text-sm text-red-500 w-full text-center font-medium bg-red-50 py-1 rounded-md border border-red-100">{errorMessage}</p>
                )}
            </div>

            <button
                className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-teal-500/20 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-primary-teal-500 to-primary-teal-600 text-white shadow-[0_4px_12px_0_rgba(44,129,141,0.3)] hover:from-primary-teal-600 hover:to-primary-teal-700 hover:shadow-[0_6px_16px_0_rgba(44,129,141,0.4)] hover:-translate-y-0.5 h-11 px-4 w-full"
                disabled={isPending}
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                    </>
                ) : (
                    'Sign In with Email'
                )}
            </button>
        </form>
    );
}
