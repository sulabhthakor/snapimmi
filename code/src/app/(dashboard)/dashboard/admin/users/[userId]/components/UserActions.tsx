'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Key, Shield, UserX, Trash2 } from 'lucide-react';
import { toggleUserStatus, deleteUser, setUserForceReset } from '@/features/admin/actions';
import { toast } from 'sonner';

interface UserActionsProps {
    userId: string;
    isActive: boolean;
    mustChangePassword: boolean;
}

export function UserActions({ userId, isActive, mustChangePassword }: UserActionsProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleToggleStatus = async () => {
        startTransition(async () => {
            const result = await toggleUserStatus(userId, isActive);
            if (result.success) {
                toast.success(isActive ? 'User account suspended' : 'User account activated');
            } else {
                toast.error('Failed to update user status');
            }
        });
    };

    const handleForceReset = async () => {
        startTransition(async () => {
            const result = await setUserForceReset(userId, !mustChangePassword);
            if (result.success) {
                toast.success(mustChangePassword ? 'Force reset cancelled' : 'User will be forced to reset password on next login');
            } else {
                toast.error('Failed to update force reset status');
            }
        });
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
            return;
        }

        startTransition(async () => {
            const result = await deleteUser(userId);
            if (result.success) {
                toast.success('User deleted successfully');
                router.push('/dashboard/admin/users');
            } else {
                toast.error('Failed to delete user');
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
                <div className="pb-3 p-6">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <Shield className="h-4 w-4" />
                        Security Actions
                    </h3>
                </div>
                <div className="space-y-2 px-6 pb-6">
                    {isActive ? (
                        <Button
                            variant="outline"
                            className="w-full justify-start text-amber-600 border-amber-200 bg-amber-50/50 hover:bg-amber-100/50 transition-colors h-11"
                            onClick={handleToggleStatus}
                            disabled={isPending}
                        >
                            <UserX className="mr-2 h-4 w-4" />
                            {isPending ? 'Updating...' : 'Suspend Access'}
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full justify-start text-green-600 border-green-200 bg-green-50/50 hover:bg-green-100/50 transition-colors h-11"
                            onClick={handleToggleStatus}
                            disabled={isPending}
                        >
                            <Shield className="mr-2 h-4 w-4" />
                            {isPending ? 'Updating...' : 'Restore Access'}
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        className={`w-full justify-start h-11 ${mustChangePassword ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : ''}`}
                        onClick={handleForceReset}
                        disabled={isPending}
                    >
                        <Key className="mr-2 h-4 w-4" />
                        {isPending ? 'Updating...' : (mustChangePassword ? 'Cancel Force Reset' : 'Force Password Reset')}
                    </Button>
                </div>
                <div className="bg-gray-50/50 border-t border-gray-100 p-3">
                    <p className="text-xs text-center w-full text-gray-500">
                        Actions are audited.
                    </p>
                </div>
            </div>

            <div className="bg-white border border-red-100 shadow-sm overflow-hidden rounded-xl">
                <div className="bg-red-50/40 border-b border-red-100 pb-4 p-6">
                    <h3 className="flex items-center gap-2 text-red-700 text-sm font-bold">
                        <Trash2 className="h-4 w-4" />
                        Danger Zone
                    </h3>
                </div>
                <div className="pt-6 p-6">
                    <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                        Deleting this user will permanently remove their account from the system. Associated applications and audit logs may be preserved for compliance.
                    </p>
                    <Button
                        variant="destructive"
                        className="w-full bg-red-600 hover:bg-red-700 h-10 shadow-sm"
                        onClick={handleDelete}
                        disabled={isPending}
                    >
                        {isPending ? 'Deleting...' : 'Delete User Permanently'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
