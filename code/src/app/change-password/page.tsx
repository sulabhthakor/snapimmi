'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateMyPassword } from '@/features/auth/actions';
import Link from 'next/link';

export default function ChangePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        startTransition(async () => {
            console.log("Submitting password update...");
            try {
                const formData = new FormData();
                formData.append('password', password);

                const result = await updateMyPassword(formData);
                console.log("Update result:", result);

                if (result.success) {
                    toast.success('Password updated successfully. Redirecting to login...');
                    // Redirect to login to force fresh session
                    window.location.href = '/login?message=PasswordUpdated';
                } else {
                    console.error("Update failed:", result.error);
                    toast.error(result.error || 'Failed to update password');
                }
            } catch (err) {
                console.error("Client error:", err);
                toast.error("An unexpected error occurred.");
            }
        });
    };

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            {/* Left Side: Form */}
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
                <div className="mx-auto w-full max-w-[350px] space-y-6">
                    <div className="flex flex-col space-y-2 text-center">
                        <div className="mb-8 mx-auto flex items-center justify-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                            <span className="text-xl font-bold tracking-tight text-gray-900">SnapImmi</span>
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                            Change Password
                        </h1>
                        <p className="text-sm text-gray-500">
                            For your security, please update your password to continue.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            />
                            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">min 8 characters</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-black hover:bg-gray-800 text-white h-10 font-medium"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    Update Password
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Right Side: Visual */}
            <div className="hidden bg-gray-900 lg:block relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
                <div className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                    }}
                />

                <div className="relative z-10 flex h-full flex-col justify-center p-10 text-white">
                    <div className="space-y-4 max-w-lg mx-auto text-center">
                        <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm mx-auto mb-6 border border-white/10">
                            <Lock className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">Security Check</h2>
                        <p className="text-gray-400 text-lg">
                            We regularly ask users to reset their passwords to ensure account safety and compliance with security standards.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
