'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Ban, CheckCircle, MoreVertical, Eye } from 'lucide-react';
import { toggleFirmStatus, deleteFirm } from '@/features/admin/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Link from 'next/link';

interface FirmActionsProps {
    firmId: string;
    status: string;
    mode?: 'buttons' | 'menu';
}

export function FirmActions({ firmId, status, mode = 'buttons' }: FirmActionsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleToggleStatus() {
        setIsLoading(true);
        try {
            const result = await toggleFirmStatus(firmId, status);
            if (result.success) {
                toast.success(`Firm ${status === 'ACTIVE' ? 'suspended' : 'activated'} successfully`);
                router.refresh();
            } else {
                toast.error('Failed to update status');
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
            // If in menu mode, we might want to close the popover, but Popover handles outside click usually.
        }
    }

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this firm? This action cannot be undone.')) return;

        setIsLoading(true);
        try {
            const result = await deleteFirm(firmId);
            if (result.success) {
                toast.success('Firm deleted successfully');
                router.push('/dashboard/admin/firms');
                router.refresh();
            } else {
                toast.error('Failed to delete firm');
                setIsLoading(false);
            }
        } catch (e) {
            toast.error('An error occurred');
            setIsLoading(false);
        }
    }

    if (mode === 'menu') {
        return (
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[180px] p-1 bg-white border border-gray-200 shadow-lg rounded-lg">
                    <div className="flex flex-col gap-0.5">
                        <Link
                            href={`/dashboard/admin/firms/${firmId}`}
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Eye className="h-4 w-4 text-gray-500" />
                            View Details
                        </Link>
                        <button
                            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${status === 'ACTIVE' ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'
                                }`}
                            onClick={handleToggleStatus}
                            disabled={isLoading}
                        >
                            {status === 'ACTIVE' ? (
                                <>
                                    <Ban className="h-4 w-4" /> Suspend
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4" /> Activate
                                </>
                            )}
                        </button>
                        <button
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            onClick={handleDelete}
                            disabled={isLoading}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </PopoverContent>
            </Popover>
        );
    }

    // Default 'buttons' mode for detail page
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStatus}
                disabled={isLoading}
                className={status === 'ACTIVE' ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
            >
                {status === 'ACTIVE' ? (
                    <>
                        <Ban className="h-4 w-4 mr-2" /> Suspend Firm
                    </>
                ) : (
                    <>
                        <CheckCircle className="h-4 w-4 mr-2" /> Activate Firm
                    </>
                )}
            </Button>

            <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
        </div>
    );
}
