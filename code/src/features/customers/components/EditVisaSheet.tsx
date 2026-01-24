'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { VisaSchema } from '../types';
import { updateCustomer } from '../server/actions';
import { uploadFile } from '../../documents/server/actions';
import { Loader2, Upload, X, FileText, Save, Globe, Calendar, CheckCircle2, FileBadge, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EditVisaSheetProps {
    customer: any;
    isOpen: boolean;
    onClose: () => void;
}

export function EditVisaSheet({ customer, isOpen, onClose }: EditVisaSheetProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Attempt to find most recent/active visa
    const existingVisa = customer.visas?.[0];

    const [fileUrl, setFileUrl] = useState<string>(existingVisa?.fileUrl || '');
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm({
        resolver: zodResolver(VisaSchema),
        defaultValues: {
            country: existingVisa?.country || '',
            number: existingVisa?.number || '',
            type: existingVisa?.type || '',
            grantDate: existingVisa?.grantDate ? new Date(existingVisa.grantDate).toISOString().split('T')[0] : '',
            expiryDate: existingVisa?.expiryDate ? new Date(existingVisa.expiryDate).toISOString().split('T')[0] : '',
            fileUrl: existingVisa?.fileUrl || ''
        }
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const fData = new FormData();
        fData.append('file', file);

        try {
            const result = await uploadFile(fData);
            if (result.success && result.url) {
                setFileUrl(result.url);
                form.setValue('fileUrl', result.url);
                toast.success('File uploaded');
            }
        } catch (error) {
            console.error(error);
            toast.error('Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = (data: any) => {
        startTransition(async () => {
            const payload = {
                id: customer.id,
                fullName: customer.fullName,
                phone: customer.phone || '', // Required by schema
                visa: data
            };

            // @ts-ignore
            const result = await updateCustomer(payload);
            if (result.success) {
                onClose();
                router.refresh();
                toast.success('Visa updated successfully');
            } else {
                toast.error('Failed to update visa');
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Visa Details</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    <form id="visa-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* Visa Info Section */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
                                Visa Info
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Visa Number</label>
                                    <div className="relative group">
                                        <Hash className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            {...form.register('number')}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-emerald-500 rounded-lg text-sm font-medium transition-all outline-none placeholder:text-gray-400"
                                            placeholder="V12345678"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Type</label>
                                    <div className="relative group">
                                        <FileBadge className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            {...form.register('type')}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-emerald-500 rounded-lg text-sm transition-all outline-none"
                                            placeholder="Student"
                                        />
                                    </div>
                                    {form.formState.errors.type && <p className="text-red-500 text-xs pl-1">{form.formState.errors.type.message as string}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Country</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                                        <input
                                            {...form.register('country')}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-emerald-500 rounded-lg text-sm transition-all outline-none"
                                            placeholder="Canada"
                                        />
                                    </div>
                                    {form.formState.errors.country && <p className="text-red-500 text-xs pl-1">{form.formState.errors.country.message as string}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Validity Section */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1 h-3 bg-teal-500 rounded-full"></span>
                                Validity
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Grant Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                                        <input
                                            type="date"
                                            {...form.register('grantDate')}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-teal-500 rounded-lg text-sm transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Expiry Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400 group-focus-within:text-teal-500 transition-colors" />
                                        <input
                                            type="date"
                                            {...form.register('expiryDate')}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-teal-500 rounded-lg text-sm transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* File Upload Section */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 px-1">
                                <span className="w-1 h-3 bg-slate-800 rounded-full"></span>
                                Document
                            </h3>

                            <div className={cn(
                                "relative border border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group overflow-hidden bg-white hover:bg-gray-50",
                                fileUrl ? "border-emerald-200 bg-emerald-50/30" : "border-gray-300"
                            )}>
                                {fileUrl ? (
                                    <>
                                        <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-1">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-emerald-900">Visa Added</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); setFileUrl(''); form.setValue('fileUrl', ''); }}
                                            className="absolute top-2 right-2 p-1 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-sm transition-colors z-10"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </>
                                ) : (
                                    <label className="cursor-pointer text-center w-full h-full flex flex-col items-center justify-center z-0">
                                        <Upload className="h-5 w-5 text-gray-400 group-hover:text-emerald-500 mb-1" />
                                        <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">Upload Visa</span>
                                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
                                    </label>
                                )}
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-white z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="visa-form"
                        disabled={isPending}
                        className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
