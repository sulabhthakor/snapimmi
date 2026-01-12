'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreateApplicationRequestSchema } from '../types';
import { createApplication } from '../server/actions';
import { getCustomers } from '../../customers/server/actions';
import { uploadFile } from '../../documents/server/actions';
import { Loader2, ArrowRight, ArrowLeft, Check, Search, User, Upload, FileText, X } from 'lucide-react';

// We need a definition for the customer we select
type CustomerOption = {
    id: string;
    fullName: string;
    email: string;
};

export function NewApplicationForm({ firmId }: { firmId: string }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isPending, startTransition] = useTransition();
    const [customers, setCustomers] = useState<CustomerOption[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
    const [files, setFiles] = useState<{ [key: string]: string }>({}); // Store uploaded file URLs
    const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>({});

    const form = useForm<z.infer<typeof CreateApplicationRequestSchema>>({
        resolver: zodResolver(CreateApplicationRequestSchema),
        defaultValues: {
            customerId: '',
            country: '',
            visaType: '',
            status: 'PENDING',
            priority: 'MEDIUM',
            passport: {
                number: '',
                country: '',
                expiryDate: undefined,
                fileUrl: '',
                backFileUrl: '',
            },
            visa: {
                type: '',
                country: '',
                expiryDate: undefined,
                fileUrl: '',
            },
        },
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(prev => ({ ...prev, [fieldName]: true }));

        const formData = new FormData();
        formData.append('file', file);

        try {
            const result = await uploadFile(formData);
            if (result.success && result.url) {
                setFiles(prev => ({ ...prev, [fieldName]: result.url }));
                // Update form value based on field name mapping
                if (fieldName === 'passportFront') form.setValue('passport.fileUrl', result.url);
                if (fieldName === 'passportBack') form.setValue('passport.backFileUrl', result.url);
                if (fieldName === 'visaFile') form.setValue('visa.fileUrl', result.url);
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error(error);
            alert('Upload error');
        } finally {
            setIsUploading(prev => ({ ...prev, [fieldName]: false }));
        }
    };

    // Fetch customers when searching
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            // Only fetch if step is 1
            if (step !== 1) return;

            setIsLoadingCustomers(true);
            try {
                const { data } = await getCustomers({ firmId, search: searchTerm, page: 1, limit: 5 });
                setCustomers(data.map(c => ({ id: c.id, fullName: c.fullName, email: c.email })));
            } catch (error) {
                console.error("Failed to fetch customers", error);
            } finally {
                setIsLoadingCustomers(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, firmId, step]);

    const handleSelectCustomer = (customer: CustomerOption) => {
        setSelectedCustomer(customer);
        form.setValue('customerId', customer.id);
        form.clearErrors('customerId');
    };

    const handleNext = async () => {
        if (step === 1) {
            if (!selectedCustomer) {
                form.setError('customerId', { message: 'Please select a customer' });
                return;
            }
            setStep(2);
        } else if (step === 2) {
            const isValid = await form.trigger(['country', 'visaType']); // Validate step 2 fields
            if (isValid) setStep(3);
        }
    };

    const onSubmit = (data: z.infer<typeof CreateApplicationRequestSchema>) => {
        startTransition(async () => {
            const result = await createApplication(data);
            if (result.success) {
                router.push(`/dashboard/${firmId}/applications`);
                router.refresh();
            } else {
                alert('Failed to create application');
            }
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8 gap-4">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-black font-semibold' : 'text-gray-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-black bg-black text-white' : 'border-gray-200'}`}>1</div>
                    Customer
                </div>
                <div className="h-0.5 w-8 bg-gray-100"></div>
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-black font-semibold' : 'text-gray-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-black bg-black text-white' : 'border-gray-200'}`}>2</div>
                    Details
                </div>
                <div className="h-0.5 w-8 bg-gray-100"></div>
                <div className={`flex items-center gap-2 ${step >= 3 ? 'text-black font-semibold' : 'text-gray-400'}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-black bg-black text-white' : 'border-gray-200'}`}>3</div>
                    Documents
                </div>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Customer Selection */}
                {step === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                        <h2 className="text-xl font-bold text-gray-900">Who is this application for?</h2>

                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search existing customers..."
                                className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                            {isLoadingCustomers ? (
                                <div className="text-center py-4 text-gray-400 text-sm">Loading customers...</div>
                            ) : customers.length > 0 ? (
                                customers.map((customer) => (
                                    <div
                                        key={customer.id}
                                        onClick={() => handleSelectCustomer(customer)}
                                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedCustomer?.id === customer.id
                                            ? 'border-black bg-gray-50 ring-1 ring-black/5'
                                            : 'border-gray-100 hover:border-gray-300 hover:bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                                <User className="h-5 w-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{customer.fullName}</p>
                                                <p className="text-sm text-gray-500">{customer.email}</p>
                                            </div>
                                        </div>
                                        {selectedCustomer?.id === customer.id && (
                                            <Check className="h-5 w-5 text-black" />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl">
                                    <p className="text-gray-500 mb-2">No customers found.</p>
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/dashboard/${firmId}/customers/new`)}
                                        className="text-sm font-semibold text-black hover:underline"
                                    >
                                        Create new customer
                                    </button>
                                </div>
                            )}
                        </div>

                        {form.formState.errors.customerId && (
                            <p className="text-red-500 text-sm">{form.formState.errors.customerId.message}</p>
                        )}

                        <div className="pt-4 flex justify-end">
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={!selectedCustomer}
                                className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                Next Step <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: Application Details */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
                                <User className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Selected Customer</p>
                                <p className="font-medium text-gray-900">{selectedCustomer?.fullName}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="ml-auto text-xs font-medium text-gray-500 hover:text-black"
                            >
                                Change
                            </button>
                        </div>

                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Application Type / Visa</label>
                                <input
                                    {...form.register('visaType')}
                                    placeholder="e.g. Tourist Visa, Student Visa, PR"
                                    className="w-full rounded-lg border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                                />
                                {form.formState.errors.visaType && (
                                    <p className="text-red-500 text-sm">{form.formState.errors.visaType.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Target Country</label>
                                <input
                                    {...form.register('country')}
                                    placeholder="e.g. Canada, USA, Australia"
                                    className="w-full rounded-lg border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                                />
                                {form.formState.errors.country && (
                                    <p className="text-red-500 text-sm">{form.formState.errors.country.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">Priority</label>
                                    <select
                                        {...form.register('priority')}
                                        className="w-full rounded-lg border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                                    >
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                        <option value="LOW">Low</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">Status</label>
                                    <select
                                        {...form.register('status')}
                                        className="w-full rounded-lg border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black focus:ring-1 focus:ring-black"
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="DOCUMENTS_COLLECTED">Documents Collected</option>
                                        <option value="APPLIED">Applied</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex justify-between">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-gray-600 font-medium hover:text-black flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" /> Back
                            </button>
                            <button
                                type="button"
                                onClick={handleNext}
                                className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 flex items-center gap-2"
                            >
                                Next Step <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Documents */}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">

                        {/* Passport Details Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Passport Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-900">Passport Number</label>
                                    <input {...form.register('passport.number')} className="w-full mt-1 rounded-lg border-gray-200 p-2 text-sm" placeholder="A1234567" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-900">Country of Issue</label>
                                    <input {...form.register('passport.country')} className="w-full mt-1 rounded-lg border-gray-200 p-2 text-sm" placeholder="India" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-semibold text-gray-900">Expiry Date</label>
                                    <input type="date" {...form.register('passport.expiryDate', { valueAsDate: true })} className="w-full mt-1 rounded-lg border-gray-200 p-2 text-sm" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Front Image Upload */}
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                                    {files['passportFront'] ? (
                                        <div className="flex flex-col items-center">
                                            <FileText className="h-8 w-8 text-black mb-2" />
                                            <span className="text-xs font-medium text-green-600">Uploaded</span>
                                            <button type="button" onClick={() => setFiles(prev => ({ ...prev, passportFront: '' }))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block">
                                            {isUploading['passportFront'] ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />}
                                            <span className="text-xs font-medium text-gray-600">Passport Front</span>
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'passportFront')} accept="image/*,.pdf" />
                                        </label>
                                    )}
                                </div>

                                {/* Back Image Upload */}
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                                    {files['passportBack'] ? (
                                        <div className="flex flex-col items-center">
                                            <FileText className="h-8 w-8 text-black mb-2" />
                                            <span className="text-xs font-medium text-green-600">Uploaded</span>
                                            <button type="button" onClick={() => setFiles(prev => ({ ...prev, passportBack: '' }))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block">
                                            {isUploading['passportBack'] ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />}
                                            <span className="text-xs font-medium text-gray-600">Passport Back</span>
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'passportBack')} accept="image/*,.pdf" />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Visa Details Section (Optional) */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Current Visa (Optional)</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-900">Visa Type</label>
                                    <input {...form.register('visa.type')} className="w-full mt-1 rounded-lg border-gray-200 p-2 text-sm" placeholder="e.g. Work Permit" />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-900">Country</label>
                                    <input {...form.register('visa.country')} className="w-full mt-1 rounded-lg border-gray-200 p-2 text-sm" placeholder="Issue Country" />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-semibold text-gray-900">Visa Expiry</label>
                                    <input type="date" {...form.register('visa.expiryDate', { valueAsDate: true })} className="w-full mt-1 rounded-lg border-gray-200 p-2 text-sm" />
                                </div>
                            </div>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                                {files['visaFile'] ? (
                                    <div className="flex flex-col items-center">
                                        <FileText className="h-8 w-8 text-black mb-2" />
                                        <span className="text-xs font-medium text-green-600">Uploaded</span>
                                        <button type="button" onClick={() => setFiles(prev => ({ ...prev, visaFile: '' }))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer block">
                                        {isUploading['visaFile'] ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />}
                                        <span className="text-xs font-medium text-gray-600">Upload Visa Document</span>
                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'visaFile')} accept="image/*,.pdf" />
                                    </label>
                                )}
                            </div>
                        </div>


                        <div className="pt-6 flex justify-between">
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="text-gray-600 font-medium hover:text-black flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" /> Back
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="bg-black text-white px-8 py-2.5 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                                    </>
                                ) : (
                                    <>
                                        Create Application
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
