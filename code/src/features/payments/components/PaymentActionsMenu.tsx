'use client';

import { useState } from 'react';
import { MoreHorizontal, Eye, FileText, Edit, RefreshCw, Trash2, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deletePayment } from '@/features/payments/server/actions';
import { refundPayment } from '@/features/revenue/server/actions';
import { toast } from 'sonner';
import { PaymentDetailSheet } from './PaymentDetailSheet';
import { EditPaymentSheet } from './EditPaymentSheet';

interface PaymentActionsMenuProps {
    paymentId: string;
    customerId: string;
    applicationId: string;
    firmId: string;
    status: string;
}

export function PaymentActionsMenu({ paymentId, customerId, applicationId, firmId, status }: PaymentActionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDetailSheet, setShowDetailSheet] = useState(false);
    const [showEditSheet, setShowEditSheet] = useState(false);
    const [payment, setPayment] = useState<any>(null);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this payment? This cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        const result = await deletePayment(paymentId);

        if (result.success) {
            toast.success('Payment deleted');
            router.refresh();
            setIsOpen(false);
        } else {
            toast.error('Failed to delete payment');
            setIsDeleting(false);
        }
    };

    const handleRefund = async () => {
        const reason = prompt('Please enter a reason for the refund (optional):');
        if (reason === null) return;

        const result = await refundPayment(paymentId, reason || undefined);

        if (result.success) {
            toast.success('Payment refunded successfully');
            router.refresh();
            setIsOpen(false);
        } else {
            toast.error('Failed to process refund');
        }
    };

    return (
        <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="p-1 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
            >
                <MoreHorizontal className="h-4 w-4" />
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Menu - Using fixed positioning to avoid overflow clipping */}
                    <div className="fixed z-50 w-56 bg-white border border-gray-200 rounded-lg shadow-xl ring-1 ring-black/5 overflow-hidden" style={{ right: 'auto', marginTop: '8px', marginLeft: '-14rem' }}>
                        <div className="py-1">
                            <button
                                onClick={() => {
                                    setShowDetailSheet(true);
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Info className="h-4 w-4 text-gray-400" />
                                View Details
                            </button>

                            <Link
                                href={`/dashboard/${firmId}/customers/${customerId}`}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <Eye className="h-4 w-4 text-gray-400" />
                                View Customer
                            </Link>

                            <Link
                                href={`/dashboard/${firmId}/applications/${applicationId}`}
                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <FileText className="h-4 w-4 text-gray-400" />
                                View Application
                            </Link>

                            <div className="border-t border-gray-100 my-1" />

                            <button
                                onClick={async () => {
                                    setIsOpen(false);
                                    // Fetch payment data for editing
                                    const { getPaymentDetails } = await import('@/features/revenue/server/actions');
                                    const data = await getPaymentDetails(paymentId);
                                    setPayment(data);
                                    setShowEditSheet(true);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Edit className="h-4 w-4 text-gray-400" />
                                Edit Payment
                            </button>

                            {status === 'COMPLETED' && (
                                <button
                                    onClick={handleRefund}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <RefreshCw className="h-4 w-4 text-gray-400" />
                                    Mark as Refunded
                                </button>
                            )}

                            <div className="border-t border-gray-100 my-1" />

                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" />
                                {isDeleting ? 'Deleting...' : 'Delete Payment'}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Payment Detail Sheet */}
            <PaymentDetailSheet
                paymentId={paymentId}
                isOpen={showDetailSheet}
                onClose={() => setShowDetailSheet(false)}
                firmId={firmId}
            />

            {/* Edit Payment Sheet */}
            <EditPaymentSheet
                payment={payment}
                isOpen={showEditSheet}
                onClose={() => {
                    setShowEditSheet(false);
                    setPayment(null);
                }}
            />
        </div>
    );
}
