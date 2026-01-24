'use client';

import { MoreHorizontal, Eye, UserX, Shield } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { toggleUserStatus } from '@/features/admin/actions';
import { toast } from 'sonner';
import { useTransition } from 'react';

interface UserActionsProps {
    userId: string;
    isActive: boolean;
}

export function UserActions({ userId, isActive }: UserActionsProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggleStatus = async () => {
        startTransition(async () => {
            const result = await toggleUserStatus(userId, isActive);
            if (result.success) {
                toast.success(isActive ? 'User suspended' : 'User activated');
            } else {
                toast.error('Failed to update status');
            }
        });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-[160px] p-1 bg-white border border-gray-200 shadow-lg rounded-lg">
                <div className="flex flex-col gap-0.5">
                    <Link
                        href={`/dashboard/admin/users/${userId}`}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <Eye className="h-4 w-4 text-gray-500" />
                        View Details
                    </Link>
                    <button
                        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${isActive
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                        onClick={handleToggleStatus}
                        disabled={isPending}
                    >
                        {isActive ? <UserX className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        {isPending ? 'Updating...' : (isActive ? 'Suspend' : 'Restore Access')}
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
