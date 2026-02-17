'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PassportSchema } from '../types';
import { updateCustomer } from '../server/actions';
import { uploadFile } from '../../documents/server/actions';
import { Loader2, Upload, X, FileText, Save, Globe, Calendar, MapPin, Hash, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EditPassportSheetProps {
    customer: any;
    isOpen: boolean;
    onClose: () => void;
}

export function EditPassportSheet({ customer, isOpen, onClose }: EditPassportSheetProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [files, setFiles] = useState<{ front?: string, back?: string }>({
        front: customer.passports?.[0]?.frontImage || '',
        back: customer.passports?.[0]?.backImage || ''
    });
    const [isUploading, setIsUploading] = useState<{ front: boolean, back: boolean }>({ front: false, back: false });

    // Use existing passport if available
    const existingPassport = customer.passports?.[0];

    const form = useForm({
        resolver: zodResolver(PassportSchema),
        defaultValues: {
            number: existingPassport?.number || '',
            country: existingPassport?.country || '',
            issueDate: existingPassport?.issueDate ? new Date(existingPassport.issueDate).toISOString().split('T')[0] : '',
            expiryDate: existingPassport?.expiryDate ? new Date(existingPassport.expiryDate).toISOString().split('T')[0] : '',
            placeOfIssue: existingPassport?.placeOfIssue || '',
            frontImage: existingPassport?.frontImage || '',
            backImage: existingPassport?.backImage || ''
        }
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(prev => ({ ...prev, [type]: true }));
        const fData = new FormData();
        fData.append('file', file);

        try {
            const result = await uploadFile(fData);
            if (result.success && result.url) {
                setFiles(prev => ({ ...prev, [type]: result.url }));
                form.setValue(type === 'front' ? 'frontImage' : 'backImage', result.url);
                toast.success('File uploaded');
            }
        } catch (error) {
            console.error(error);
            toast.error('Upload failed');
        } finally {
            setIsUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    const onSubmit = (data: any) => {
        startTransition(async () => {
            const payload = {
                id: customer.id,
                fullName: customer.fullName,
                phone: customer.phone || '', // Required by schema
                passport: data
            };

            // @ts-ignore
            const result = await updateCustomer(payload);
            if (result.success) {
                onClose();
                router.refresh();
                toast.success('Passport updated successfully');
            } else {
                toast.error('Failed to update passport');
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
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Passport Details</h2>
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
                    <form id="passport-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        {/* Primary Info Section */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1 h-3 bg-primary-teal-600 rounded-full"></span>
                                Identity
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2 space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Passport Number</label>
                                    <div className="relative group">
                                        <Hash className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            {...form.register('number')}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg text-sm font-medium transition-all outline-none uppercase placeholder:text-gray-400"
                                            placeholder="A1234567"
                                        />
                                    </div>
                                    {form.formState.errors.number && <p className="text-red-500 text-xs pl-1">{form.formState.errors.number.message as string}</p>}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Country</label>
                                    <div className="relative group">
                                        <Globe className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            {...form.register('country')}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg text-sm transition-all outline-none"
                                            placeholder="India"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Place of Issue</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            {...form.register('placeOfIssue')}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-blue-500 rounded-lg text-sm transition-all outline-none"
                                            placeholder="Mumbai"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Dates Section */}
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                <span className="w-1 h-3 bg-primary-teal-600 rounded-full"></span>
                                Validity
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Issue Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            type="date"
                                            {...form.register('issueDate')}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-indigo-500 rounded-lg text-sm transition-all outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Expiry Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                        <input
                                            type="date"
                                            {...form.register('expiryDate')}
                                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border-transparent focus:bg-white border focus:border-indigo-500 rounded-lg text-sm transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* File Uploads Section */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 px-1">
                                <span className="w-1 h-3 bg-slate-800 rounded-full"></span>
                                Scans
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Front Upload */}
                                <div className={cn(
                                    "relative border border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group overflow-hidden bg-white hover:bg-gray-50",
                                    files.front ? "border-primary-teal-200 bg-primary-teal-50/30" : "border-gray-300"
                                )}>
                                    {files.front ? (
                                        <>
                                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-bold text-blue-900">Front Added</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setFiles(p => ({ ...p, front: '' })); form.setValue('frontImage', ''); }}
                                                className="absolute top-1 right-1 p-1 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-sm transition-colors z-10"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer text-center w-full h-full flex flex-col items-center justify-center z-0">
                                            <Upload className="h-4 w-4 text-gray-400 group-hover:text-blue-500 mb-1" />
                                            <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">Front Page</span>
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'front')} accept="image/*,.pdf" />
                                        </label>
                                    )}
                                </div>

                                {/* Back Upload */}
                                <div className={cn(
                                    "relative border border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer group overflow-hidden bg-white hover:bg-gray-50",
                                    files.back ? "border-primary-teal-200 bg-primary-teal-50/30" : "border-gray-300"
                                )}>
                                    {files.back ? (
                                        <>
                                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-bold text-blue-900">Back Added</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); setFiles(p => ({ ...p, back: '' })); form.setValue('backImage', ''); }}
                                                className="absolute top-1 right-1 p-1 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full shadow-sm transition-colors z-10"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer text-center w-full h-full flex flex-col items-center justify-center z-0">
                                            <Upload className="h-4 w-4 text-gray-400 group-hover:text-blue-500 mb-1" />
                                            <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900">Back Page</span>
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'back')} accept="image/*,.pdf" />
                                        </label>
                                    )}
                                </div>
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
                        form="passport-form"
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
