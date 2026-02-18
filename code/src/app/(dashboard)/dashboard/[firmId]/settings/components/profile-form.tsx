'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateProfile } from '../actions';
import { Loader2, CheckCircle2, Save, User, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

const ProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
});

export function ProfileForm({ user }: { user: { name: string; email: string } }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { update } = useSession();

    const form = useForm({
        resolver: zodResolver(ProfileSchema),
        defaultValues: {
            name: user.name,
        },
    });

    const onSubmit = (data: z.infer<typeof ProfileSchema>) => {
        startTransition(async () => {
            const result = await updateProfile(data);
            if (result.success) {
                // Update session on client (triggers jwt callback with update)
                await update({ user: { name: data.name } });

                toast.success('Profile updated successfully');
                router.refresh(); // Update the UI including the user menu
            } else {
                toast.error('Failed to update profile');
            }
        });
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-md">
                    <span className="text-2xl font-bold text-gray-400">
                        {user.name?.charAt(0) || 'U'}
                    </span>
                </div>
                <div>
                    <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                </div>
            </div>

            <div className="grid gap-6 max-w-xl">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Full Name</label>
                    <div className="relative">
                        <input
                            {...form.register('name')}
                            className="w-full rounded-lg border-gray-300 bg-white pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm"
                            placeholder="Enter your full name"
                        />
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                    {form.formState.errors.name && (
                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Email Address</label>
                    <div className="relative">
                        <input
                            value={user.email}
                            disabled
                            className="w-full rounded-lg border-gray-300 bg-gray-50 pl-10 pr-4 text-gray-500 cursor-not-allowed shadow-sm py-2.5"
                        />
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500">Email address cannot be changed</p>
                </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={isPending || !form.formState.isDirty}
                    className="w-full sm:w-auto bg-gradient-to-r from-primary-teal-500 to-primary-teal-600 text-white px-6 py-2.5 rounded-lg hover:from-primary-teal-600 hover:to-primary-teal-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 transition-all shadow-md shadow-primary-teal-100 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" /> Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
