'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PassportSchema } from '../types';
import { updateCustomer } from '../server/actions';
import { uploadFile } from '../../documents/server/actions';
import { Loader2, Upload, X, FileText, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
                toast.success('File uploaded successfully');
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
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            {/* Sheet */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Edit Passport</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <form id="passport-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Number</label>
                                <input {...form.register('number')} className="w-full rounded-lg border-gray-300 p-2.5 text-sm uppercase" placeholder="A1234567" />
                                {form.formState.errors.number && <p className="text-red-500 text-xs">{form.formState.errors.number.message as string}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Country</label>
                                <input {...form.register('country')} className="w-full rounded-lg border-gray-300 p-2.5 text-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Issue Date</label>
                                <input type="date" {...form.register('issueDate')} className="w-full rounded-lg border-gray-300 p-2.5 text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Expiry Date</label>
                                <input type="date" {...form.register('expiryDate')} className="w-full rounded-lg border-gray-300 p-2.5 text-sm" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Place of Issue</label>
                            <input {...form.register('placeOfIssue')} className="w-full rounded-lg border-gray-300 p-2.5 text-sm" />
                        </div>

                        {/* File Uploads */}
                        <div className="space-y-4 pt-2">
                            <label className="text-sm font-medium text-gray-700">Passport Scans</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 relative">
                                    {files.front ? (
                                        <>
                                            <FileText className="h-6 w-6 text-blue-600" />
                                            <span className="text-xs font-medium text-green-600">Front Added</span>
                                            <button type="button" onClick={() => { setFiles(p => ({ ...p, front: '' })); form.setValue('frontImage', ''); }} className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer text-center w-full h-full flex flex-col items-center justify-center">
                                            {isUploading.front ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 text-gray-400" />}
                                            <span className="text-xs text-gray-500 mt-1">Front Page</span>
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'front')} accept="image/*,.pdf" />
                                        </label>
                                    )}
                                </div>
                                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 relative">
                                    {files.back ? (
                                        <>
                                            <FileText className="h-6 w-6 text-blue-600" />
                                            <span className="text-xs font-medium text-green-600">Back Added</span>
                                            <button type="button" onClick={() => { setFiles(p => ({ ...p, back: '' })); form.setValue('backImage', ''); }} className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                                        </>
                                    ) : (
                                        <label className="cursor-pointer text-center w-full h-full flex flex-col items-center justify-center">
                                            {isUploading.back ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5 text-gray-400" />}
                                            <span className="text-xs text-gray-500 mt-1">Back Page</span>
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'back')} accept="image/*,.pdf" />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button type="submit" form="passport-form" disabled={isPending} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
