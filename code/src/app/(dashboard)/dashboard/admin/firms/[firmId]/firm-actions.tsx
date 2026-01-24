'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Ban, CheckCircle } from 'lucide-react';
import { toggleFirmStatus, deleteFirm } from '@/features/admin/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function FirmActions({ firmId, status }: { firmId: string, status: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleToggleStatus() {
        setIsLoading(true);
        try {
            const result = await toggleFirmStatus(firmId, status);
            if (result.success) {
                toast.success(`Firm ${status === 'ACTIVE' ? 'suspended' : 'activated'} successfully`);
            } else {
                toast.error('Failed to update status');
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
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
            } else {
                toast.error('Failed to delete firm');
                setIsLoading(false);
            }
        } catch (e) {
            toast.error('An error occurred');
            setIsLoading(false);
        }
    }

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
