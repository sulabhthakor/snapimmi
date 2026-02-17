'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreateCustomerRequestSchema, PassportSchema, VisaSchema } from '../types';
import { createCustomer } from '../server/actions';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { uploadFile } from '../../documents/server/actions';
import { User, FileText, Users, CheckCircle2, Loader2, ArrowLeft, ArrowRight, Save, Plus } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { toast } from 'sonner';
import { VISA_TYPES, COUNTRIES } from '../../applications/constants';

// --- Schemas ---

// Step 1: Basics
const Step1Schema = CreateCustomerRequestSchema.pick({ fullName: true, email: true, phone: true });

// Step 2: Documents (Combined)
const Step2Schema = z.object({
    passport: PassportSchema.optional(),
    visa: VisaSchema.optional(),
});

// Step 3: Family
const Step3Schema = z.object({
    isFamilyHead: z.boolean(),
    existingFamilyId: z.string().optional(),
    newFamilyName: z.string().optional()
});

export function NewCustomerWizard() {
    const [step, setStep] = useState(1);

    // Family Loop State
    const [lastCreatedFamilyId, setLastCreatedFamilyId] = useState<string | null>(null);

    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const params = useParams();
    const firmId = params.firmId;

    // Global Form Data Accumulator
    const [formData, setFormData] = useState<Partial<z.infer<typeof CreateCustomerRequestSchema>>>({});

    // UI States for Step 2
    const [showPassport, setShowPassport] = useState(false);
    const [showVisa, setShowVisa] = useState(false);

    // File Upload States
    const [files, setFiles] = useState<{ [key: string]: string }>({});
    const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>({});

    // --- Forms ---
    const step1Form = useForm({
        resolver: zodResolver(Step1Schema),
        defaultValues: { fullName: '', email: '', phone: '' }
    });

    const step2Form = useForm({
        resolver: zodResolver(Step2Schema),
        defaultValues: {
            passport: undefined,
            visa: undefined,
        }
    });

    const searchParams = useSearchParams();
    const urlFamilyId = searchParams.get('existingFamilyId');
    // const urlFamilyName = searchParams.get('newFamilyName'); // Optional: active if needed for display

    const step3Form = useForm({
        resolver: zodResolver(Step3Schema),
        defaultValues: {
            isFamilyHead: false,
            existingFamilyId: urlFamilyId || '',
            newFamilyName: ''
        }
    });

    // Auto-fill family ID if we are in a loop or have URL param
    const effectiveFamilyId = lastCreatedFamilyId || urlFamilyId;

    if (effectiveFamilyId && step === 3) {
        // Ensure form has the value if it's missing (e.g. user navigated back and forth)
        const current = step3Form.getValues('existingFamilyId');
        if (!current) {
            step3Form.setValue('existingFamilyId', effectiveFamilyId);
        }
    }

    // --- Actions ---

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, form: any, formPath: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(prev => ({ ...prev, [fieldName]: true }));
        const fData = new FormData();
        fData.append('file', file);

        try {
            const result = await uploadFile(fData);
            if (result.success && result.url) {
                setFiles(prev => ({ ...prev, [fieldName]: result.url }));
                form.setValue(formPath, result.url);
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

    const submitData = async (data: Partial<z.infer<typeof CreateCustomerRequestSchema>>, addAnotherMember: boolean = false) => {
        startTransition(async () => {
            const finalPayload = {
                ...formData,
                ...data,
                // Ensure defaults
                fullName: data.fullName || formData.fullName!,
                phone: data.phone || formData.phone!,
            } as z.infer<typeof CreateCustomerRequestSchema>;

            // Clean up: If showPassport is false, remove passport data (even if entered previously)
            if (!showPassport) delete finalPayload.passport;
            if (!showVisa) delete finalPayload.visa;

            // If looping, ensure we force the family connection if not explicitly set
            if (addAnotherMember && lastCreatedFamilyId && !finalPayload.existingFamilyId) {
                finalPayload.existingFamilyId = lastCreatedFamilyId;
            }

            const result = await createCustomer(finalPayload);
            if (result.success) {
                if (addAnotherMember) {
                    // LOOP LOGIC
                    toast.success('Member added! Ready for next person.');

                    // Capture Family ID
                    const newFamilyId = (result.data as any).familyGroupId;
                    setLastCreatedFamilyId(newFamilyId);

                    // Reset Forms
                    step1Form.reset();
                    step2Form.reset();
                    step3Form.reset({ isFamilyHead: false, existingFamilyId: newFamilyId, newFamilyName: '' });
                    setFiles({});
                    setShowPassport(false);
                    setShowVisa(false);
                    setFormData({});

                    // Go to Step 1
                    setStep(1);
                } else {
                    toast.success('Customer profile created');
                    router.push(`/dashboard/${firmId}/customers`);
                }
            } else {
                toast.error('Failed to create customer');
                console.error(result.error);
            }
        });
    };

    // Step 1: Next / Save Early
    const onSubmitStep1 = (data: z.infer<typeof Step1Schema>) => {
        setFormData(prev => ({ ...prev, ...data }));
        setStep(2);
    };

    const onSaveLead = (data: z.infer<typeof Step1Schema>) => {
        submitData(data);
    };

    // Step 2: Next
    const onSubmitStep2 = (data: z.infer<typeof Step2Schema>) => {
        const update = { ...formData };
        if (showPassport && data.passport) update.passport = data.passport;
        if (showVisa && data.visa) update.visa = data.visa;

        setFormData(update);
        setStep(3);
    };

    // Step 3: Finish
    const onSubmitStep3 = (data: z.infer<typeof Step3Schema>) => {
        submitData(data, false);
    };

    const onSaveAndAddMember = (data: z.infer<typeof Step3Schema>) => {
        submitData(data, true);
    }

    const steps = [
        { id: 1, title: 'Profile', icon: User },
        { id: 2, title: 'Travel Docs', icon: FileText },
        { id: 3, title: 'Family', icon: Users },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Steps Timeline */}
            <div className="mb-10">
                <div className="flex items-center justify-between relative max-w-2xl mx-auto">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 -z-10" />
                    {steps.map((s) => {
                        const isActive = step >= s.id;
                        const isCurrent = step === s.id;
                        return (
                            <div key={s.id} className="flex flex-col items-center gap-2 bg-gray-50 px-4 cursor-pointer" onClick={() => step > s.id && setStep(s.id)}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? 'bg-black border-black text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                                    <s.icon className="h-4 w-4" />
                                </div>
                                <span className={`text-xs font-medium ${isCurrent ? 'text-black' : 'text-gray-500'}`}>{s.title}</span>
                            </div>
                        )
                    })}
                </div>
                {effectiveFamilyId && (
                    <div className="mt-4 text-center">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-teal-50 text-primary-teal-700 text-sm font-medium">
                            <Users className="h-3 w-3" /> Adding members to family group
                        </span>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 ring-1 ring-gray-900/5 overflow-hidden">
                <div className="p-8">

                    {/* Step 1: Profile */}
                    {step === 1 && (
                        <form onSubmit={step1Form.handleSubmit(onSubmitStep1)} className="space-y-6">
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-gray-900">Let's start with the basics</h2>
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-900">Full Name <span className="text-red-500">*</span></label>
                                        <input {...step1Form.register('fullName')} className="w-full" placeholder="e.g. Rahul Sharma" />
                                        {step1Form.formState.errors.fullName && <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.fullName.message}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-900">Phone <span className="text-red-500">*</span></label>
                                            <input {...step1Form.register('phone')} className="w-full" placeholder="+91 98765 43210" />
                                            {step1Form.formState.errors.phone && <p className="text-red-500 text-sm mt-1">{step1Form.formState.errors.phone.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-900">Email</label>
                                            <input {...step1Form.register('email')} className="w-full" placeholder="client@example.com" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <button
                                    type="button"
                                    onClick={step1Form.handleSubmit(onSaveLead)}
                                    disabled={isPending}
                                    className="text-gray-600 hover:text-black hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    {isPending ? 'Saving...' : 'Save as Lead & Exit'}
                                </button>

                                <button type="submit" className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-medium inline-flex items-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                    Continue <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 2: Travel Docs */}
                    {step === 2 && (
                        <form onSubmit={step2Form.handleSubmit(onSubmitStep2)} className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Travel Documents</h2>

                                {/* Passport Section */}
                                <div className={`p-4 rounded-xl border-2 transition-all mb-6 ${showPassport ? 'border-black bg-gray-50' : 'border-gray-100 bg-white'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                                                <FileText className="h-5 w-5 text-gray-900" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">Passport Details</h3>
                                                <p className="text-xs text-gray-500">Required for most applications</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={showPassport} onChange={e => setShowPassport(e.target.checked)} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                        </label>
                                    </div>

                                    {showPassport && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-gray-900">Number <span className="text-red-500">*</span></label>
                                                    <input {...step2Form.register('passport.number')} className="w-full" placeholder="A1234567" />
                                                    {step2Form.formState.errors.passport?.number && <p className="text-red-500 text-xs">{step2Form.formState.errors.passport.number.message}</p>}
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-gray-900">Country <span className="text-red-500">*</span></label>
                                                    <Controller
                                                        name="passport.country"
                                                        control={step2Form.control}
                                                        render={({ field }) => (
                                                            <CustomSelect
                                                                value={field.value ?? ''}
                                                                onChange={field.onChange}
                                                                options={COUNTRIES.map(c => ({ value: c, label: c }))}
                                                                placeholder="Select Country"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-gray-900">Issue Date <span className="text-red-500">*</span></label>
                                                    <input type="date" {...step2Form.register('passport.issueDate')} className="w-full" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-gray-900">Expiry Date <span className="text-red-500">*</span></label>
                                                    <input type="date" {...step2Form.register('passport.expiryDate')} className="w-full" />
                                                    {step2Form.formState.errors.passport?.expiryDate && <p className="text-red-500 text-xs">Required</p>}
                                                </div>
                                            </div>

                                            {/* Passport Uploads */}
                                            <div className="grid grid-cols-2 gap-3 pt-2">
                                                <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center bg-white hover:bg-gray-50 transition-colors relative cursor-pointer">
                                                    {files['passportFront'] ? (
                                                        <div className="flex items-center justify-center gap-2 text-green-600">
                                                            <CheckCircle2 className="h-4 w-4" /> <span className="text-xs font-bold">Front</span>
                                                        </div>
                                                    ) : (
                                                        <label className="cursor-pointer block">
                                                            {isUploading['passportFront'] ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <span className="text-xs font-medium text-gray-600">+ Upload Front</span>}
                                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'passportFront', step2Form, 'passport.frontImage')} />
                                                        </label>
                                                    )}
                                                </div>
                                                <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center bg-white hover:bg-gray-50 transition-colors relative cursor-pointer">
                                                    {files['passportBack'] ? (
                                                        <div className="flex items-center justify-center gap-2 text-green-600">
                                                            <CheckCircle2 className="h-4 w-4" /> <span className="text-xs font-bold">Back</span>
                                                        </div>
                                                    ) : (
                                                        <label className="cursor-pointer block">
                                                            {isUploading['passportBack'] ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <span className="text-xs font-medium text-gray-600">+ Upload Back</span>}
                                                            <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'passportBack', step2Form, 'passport.backImage')} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Visa Section */}
                                <div className={`p-4 rounded-xl border-2 transition-all ${showVisa ? 'border-black bg-gray-50' : 'border-gray-100 bg-white'}`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm">
                                                <FileText className="h-5 w-5 text-gray-900" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">Current Visa</h3>
                                                <p className="text-xs text-gray-500">If they hold a valid visa</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={showVisa} onChange={e => setShowVisa(e.target.checked)} />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                                        </label>
                                    </div>

                                    {showVisa && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-gray-900">Visa Number</label>
                                                    <input {...step2Form.register('visa.number')} className="w-full" placeholder="e.g. V1234567" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-gray-900">Type <span className="text-red-500">*</span></label>
                                                    <Controller
                                                        name="visa.type"
                                                        control={step2Form.control}
                                                        render={({ field }) => (
                                                            <CustomSelect
                                                                value={field.value ?? ''}
                                                                onChange={field.onChange}
                                                                options={VISA_TYPES.map(t => ({ value: t, label: t }))}
                                                                placeholder="Select Type"
                                                            />
                                                        )}
                                                    />
                                                    {step2Form.formState.errors.visa?.type && <p className="text-red-500 text-xs text-right">Required</p>}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-gray-900">Country <span className="text-red-500">*</span></label>
                                                    <Controller
                                                        name="visa.country"
                                                        control={step2Form.control}
                                                        render={({ field }) => (
                                                            <CustomSelect
                                                                value={field.value ?? ''}
                                                                onChange={field.onChange}
                                                                options={COUNTRIES.map(c => ({ value: c, label: c }))}
                                                                placeholder="Select Country"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-gray-900">Grant Date</label>
                                                    <input type="date" {...step2Form.register('visa.grantDate')} className="w-full" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-semibold text-gray-900">Expiry Date <span className="text-red-500">*</span></label>
                                                    <input type="date" {...step2Form.register('visa.expiryDate')} className="w-full" />
                                                    {step2Form.formState.errors.visa?.expiryDate && <p className="text-red-500 text-xs text-right">Required</p>}
                                                </div>
                                            </div>

                                            <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center bg-white hover:bg-gray-50 transition-colors relative cursor-pointer">
                                                {files['visaFile'] ? (
                                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                                        <CheckCircle2 className="h-4 w-4" /> <span className="text-xs font-bold">Document Uploaded</span>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer block">
                                                        {isUploading['visaFile'] ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : <span className="text-xs font-medium text-gray-600">+ Upload Visa Copy</span>}
                                                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'visaFile', step2Form, 'visa.fileUrl')} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <button type="button" onClick={() => setStep(1)} className="text-gray-600 hover:text-black font-medium text-sm flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Back</button>
                                <button type="submit" className="bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 font-medium inline-flex items-center gap-2 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                                    Continue <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Step 3: Family */}
                    {step === 3 && (
                        <form onSubmit={step3Form.handleSubmit(onSubmitStep3)} className="space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Family Setup</h2>

                                <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${step3Form.watch('isFamilyHead') ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <input type="checkbox" {...step3Form.register('isFamilyHead')} className="mt-1" />
                                    <div>
                                        <div className="font-semibold text-gray-900">Set as Family Head</div>
                                        <div className="text-sm text-gray-500">This customer will be the primary contact for a new family group.</div>
                                    </div>
                                </label>

                                <div className={`mt-4 relative p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 transition-opacity ${step3Form.watch('isFamilyHead') ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Join Existing Family</h3>
                                    <input
                                        {...step3Form.register('existingFamilyId')}
                                        placeholder={effectiveFamilyId ? "Using selected family group..." : "Search family name..."}
                                        readOnly={!!effectiveFamilyId}
                                        className={`w-full ${!!effectiveFamilyId ? 'bg-gray-100' : ''}`}
                                    />
                                    {effectiveFamilyId && <p className="text-xs text-green-600 mt-1">✓ Associated with family group</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <button type="button" onClick={() => setStep(2)} className="text-gray-600 hover:text-black font-medium text-sm flex items-center gap-1"><ArrowLeft className="h-4 w-4" /> Back</button>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={step3Form.handleSubmit(onSaveAndAddMember)}
                                        disabled={isPending}
                                        className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 font-medium inline-flex items-center gap-2 transition-all hover:shadow-sm"
                                    >
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4" /> Save & Add Spouse/Child</>}
                                    </button>

                                    <button type="submit" disabled={isPending} className="bg-gradient-to-r from-primary-teal-500 to-primary-teal-600 text-white px-8 py-3 rounded-lg hover:from-primary-teal-600 hover:to-primary-teal-700 font-semibold inline-flex items-center gap-2 transition-all shadow-lg shadow-primary-teal-500/30 transform hover:-translate-y-0.5">
                                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4" /> Finish</>}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
