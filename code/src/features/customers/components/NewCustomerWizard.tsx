'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreateCustomerRequestSchema, PassportSchema } from '../types';
import { createCustomer } from '../server/actions';
import { useRouter, useParams } from 'next/navigation';

// Define schemas
const Step1Schema = CreateCustomerRequestSchema.pick({ fullName: true, email: true, phone: true });
const Step2Schema = PassportSchema;
// Step 3 Schema (Family)
const Step3Schema = z.object({
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

    // Forms
    const step1Form = useForm({ resolver: zodResolver(Step1Schema), defaultValues: { fullName: '', email: '', phone: '' } });
    const step2Form = useForm({
        resolver: zodResolver(Step2Schema),
        defaultValues: { number: '', country: 'India', issueDate: undefined, expiryDate: undefined, placeOfIssue: '' }
    });
    const step3Form = useForm({
        resolver: zodResolver(Step3Schema),
        defaultValues: { isFamilyHead: false, existingFamilyId: '', newFamilyName: '' }
    });

    // Handlers
    const onSubmitStep1 = (data: any) => { setFormData(prev => ({ ...prev, ...data })); setStep(2); };
    const onSubmitStep2 = (data: any) => {
        // @ts-ignore
        setFormData(prev => ({ ...prev, passport: data }));
        setStep(3);
    };
    const handleSkipPassport = () => { setStep(3); };

    const onSubmitStep3 = (data: any) => {
        setFormData(prev => ({ ...prev, ...data }));
        setStep(4);
    };

    const onFinalSubmit = () => {
        startTransition(async () => {
            const finalData = {
                ...formData,
                fullName: formData.fullName!,
                phone: formData.phone!,
                isFamilyHead: formData.isFamilyHead || false,
                // Ensure passport is included if step 2 was completed
                passport: formData.passport
            } as z.infer<typeof CreateCustomerRequestSchema>;

            const result = await createCustomer(finalData);
            if (result.success) {
                router.push(`/dashboard/${firmId}/customers`);
            } else {
                alert('Failed to create customer: ' + JSON.stringify(result.error));
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border max-w-2xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-bold">Step {step} of 4</h2>
                <div className="text-sm text-muted-foreground">
                    {step === 1 && "Basic Info"}
                    {step === 2 && "Passport"}
                    {step === 3 && "Family Grouping"}
                    {step === 4 && "Review & Submit"}
                </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
                <div className="bg-black h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 4) * 100}%` }}></div>
            </div>

            {step === 1 && (
                <form onSubmit={step1Form.handleSubmit(onSubmitStep1)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name *</label>
                        <input {...step1Form.register('fullName')} className="w-full border rounded-md p-2" />
                        {step1Form.formState.errors.fullName && <p className="text-red-500 text-sm">{step1Form.formState.errors.fullName.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Phone *</label>
                            <input {...step1Form.register('phone')} className="w-full border rounded-md p-2" />
                            {step1Form.formState.errors.phone && <p className="text-red-500 text-sm">{step1Form.formState.errors.phone.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input {...step1Form.register('email')} className="w-full border rounded-md p-2" />
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-black text-white px-6 py-2 rounded-md hover:bg-black/90">Next: Passport</button>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={step2Form.handleSubmit(onSubmitStep2)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Passport Number *</label>
                            <input {...step2Form.register('number')} className="w-full border rounded-md p-2 uppercase" />
                            {step2Form.formState.errors.number && <p className="text-red-500 text-sm">{step2Form.formState.errors.number.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Issuing Country *</label>
                            <input {...step2Form.register('country')} className="w-full border rounded-md p-2" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Date of Issue</label>
                            <input type="date" {...step2Form.register('issueDate')} className="w-full border rounded-md p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Date of Expiry</label>
                            <input type="date" {...step2Form.register('expiryDate')} className="w-full border rounded-md p-2" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Place of Issue</label>
                        <input {...step2Form.register('placeOfIssue')} className="w-full border rounded-md p-2" />
                    </div>

                    <div className="flex justify-between pt-4 items-center">
                        <button type="button" onClick={handleSkipPassport} className="text-gray-500 text-sm hover:underline">Skip</button>
                        <div className="space-x-2">
                            <button type="button" onClick={() => setStep(1)} className="border px-4 py-2 rounded-md">Back</button>
                            <button type="submit" className="bg-black text-white px-6 py-2 rounded-md">Next: Family</button>
                        </div>
                    </div>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={step3Form.handleSubmit(onSubmitStep3)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2 border p-4 rounded-md">
                            <input type="checkbox" {...step3Form.register('isFamilyHead')} id="isHead" className="h-4 w-4" />
                            <label htmlFor="isHead" className="font-medium">Is this customer a Family Head?</label>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-md">
                            <h3 className="text-sm font-medium mb-2">Or join an existing family</h3>
                            <input {...step3Form.register('existingFamilyId')} placeholder="Search Family (Coming Soon)" className="w-full border rounded-md p-2" disabled={step3Form.watch('isFamilyHead')} />
                            <p className="text-xs text-muted-foreground mt-1">Leave blank if individual customer.</p>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <button type="button" onClick={() => setStep(2)} className="border px-4 py-2 rounded-md">Back</button>
                        <button type="submit" className="bg-black text-white px-6 py-2 rounded-md">Next: Review</button>
                    </div>
                </form>
            )}

            {step === 4 && (
                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-md space-y-2 text-sm">
                        <p><span className="font-bold">Name:</span> {formData.fullName}</p>
                        <p><span className="font-bold">Phone:</span> {formData.phone}</p>
                        <p><span className="font-bold">Email:</span> {formData.email || 'N/A'}</p>
                        <hr className="my-2" />
                        <p><span className="font-bold">Passport:</span> {formData.passport ? `${formData.passport.number} (${formData.passport.country})` : 'Not Provided'}</p>
                        <hr className="my-2" />
                        <p><span className="font-bold">Family:</span> {formData.isFamilyHead ? 'Creating New Family Group' : (formData.existingFamilyId ? 'Joining Existing Group' : 'Individual')}</p>
                    </div>

                    <div className="flex justify-end pt-4 space-x-2">
                        <button onClick={() => setStep(3)} className="border px-4 py-2 rounded-md" disabled={isPending}>Back</button>
                        <button onClick={onFinalSubmit} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isPending ? 'Creating...' : 'Confirm & Create Customer'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
