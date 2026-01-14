'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Application, UpdateApplicationRequestSchema } from '../types';
import { updateApplication } from '../server/actions';
import { Loader2, X, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface EditApplicationSheetProps {
    application: Application;
    isOpen: boolean;
    onClose: () => void;
}

export function EditApplicationSheet({ application, isOpen, onClose }: EditApplicationSheetProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(UpdateApplicationRequestSchema),
        defaultValues: {
            id: application.id,
            country: application.country,
            visaType: application.visaType,
            status: application.status,
            priority: application.priority,
            notes: '', // Note: Application type currently doesn't expose notes in Kanban, might need to fetch or add to type
        }
    });

    const onSubmit = (data: any) => {
        startTransition(async () => {
            const result = await updateApplication(data);
            if (result.success) {
                onClose();
                router.refresh();
                toast.success('Application updated successfully');
            } else {
                toast.error('Failed to update application');
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Edit Application</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="edit-app-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Visa Type</label>
                            <input {...form.register('visaType')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black shadow-sm" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Target Country</label>
                            <input {...form.register('country')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black shadow-sm" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Status</label>
                                <select {...form.register('status')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black shadow-sm">
                                    <option value="PENDING">Pending</option>
                                    <option value="DOCUMENTS_COLLECTED">Documents Collected</option>
                                    <option value="APPLIED">Applied</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="REJECTED">Rejected</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Priority</label>
                                <select {...form.register('priority')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black shadow-sm">
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-900">Notes & Remarks</label>
                            <textarea {...form.register('notes')} rows={4} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-black focus:ring-1 focus:ring-black shadow-sm resize-none" placeholder="Add internal notes..." />
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black">Cancel</button>
                    <button type="submit" form="edit-app-form" disabled={isPending} className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 font-medium inline-flex items-center gap-2 shadow-md">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
