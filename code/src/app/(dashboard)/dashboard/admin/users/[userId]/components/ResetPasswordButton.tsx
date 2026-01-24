'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Key, Copy, Check, X, AlertTriangle } from 'lucide-react';
import { resetUserPassword } from '@/features/admin/actions';
import { toast } from 'sonner';

interface ResetPasswordButtonProps {
    userId: string;
}

export function ResetPasswordButton({ userId }: ResetPasswordButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [showModal, setShowModal] = useState(false);
    const [tempPassword, setTempPassword] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleReset = () => {
        if (!confirm('Are you sure you want to reset this user\'s password? They will need the new temporary password to login.')) {
            return;
        }

        startTransition(async () => {
            const result = await resetUserPassword(userId);
            if (result.success && result.tempPassword) {
                setTempPassword(result.tempPassword);
                setShowModal(true);
                toast.success('Password reset successfully');
            } else {
                toast.error('Failed to reset password');
            }
        });
    };

    const copyToClipboard = () => {
        if (tempPassword) {
            navigator.clipboard.writeText(tempPassword);
            setCopied(true);
            toast.success('Password copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setTempPassword(null);
    };

    return (
        <>
            <Button
                variant="outline"
                className="gap-2"
                onClick={handleReset}
                disabled={isPending}
            >
                <Key className="h-4 w-4" />
                {isPending ? 'Resetting...' : 'Reset Password'}
            </Button>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Key className="h-5 w-5 text-indigo-600" />
                                Password Reset Successful
                            </h3>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex gap-4 p-4 bg-amber-50 rounded-lg border border-amber-100 text-amber-800 text-sm">
                                <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
                                <p>
                                    This temporary password will effectively replace the user's current password.
                                    <strong> Use this only if you can securely share it with the user.</strong>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 block">
                                    Temporary Password
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 font-mono text-lg text-center tracking-wider text-gray-900 select-all">
                                        {tempPassword}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-[50px] w-[50px] shrink-0"
                                        onClick={copyToClipboard}
                                    >
                                        {copied ? (
                                            <Check className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <Copy className="h-5 w-5 text-gray-500" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    Click to copy. This password will not be shown again.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <Button
                                onClick={closeModal}
                                className="w-full sm:w-auto"
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
