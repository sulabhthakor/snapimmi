'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { VisaSchema } from '../types';
import { updateCustomer } from '../server/actions';
import { uploadFile } from '../../documents/server/actions';
import { Loader2, Upload, X, FileText, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
                toast.success('File uploaded successfully');
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
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            {/* Sheet */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Edit Visa</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="visa-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Type</label>
                                <input {...form.register('type')} className="w-full rounded-lg border-gray-300 p-2.5 text-sm" placeholder="e.g. Student" />
                                {form.formState.errors.type && <p className="text-red-500 text-xs">{form.formState.errors.type.message as string}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Country</label>
                                <input {...form.register('country')} className="w-full rounded-lg border-gray-300 p-2.5 text-sm" placeholder="e.g. Canada" />
                                {form.formState.errors.country && <p className="text-red-500 text-xs">{form.formState.errors.country.message as string}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Grant Date</label>
                                <input type="date" {...form.register('grantDate')} className="w-full rounded-lg border-gray-300 p-2.5 text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                                <input type="date" {...form.register('expiryDate')} className="w-full rounded-lg border-gray-300 p-2.5 text-sm" />
                            </div>
                        </div>

                        {/* File Upload */}
                        <div className="space-y-2 pt-2">
                            <label className="text-sm font-medium text-gray-700">Visa Document</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 relative">
                                {fileUrl ? (
                                    <>
                                        <FileText className="h-8 w-8 text-blue-600" />
                                        <span className="text-sm font-medium text-green-600">Document Attached</span>
                                        <button type="button" onClick={() => { setFileUrl(''); form.setValue('fileUrl', ''); }} className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                    </>
                                ) : (
                                    <label className="cursor-pointer text-center w-full h-full flex flex-col items-center justify-center">
                                        {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Upload className="h-6 w-6 text-gray-400" />}
                                        <span className="text-sm text-gray-500 mt-2">Upload Visa Copy</span>
                                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
                                    </label>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button type="submit" form="visa-form" disabled={isPending} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
