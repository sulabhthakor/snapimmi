'use client';

import { useState, useEffect } from 'react';
import { X, Download, Mail, Edit, RefreshCw, Trash2, Loader2, User, FileText, CreditCard, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { getPaymentDetails } from '@/features/revenue/server/actions';
import { deletePayment } from '@/features/payments/server/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

interface PaymentDetailsSheetProps {
    paymentId: string;
    isOpen: boolean;
    onClose: () => void;
    firmId: string;
}

export function PaymentDetailSheet({ paymentId, isOpen, onClose, firmId }: PaymentDetailsSheetProps) {
    const [payment, setPayment] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isOpen && paymentId) {
            setIsLoading(true);
            getPaymentDetails(paymentId).then((data) => {
                setPayment(data);
                setIsLoading(false);
            });
        }
    }, [isOpen, paymentId]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this payment? This cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        const result = await deletePayment(paymentId);

        if (result.success) {
            toast.success('Payment deleted');
            router.refresh();
            onClose();
        } else {
            toast.error('Failed to delete payment');
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Payment Details</h2>
                        <p className="text-xs text-gray-500 mt-1">Transaction #{paymentId.slice(0, 8)}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                        </div>
                    ) : payment ? (
                        <div className="space-y-6">
                            {/* Payment Amount Card */}
                            <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-xl p-6 shadow-lg">
                                <div className="text-gray-400 text-sm font-medium mb-2">Payment Amount</div>
                                <div className="text-4xl font-bold tracking-tight">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(payment.amount)}
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize ${payment.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                        payment.status === 'PENDING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                                            payment.status === 'FAILED' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                                                'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                                        }`}>
                                        {payment.status.toLowerCase()}
                                    </span>
                                    <span className="text-gray-400 text-sm">• {payment.method}</span>
                                </div>
                            </div>

                            {/* Customer Information */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="h-5 w-5 text-gray-400" />
                                    <h3 className="font-semibold text-gray-900">Customer Information</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Name</div>
                                        <Link
                                            href={`/dashboard/${firmId}/customers/${payment.application.customer.id}`}
                                            className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                                        >
                                            {payment.application.customer.fullName}
                                        </Link>
                                    </div>
                                    {payment.application.customer.email && (
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Email</div>
                                            <div className="text-sm text-gray-700">{payment.application.customer.email}</div>
                                        </div>
                                    )}
                                    {payment.application.customer.phone && (
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Phone</div>
                                            <div className="text-sm text-gray-700">{payment.application.customer.phone}</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Application Information */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <FileText className="h-5 w-5 text-gray-400" />
                                    <h3 className="font-semibold text-gray-900">Application Information</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Service</div>
                                        <Link
                                            href={`/dashboard/${firmId}/applications/${payment.application.id}`}
                                            className="text-sm font-medium text-gray-900 hover:text-blue-600 hover:underline"
                                        >
                                            {payment.application.visaType} - {payment.application.targetCountry}
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Visa Type</div>
                                            <div className="text-sm text-gray-700">{payment.application.visaType}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Country</div>
                                            <div className="text-sm text-gray-700 flex items-center gap-1">
                                                <MapPin className="h-3 w-3 text-gray-400" />
                                                {payment.application.targetCountry}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                    <h3 className="font-semibold text-gray-900">Payment Details</h3>
                                </div>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Payment Method</div>
                                            <div className="text-sm text-gray-700">{payment.method}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Status</div>
                                            <div className="text-sm text-gray-700 capitalize">{payment.status.toLowerCase()}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Created</div>
                                            <div className="text-sm text-gray-700 flex items-center gap-1">
                                                <Calendar className="h-3 w-3 text-gray-400" />
                                                {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                                            </div>
                                        </div>
                                        {payment.paidAt && (
                                            <div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Paid On</div>
                                                <div className="text-sm text-gray-700">{format(new Date(payment.paidAt), 'MMM d, yyyy h:mm a')}</div>
                                            </div>
                                        )}
                                    </div>
                                    {payment.notes && (
                                        <div>
                                            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">Notes</div>
                                            <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-200">{payment.notes}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            Payment not found
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {payment && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between gap-3 shrink-0">
                        <div className="flex gap-2">
                            <button
                                disabled
                                className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                                title="Coming soon"
                            >
                                <Download className="h-4 w-4 inline mr-2" />
                                Receipt
                            </button>
                            <button
                                disabled
                                className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
                                title="Coming soon"
                            >
                                <Mail className="h-4 w-4 inline mr-2" />
                                Email
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4 inline mr-2" />
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                            <button
                                onClick={onClose}
                                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 font-medium text-sm shadow-md"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
