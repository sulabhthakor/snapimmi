'use client';

import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UpdateCustomerRequestSchema, PassportSchema } from '../types';
import { updateCustomer } from '../server/actions';
import { useRouter } from 'next/navigation';
import { Loader2, Save, User, FileText, Users, FolderClosed, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { DocumentVault } from '@/features/documents/components/DocumentVault';
import { toast } from 'sonner';
import { DateInput } from '@/components/ui/DateInput';

type CustomerData = any; // Ideally import fully joined type

export function EditCustomerForm({ customer, firmId }: { customer: CustomerData, firmId: string }) {
    const [activeTab, setActiveTab] = useState<'PROFILE' | 'FAMILY' | 'DOCUMENTS'>('PROFILE');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // -- Profile & Passport Form --
    const profileForm = useForm({
        resolver: zodResolver(UpdateCustomerRequestSchema.pick({
            id: true, fullName: true, email: true, phone: true, passport: true
        })),
        defaultValues: {
            id: customer.id,
            fullName: customer.fullName,
            email: customer.email || '',
            phone: customer.phone || '',
            passport: (customer.passports?.[0] && customer.passports[0].issueDate && customer.passports[0].expiryDate) ? {
                number: customer.passports[0].number,
                country: customer.passports[0].country,
                issueDate: new Date(customer.passports[0].issueDate),
                expiryDate: new Date(customer.passports[0].expiryDate),
                placeOfIssue: customer.passports[0].placeOfIssue || ''
            } : undefined
        }
    });

    // -- Family Form --
    const familyForm = useForm({
        resolver: zodResolver(UpdateCustomerRequestSchema.pick({
            id: true, isFamilyHead: true, existingFamilyId: true, newFamilyName: true
        })),
        defaultValues: {
            id: customer.id,
            isFamilyHead: customer.isFamilyHead,
            existingFamilyId: customer.familyGroupId || '',
            newFamilyName: '' // Usually empty unless creating new
        }
    });

    const onProfileSubmit = (data: any) => {
        startTransition(async () => {
            // Sanitize passport: RHF creates an object with empty strings if fields exist but are empty.
            // If number and country are empty, we assume no passport is intended.
            const rawPassport = data.passport;
            const passport = (rawPassport && !rawPassport.number && !rawPassport.country)
                ? undefined
                : rawPassport;

            // ideally we shouldn't send undefined passport if we want to KEEP existing passport?
            // But if defaultValues had undefined, it implies we assume no passport started.
            // Wait, if we want to clear passport? We'd strictly need an explicit action.
            // For now, this logic fixes the broken update.

            const fullPayload = {
                ...data,
                passport,
                id: customer.id, // Explicitly add ID as it might be missing from form data
                isFamilyHead: familyForm.getValues('isFamilyHead') || false,
                existingFamilyId: familyForm.getValues('existingFamilyId'),
                newFamilyName: familyForm.getValues('newFamilyName'),
            };

            console.log('[EditCustomerForm] Submitting Profile:', fullPayload);

            const result = await updateCustomer(fullPayload as any);
            if (result.success) {
                router.refresh();
                toast.success('Profile updated successfully');
            } else {
                console.error('[EditCustomerForm] Profile update failed:', result.error);
                toast.error(`Failed: ${JSON.stringify(result.error)}`);
            }
        });
    };

    const onFamilySubmit = (data: any) => {
        startTransition(async () => {
            const profileData = profileForm.getValues();
            const rawPassport = profileData.passport;
            const passport = (rawPassport && !rawPassport.number && !(rawPassport as any).country)
                ? undefined
                : rawPassport;

            const fullPayload = {
                ...profileData,
                ...data,
                id: customer.id, // Explicitly add ID
                passport: passport ? {
                    ...passport,
                    issueDate: passport.issueDate ? new Date(passport.issueDate) : undefined,
                    expiryDate: passport.expiryDate ? new Date(passport.expiryDate) : undefined,
                } : undefined
            };

            console.log('[EditCustomerForm] Submitting Family:', fullPayload);

            const result = await updateCustomer(fullPayload as any);
            if (result.success) {
                router.refresh();
                toast.success('Family settings updated');
            } else {
                console.error('[EditCustomerForm] Family update failed:', result.error);
                toast.error('Failed to update family settings');
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('PROFILE')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'PROFILE'
                            ? 'border-primary-teal-600 text-primary-teal-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <User className="h-4 w-4" />
                        Profile & Passport
                    </button>
                    <button
                        onClick={() => setActiveTab('FAMILY')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'FAMILY'
                            ? 'border-primary-teal-600 text-primary-teal-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <Users className="h-4 w-4" />
                        Family Group
                    </button>
                    <button
                        onClick={() => setActiveTab('DOCUMENTS')}
                        className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'DOCUMENTS'
                            ? 'border-primary-teal-600 text-primary-teal-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        <FolderClosed className="h-4 w-4" />
                        Documents
                    </button>
                </nav>
            </div>

            {/* Content: Profile */}
            {activeTab === 'PROFILE' && (
                <form
                    onSubmit={profileForm.handleSubmit(onProfileSubmit, (errors) => {
                        console.error('Validation Errors:', errors);
                        alert(`Validation Errors: ${JSON.stringify(errors)}`);
                    })}
                    className="space-y-8 max-w-4xl"
                >
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Full Name</label>
                                <input type="text" {...profileForm.register('fullName')} />
                                {profileForm.formState.errors.fullName && <p className="text-red-500 text-xs">{profileForm.formState.errors.fullName.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Phone</label>
                                <input type="tel" {...profileForm.register('phone')} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Email</label>
                                <input type="email" {...profileForm.register('email')} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                        <h3 className="text-lg font-semibold text-gray-900">Passport Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Passport Number</label>
                                <input type="text" {...profileForm.register('passport.number')} className="uppercase placeholder:normal-case" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Issuing Country</label>
                                <input type="text" {...profileForm.register('passport.country')} />
                            </div>
                            <div className="space-y-2">
                                <Controller
                                    control={profileForm.control}
                                    name="passport.issueDate"
                                    render={({ field }) => (
                                        <DateInput
                                            label="Issue Date"
                                            value={field.value instanceof Date ? field.value : (typeof field.value === 'string' ? new Date(field.value) : undefined)}
                                            onChange={field.onChange}
                                            placeholder="DD-MM-YY"
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <Controller
                                    control={profileForm.control}
                                    name="passport.expiryDate"
                                    render={({ field }) => (
                                        <DateInput
                                            label="Expiry Date"
                                            value={field.value instanceof Date ? field.value : (typeof field.value === 'string' ? new Date(field.value) : undefined)}
                                            onChange={field.onChange}
                                            placeholder="DD-MM-YY"
                                        />
                                    )}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-900">Place of Issue</label>
                                <input type="text" {...profileForm.register('passport.placeOfIssue')} />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={isPending} className="bg-gradient-to-r from-primary-teal-500 to-primary-teal-600 text-white px-6 py-2.5 rounded-lg hover:from-primary-teal-600 hover:to-primary-teal-700 font-medium inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            )}

            {/* Content: Family */}
            {activeTab === 'FAMILY' && (
                <form onSubmit={familyForm.handleSubmit(onFamilySubmit)} className="space-y-8 max-w-2xl">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                        <div className="space-y-4">
                            <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${familyForm.watch('isFamilyHead') ? 'border-primary-teal-600 bg-primary-teal-50/10' : 'border-gray-100 hover:border-gray-200'}`}>
                                <input type="checkbox" {...familyForm.register('isFamilyHead')} className="mt-1" />
                                <div>
                                    <div className="font-semibold text-gray-900">Set as Family Head</div>
                                    <div className="text-sm text-gray-500">This customer will be the primary contact for a new family group.</div>
                                </div>
                            </label>

                            <div className={`relative p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 transition-opacity ${familyForm.watch('isFamilyHead') ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Join Existing Family</h3>
                                <input type="text" {...familyForm.register('existingFamilyId')} placeholder="Search family name or enter ID..." />
                                <p className="text-xs text-gray-500 mt-2">Leave blank if this is an individual customer.</p>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={isPending} className="bg-gradient-to-r from-primary-teal-500 to-primary-teal-600 text-white px-6 py-2.5 rounded-lg hover:from-primary-teal-600 hover:to-primary-teal-700 font-medium inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Update Family Settings
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {/* Content: Documents */}
            {activeTab === 'DOCUMENTS' && (
                <div className="space-y-4">
                    <div className="bg-primary-teal-50 border border-primary-teal-100 p-4 rounded-lg text-primary-teal-800 text-sm">
                        Manage documents for <strong>{customer.fullName}</strong>. Uploaded files are automatically linked to this profile.
                    </div>
                    <DocumentVault documents={customer.documents} />
                </div>
            )}
        </div>
    );
}
