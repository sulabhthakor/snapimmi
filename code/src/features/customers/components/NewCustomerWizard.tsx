'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreateCustomerRequestSchema, PassportSchema, VisaSchema } from '../types';
import { createCustomer } from '../server/actions';
import { useRouter, useParams } from 'next/navigation';
import { uploadFile } from '../../documents/server/actions';
import { User, FileText, Users, CheckCircle2, ChevronRight, Loader2, ArrowLeft, ArrowRight, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

// Define schemas
const Step1Schema = CreateCustomerRequestSchema.pick({ fullName: true, email: true, phone: true });
const Step2Schema = PassportSchema;
const Step3Schema = VisaSchema; // Step 3 is Visa
const Step4Schema = z.object({
    isFamilyHead: z.boolean(),
    existingFamilyId: z.string().optional(),
    newFamilyName: z.string().optional()
});

export function NewCustomerWizard() {
    const [step, setStep] = useState(1);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const params = useParams();
    const firmId = params.firmId;
    const [formData, setFormData] = useState<Partial<z.infer<typeof CreateCustomerRequestSchema>>>({});
    const [files, setFiles] = useState<{ [key: string]: string }>({});
    const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>({});

    // Forms
    const step1Form = useForm({ resolver: zodResolver(Step1Schema), defaultValues: { fullName: '', email: '', phone: '' } });
    const step2Form = useForm({
        resolver: zodResolver(Step2Schema),
        defaultValues: { number: '', country: 'India', issueDate: undefined, expiryDate: undefined, placeOfIssue: '', frontImage: '', backImage: '' }
    });
    const step3Form = useForm({
        resolver: zodResolver(Step3Schema),
        defaultValues: { country: '', type: '', grantDate: undefined, expiryDate: undefined, fileUrl: '' }
    });
    const step4Form = useForm({
        resolver: zodResolver(Step4Schema),
        defaultValues: { isFamilyHead: false, existingFamilyId: '', newFamilyName: '' }
    });

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, form: any, formField: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(prev => ({ ...prev, [fieldName]: true }));
        const fData = new FormData();
        fData.append('file', file);

        try {
            const result = await uploadFile(fData);
            if (result.success && result.url) {
                setFiles(prev => ({ ...prev, [fieldName]: result.url }));
                form.setValue(formField, result.url);
                toast.success('File uploaded successfully');
            } else {
                toast.error('Upload failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('Upload error');
        } finally {
            setIsUploading(prev => ({ ...prev, [fieldName]: false }));
        }
    };

    // Handlers
    const onSubmitStep1 = (data: any) => { setFormData(prev => ({ ...prev, ...data })); setStep(2); };

    const onSubmitStep2 = (data: any) => {
        // @ts-ignore
        setFormData(prev => ({ ...prev, passport: data }));
        setStep(3);
    };
    const handleSkipPassport = () => { setStep(3); };

    // Step 3: Visa
    const onSubmitStep3 = (data: any) => {
        if (data && data.country && data.type) {
            // @ts-ignore
            setFormData(prev => ({ ...prev, visa: data }));
        }
        setStep(4);
    };
    const handleSkipVisa = () => { setStep(4); };

    // Step 4: Family
    const onSubmitStep4 = (data: any) => {
        setFormData(prev => ({ ...prev, ...data }));
        setStep(5);
    };

    const onFinalSubmit = () => {
        startTransition(async () => {
            const finalData = {
                ...formData,
                fullName: formData.fullName!,
                phone: formData.phone!,
                isFamilyHead: formData.isFamilyHead || false,
                passport: formData.passport,
                visa: formData.visa
            } as z.infer<typeof CreateCustomerRequestSchema>;

            const result = await createCustomer(finalData);
            if (result.success) {
                toast.success('Customer created successfully');
                router.push(`/dashboard/${firmId}/customers`);
            } else {
                toast.error('Failed to create customer');
            }
        });
    };

    const steps = [
        { id: 1, title: 'Basic Info', icon: User },
        { id: 2, title: 'Passport', icon: FileText },
        { id: 3, title: 'Visa', icon: FileText },
        { id: 4, title: 'Family', icon: Users },
        { id: 5, title: 'Review', icon: CheckCircle2 },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Steps Timeline */}
            <div className="mb-12">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 -z-10" />
                    {steps.map((s) => {
                        const isActive = step >= s.id;
                        const isCurrent = step === s.id;
                        return (
                            <div key={s.id} className="flex flex-col items-center gap-2 bg-gray-50 px-2 cursor-pointer" onClick={() => step > s.id && setStep(s.id)}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                                    <s.icon className="h-4 w-4" />
                                </div>
                                <span className={`text-xs font-medium ${isCurrent ? 'text-black' : 'text-gray-500'}`}>{s.title}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 ring-1 ring-gray-900/5 overflow-hidden">
                <div className="p-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900">{steps[step - 1].title}</h2>
                        <p className="text-gray-500 mt-1">
                            {step === 1 && "Create a new profile for your client."}
                            {step === 2 && "Add passport details and upload document."}
                            {step === 3 && "Add current visa details if applicable."}
                            {step === 4 && "Group this client with family members."}
                            {step === 5 && "Review details before creating."}
                        </p>
                    </div>

                    {step === 1 && (
                        <form onSubmit={step1Form.handleSubmit(onSubmitStep1)} className="space-y-6">
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">Full Name <span className="text-red-500">*</span></label>
                                    <input {...step1Form.register('fullName')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm" placeholder="e.g. Rahul Sharma" />
                                    {step1Form.formState.errors.fullName && <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.fullName.message}</p>}
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-900">Phone <span className="text-red-500">*</span></label>
                                        <input {...step1Form.register('phone')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm" placeholder="+91 98765 43210" />
                                        {step1Form.formState.errors.phone && <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.phone.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-900">Email</label>
                                        <input {...step1Form.register('email')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm" placeholder="client@example.com" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-6 border-t border-gray-50">
                                <button type="submit" className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-medium inline-flex items-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                    Next Step <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={step2Form.handleSubmit(onSubmitStep2)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">Passport Number <span className="text-red-500">*</span></label>
                                    <input {...step2Form.register('number')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm uppercase placeholder:normal-case" placeholder="A1234567" />
                                    {step2Form.formState.errors.number && <p className="text-red-500 text-sm mt-1">{step2Form.formState.errors.number.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">Issuing Country <span className="text-red-500">*</span></label>
                                    <input {...step2Form.register('country')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">Date of Issue</label>
                                    <input type="date" {...step2Form.register('issueDate')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">Date of Expiry</label>
                                    <input type="date" {...step2Form.register('expiryDate')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Place of Issue</label>
                                <input {...step2Form.register('placeOfIssue')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm" />
                            </div>

                            {/* File Uploads */}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                                    {files['passportFront'] ? (
                                        <div className="flex flex-col items-center">
                                            <FileText className="h-8 w-8 text-black mb-2" />
                                            <span className="text-xs font-medium text-green-600">Front Uploaded</span>
                                            <button type="button" onClick={() => setFiles(prev => ({ ...prev, passportFront: '' }))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block">
                                            {isUploading['passportFront'] ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />}
                                            <span className="text-xs font-medium text-gray-600">Passport Front</span>
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'passportFront', step2Form, 'frontImage')} accept="image/*,.pdf" />
                                        </label>
                                    )}
                                </div>
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                                    {files['passportBack'] ? (
                                        <div className="flex flex-col items-center">
                                            <FileText className="h-8 w-8 text-black mb-2" />
                                            <span className="text-xs font-medium text-green-600">Back Uploaded</span>
                                            <button type="button" onClick={() => setFiles(prev => ({ ...prev, passportBack: '' }))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer block">
                                            {isUploading['passportBack'] ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />}
                                            <span className="text-xs font-medium text-gray-600">Passport Back</span>
                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'passportBack', step2Form, 'backImage')} accept="image/*,.pdf" />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between pt-6 border-t border-gray-50 items-center">
                                <button type="button" onClick={handleSkipPassport} className="text-gray-500 text-sm hover:text-black font-medium px-4">Skip for now</button>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(1)} className="px-6 py-3 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-medium text-gray-700 transition-all">Back</button>
                                    <button type="submit" className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-medium inline-flex items-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                        Next Step <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={step3Form.handleSubmit(onSubmitStep3)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">Visa Type <span className="text-red-500">*</span></label>
                                    <input {...step3Form.register('type')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm" placeholder="e.g. Student, Work" />
                                    {step3Form.formState.errors.type && <p className="text-red-500 text-sm mt-1">{step3Form.formState.errors.type.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">Country <span className="text-red-500">*</span></label>
                                    <input {...step3Form.register('country')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm" placeholder="e.g. Canada" />
                                    {step3Form.formState.errors.country && <p className="text-red-500 text-sm mt-1">{step3Form.formState.errors.country.message}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">Grant Date</label>
                                    <input type="date" {...step3Form.register('grantDate')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">Expiry Date</label>
                                    <input type="date" {...step3Form.register('expiryDate')} className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm" />
                                </div>
                            </div>

                            {/* Visa File Upload */}
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                                {files['visaFile'] ? (
                                    <div className="flex flex-col items-center">
                                        <FileText className="h-8 w-8 text-black mb-2" />
                                        <span className="text-xs font-medium text-green-600">Vista Copy Uploaded</span>
                                        <button type="button" onClick={() => setFiles(prev => ({ ...prev, visaFile: '' }))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                                    </div>
                                ) : (
                                    <label className="cursor-pointer block">
                                        {isUploading['visaFile'] ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />}
                                        <span className="text-xs font-medium text-gray-600">Upload Visa Copy (Optional)</span>
                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'visaFile', step3Form, 'fileUrl')} accept="image/*,.pdf" />
                                    </label>
                                )}
                            </div>

                            <div className="flex justify-between pt-6 border-t border-gray-50 items-center">
                                <button type="button" onClick={handleSkipVisa} className="text-gray-500 text-sm hover:text-black font-medium px-4">Skip for now</button>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setStep(2)} className="px-6 py-3 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-medium text-gray-700 transition-all">Back</button>
                                    <button type="submit" className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-medium inline-flex items-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                        Next Step <ArrowRight className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {step === 4 && (
                        <form onSubmit={step4Form.handleSubmit(onSubmitStep4)} className="space-y-8">
                            <div className="space-y-4">
                                <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${step4Form.watch('isFamilyHead') ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <input type="checkbox" {...step4Form.register('isFamilyHead')} className="mt-1 h-5 w-5 text-black border-gray-300 rounded focus:ring-black" />
                                    <div>
                                        <div className="font-semibold text-gray-900">Set as Family Head</div>
                                        <div className="text-sm text-gray-500">This customer will be the primary contact for a new family group.</div>
                                    </div>
                                </label>

                                <div className={`relative p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 transition-opacity ${step4Form.watch('isFamilyHead') ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Join Existing Family</h3>
                                    <input {...step4Form.register('existingFamilyId')} placeholder="Search family name..." className="w-full rounded-lg border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm" />
                                    <p className="text-xs text-gray-500 mt-2">Leave blank if this is an individual customer with no family group.</p>
                                </div>
                            </div>

                            <div className="flex justify-between pt-6 border-t border-gray-50">
                                <button type="button" onClick={() => setStep(3)} className="px-6 py-3 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-medium text-gray-700 transition-all">Back</button>
                                <button type="submit" className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-medium inline-flex items-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                    Review Details <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 5 && (
                        <div className="space-y-8">
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Full Name</div>
                                        <div className="font-medium text-gray-900">{formData.fullName}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Contact</div>
                                        <div className="font-medium text-gray-900">{formData.phone}</div>
                                        <div className="text-gray-500">{formData.email}</div>
                                    </div>
                                    {formData.passport && (
                                        <div className="col-span-2 pt-4 border-t border-gray-200 mt-2">
                                            <div className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Passport Details</div>
                                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-gray-400" />
                                                {formData.passport.number}
                                                <span className="text-gray-400">({formData.passport.country})</span>
                                            </div>
                                        </div>
                                    )}
                                    {formData.visa && (
                                        <div className="col-span-2 pt-4 border-t border-gray-200 mt-2">
                                            <div className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Visa Details</div>
                                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-gray-400" />
                                                {formData.visa.type}
                                                <span className="text-gray-400">({formData.visa.country})</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="col-span-2 pt-4 border-t border-gray-200 mt-2">
                                        <div className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Family Structure</div>
                                        <div className="font-medium text-gray-900">
                                            {formData.isFamilyHead ? 'Creating New Family Group' : (formData.existingFamilyId ? 'Joining Existing Group' : 'Individual Account')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between pt-6 border-t border-gray-50">
                                <button onClick={() => setStep(4)} className="px-6 py-3 rounded-lg border border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-medium text-gray-700 transition-all" disabled={isPending}>Back</button>
                                <button onClick={onFinalSubmit} className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-500 font-medium shadow-lg shadow-green-100 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 transition-all transform hover:-translate-y-0.5">
                                    {isPending ? (
                                        <><Loader2 className="h-4 w-4 animate-spin" /> Creating Profile...</>
                                    ) : (
                                        <>Confirm & Create <CheckCircle2 className="h-4 w-4" /></>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
