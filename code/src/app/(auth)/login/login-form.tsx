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
                        <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
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
                    <a className="text-xs font-medium text-gray-500 hover:text-gray-900" href="#">
                        Forgot password?
                    </a>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        className="flex h-10 w-full rounded-md border border-gray-200 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
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
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-gray-900 text-white shadow hover:bg-gray-800 h-10 px-4 w-full"
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
