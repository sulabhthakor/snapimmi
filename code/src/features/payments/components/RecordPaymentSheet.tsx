'use client';

import { useState, useTransition } from 'react';
import { createPayment } from '@/features/payments/server/actions';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { Loader2, IndianRupee, X, Save } from 'lucide-react';

interface RecordPaymentSheetProps {
    applicationId: string;
    applicationTitle: string; // e.g., "Canada - Visitor Visa"
    isOpen: boolean;
    onClose: () => void;
}

export function RecordPaymentSheet({ applicationId, applicationTitle, isOpen, onClose }: RecordPaymentSheetProps) {
    const [isPending, startTransition] = useTransition();
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('UPI');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || isNaN(Number(amount))) {
            toast.error("Please enter a valid amount");
            return;
        }

        startTransition(async () => {
            const res = await createPayment({
                applicationId,
                amount: Number(amount),
                method: method as any,
                notes
            });

            if (res.success) {
                toast.success("Payment recorded successfully");
                setAmount('');
                setNotes('');
                onClose();
            } else {
                toast.error(res.error as string);
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex justify-end">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Record Payment</h2>
                        <p className="text-gray-500 text-sm mt-0.5">Add a new payment for <strong>{applicationTitle}</strong>.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="record-payment-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Amount (INR)</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full rounded-lg border-gray-300 bg-white pl-9 py-2.5 text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black shadow-sm"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Payment Method</label>
                            <CustomSelect
                                value={method}
                                onChange={(val) => setMethod(val)}
                                options={[
                                    { value: 'UPI', label: 'UPI' },
                                    { value: 'CASH', label: 'Cash' },
                                    { value: 'CARD', label: 'Card' },
                                    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                                ]}
                                placeholder="Select Method"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Notes (Optional)</label>
                            <textarea
                                placeholder="Transaction ID, specific details..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black shadow-sm resize-none"
                                rows={3}
                            />
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black">
                        Cancel
                    </button>
                    <button type="submit" form="record-payment-form" disabled={isPending} className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 font-medium inline-flex items-center gap-2 shadow-md">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Record Payment
                    </button>
                </div>
            </div>
        </div>
    );
}
