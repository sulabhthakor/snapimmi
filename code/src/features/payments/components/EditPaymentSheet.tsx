'use client';

import { useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { updatePayment } from '@/features/revenue/server/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface EditPaymentSheetProps {
    payment: any;
    isOpen: boolean;
    onClose: () => void;
}

const PAYMENT_METHODS = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE'];
const PAYMENT_STATUSES = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];

export function EditPaymentSheet({ payment, isOpen, onClose }: EditPaymentSheetProps) {
    const [amount, setAmount] = useState(payment?.amount || 0);
    const [method, setMethod] = useState(payment?.method || 'CASH');
    const [status, setStatus] = useState(payment?.status || 'PENDING');
    const [notes, setNotes] = useState(payment?.notes || '');
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        if (!payment?.id) return;

        setIsSaving(true);
        const result = await updatePayment({
            id: payment.id,
            amount: parseFloat(amount.toString()),
            method,
            status,
            notes
        });

        if (result.success) {
            toast.success('Payment updated successfully');
            router.refresh();
            onClose();
        } else {
            toast.error(result.error || 'Failed to update payment');
        }
        setIsSaving(false);
    };

    if (!isOpen || !payment) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative w-full max-w-xl bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Edit Payment</h2>
                        <p className="text-xs text-gray-500 mt-1">Update payment details</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Amount (INR)
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                step="0.01"
                                min="0"
                                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Payment Method */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Payment Method
                            </label>
                            <CustomSelect
                                value={method}
                                onChange={setMethod}
                                options={PAYMENT_METHODS.map(m => ({ value: m, label: m.replace('_', ' ') }))}
                                placeholder="Select Method"
                            />
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Status
                            </label>
                            <CustomSelect
                                value={status}
                                onChange={setStatus}
                                options={PAYMENT_STATUSES.map(s => ({ value: s, label: s }))}
                                placeholder="Select Status"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Changing status will update the payment record
                            </p>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                placeholder="Add notes about this payment..."
                            />
                        </div>

                        {/* Warning for Status Changes */}
                        {status !== payment.status && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex gap-2">
                                    <div className="text-amber-600">
                                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-amber-800">Status Change</div>
                                        <div className="text-xs text-amber-700 mt-1">
                                            You are changing the status from <strong>{payment.status}</strong> to <strong>{status}</strong>. This action will be recorded.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 font-medium text-sm shadow-md inline-flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
