'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { changePassword } from '../actions';
import { Loader2, CheckCircle2, Lock, AlertCircle } from 'lucide-react';

const PasswordSchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export function SecurityForm() {
    const [isPending, startTransition] = useTransition();
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const form = useForm({
        resolver: zodResolver(PasswordSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = (data: z.infer<typeof PasswordSchema>) => {
        setSuccessMessage('');
        setErrorMessage('');

        startTransition(async () => {
            const result = await changePassword(data);
            if (result.success) {
                setSuccessMessage('Password updated successfully');
                form.reset();
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(typeof result.error === 'string' ? result.error : 'Failed to update password');
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 max-w-xl">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Current Password</label>
                    <div className="relative">
                        <input
                            type="password"
                            {...form.register('currentPassword')}
                            className="w-full rounded-lg border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm"
                            placeholder="••••••••"
                        />
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                    {form.formState.errors.currentPassword && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.currentPassword.message}</p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">New Password</label>
                        <input
                            type="password"
                            {...form.register('newPassword')}
                            className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm"
                            placeholder="New password"
                        />
                        {form.formState.errors.newPassword && (
                            <p className="text-red-500 text-sm mt-1">{form.formState.errors.newPassword.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-900">Confirm Password</label>
                        <input
                            type="password"
                            {...form.register('confirmPassword')}
                            className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm"
                            placeholder="Confirm new password"
                        />
                        {form.formState.errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{form.formState.errors.confirmPassword.message}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    type="submit"
                    disabled={isPending || !form.formState.isDirty}
                    className="bg-gradient-to-r from-primary-teal-500 to-primary-teal-600 text-white px-6 py-2.5 rounded-lg hover:from-primary-teal-600 hover:to-primary-teal-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-all shadow-md shadow-primary-teal-100 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Updating...
                        </>
                    ) : (
                        <>
                            <Lock className="h-4 w-4" /> Update Password
                        </>
                    )}
                </button>

                {successMessage && (
                    <div className="text-green-600 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="text-red-600 text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                        <AlertCircle className="h-4 w-4" />
                        {errorMessage}
                    </div>
                )}
            </div>
        </form>
    );
}
