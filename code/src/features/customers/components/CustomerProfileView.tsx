'use client';

import { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, Mail, Phone, Users, FileText,
    FolderClosed, Edit, Plus, Eye, Download, FileIcon, IndianRupee,
    CheckSquare, CreditCard, Calendar, Clock
} from 'lucide-react';
import { EditPassportSheet } from './EditPassportSheet';
import { EditVisaSheet } from './EditVisaSheet';
import { updateCustomer } from '../server/actions';
import { RecordPaymentSheet } from '@/features/payments/components/RecordPaymentSheet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CustomerProfileViewProps {
    customer: any;
    firmId: string;
}

export function CustomerProfileView({ customer, firmId }: CustomerProfileViewProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'documents' | 'tasks' | 'payments'>('overview');
    const [isPassportSheetOpen, setIsPassportSheetOpen] = useState(false);
    const [isVisaSheetOpen, setIsVisaSheetOpen] = useState(false);

    const [paymentApp, setPaymentApp] = useState<{ id: string, title: string } | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleCreateFamilyGroup = () => {
        startTransition(async () => {
            const res = await updateCustomer({
                id: customer.id,
                isFamilyHead: true,
                fullName: customer.fullName,
                email: customer.email,
                phone: customer.phone,
                // @ts-ignore
                isFamilyHead: true
            });

            if (res.success) {
                toast.success("Family Group Created");
                router.refresh();
            } else {
                toast.error("Failed to create family group");
            }
        });
    };

    // Derived Data
    const allPayments = useMemo(() => {
        const payments: any[] = [];
        customer.applications?.forEach((app: any) => {
            if (app.payments) {
                app.payments.forEach((p: any) => {
                    payments.push({ ...p, applicationTitle: `${app.visaType} - ${app.targetCountry}` });
                });
            }
        });
        return payments.sort((a, b) => new Date(b.paidAt || b.createdAt).getTime() - new Date(a.paidAt || a.createdAt).getTime());
    }, [customer.applications]);

    const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'applications', label: 'Applications', icon: FileText, count: customer._count?.applications },
        { id: 'documents', label: 'Documents', icon: FolderClosed, count: customer._count?.documents },
        { id: 'tasks', label: 'Tasks', icon: CheckSquare, count: customer.tasks?.length },
        { id: 'payments', label: 'Payments', icon: CreditCard, count: allPayments.length },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <EditPassportSheet customer={customer} isOpen={isPassportSheetOpen} onClose={() => setIsPassportSheetOpen(false)} />
            <EditVisaSheet customer={customer} isOpen={isVisaSheetOpen} onClose={() => setIsVisaSheetOpen(false)} />

            <RecordPaymentSheet
                applicationId={paymentApp?.id || ''}
                applicationTitle={paymentApp?.title || ''}
                isOpen={!!paymentApp}
                onClose={() => setPaymentApp(null)}
            />

            {/* Header Card */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/30 p-5 sm:p-6 shadow-[0_8px_32px_0_rgba(44,129,141,0.15)]">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                    <div className="flex items-center gap-4 sm:gap-5">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-primary-teal-500 to-primary-teal-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-[0_8px_24px_0_rgba(44,129,141,0.3)] shrink-0">
                            {customer.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{customer.fullName}</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5 font-mono text-xs bg-primary-teal-50 text-primary-teal-700 px-2.5 py-1 rounded-lg font-semibold">
                                    ID: {customer.id.slice(-4).toUpperCase()}
                                </div>
                                {(customer.email) && (
                                    <div className="flex items-center gap-1.5 truncate">
                                        <Mail className="h-3.5 w-3.5 shrink-0 text-primary-teal-500" />
                                        <span className="truncate">{customer.email}</span>
                                    </div>
                                )}
                                {(customer.phone) && (
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 shrink-0 text-primary-teal-500" />
                                        {customer.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <Link
                            href={`/dashboard/${firmId}/customers/${customer.id}/edit`}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-primary-teal-500/30 rounded-xl text-sm font-semibold text-primary-teal-700 hover:bg-primary-teal-50 hover:border-primary-teal-500 transition-all"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </Link>
                        <Link
                            href={`/dashboard/${firmId}/applications/new?customerId=${customer.id}`}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-teal-500 to-primary-teal-600 text-white rounded-xl text-sm font-semibold hover:shadow-[0_8px_24px_0_rgba(44,129,141,0.3)] transform hover:-translate-y-0.5 transition-all shadow-[0_8px_16px_0_rgba(44,129,141,0.2)]"
                        >
                            <Plus className="h-4 w-4" />
                            New App
                        </Link>
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Active Apps</span>
                        <span className="text-xl font-bold text-gray-900">{customer._count?.applications || 0}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Documents</span>
                        <span className="text-xl font-bold text-gray-900">{customer._count?.documents || 0}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Paid</span>
                        <span className="text-xl font-bold text-gray-900">₹{totalPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Tasks</span>
                        <span className="text-xl font-bold text-gray-900">{customer.tasks?.length || 0}</span>
                    </div>
                </div>
            </div>

            {/* Passport, Visa, and Family Group Widgets - Mobile Only: Show above tabs */}
            <div className="space-y-6 lg:hidden">
                {/* Passport Widget */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            Active Passport
                        </h3>
                        <button onClick={() => setIsPassportSheetOpen(true)} className="text-xs font-semibold text-primary-teal-600 hover:text-primary-teal-700 transition-colors">Manage</button>
                    </div>
                    {customer.passports?.[0] ? (
                        <div className="p-4 rounded-xl bg-white/50 backdrop-blur-xl border border-primary-teal-200">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-lg font-mono font-bold text-primary-teal-900">{customer.passports[0].number}</div>
                                <div className="text-xl">🇮🇳</div>
                            </div>
                            <div className="text-xs text-primary-teal-700 font-medium">Expires: {new Date(customer.passports[0].expiryDate).toLocaleDateString()}</div>
                        </div>
                    ) : (
                        <div className="text-center py-4 border-2 border-dashed border-gray-100 rounded-lg">
                            <p className="text-xs text-gray-400 mb-2">No passport added</p>
                            <button onClick={() => setIsPassportSheetOpen(true)} className="text-xs font-medium text-blue-600 hover:underline">Add Details</button>
                        </div>
                    )}
                </div>

                {/* Visa Widget */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            Active Visa
                        </h3>
                        <button onClick={() => setIsVisaSheetOpen(true)} className="text-xs font-semibold text-primary-teal-600 hover:text-primary-teal-700 transition-colors">Manage</button>
                    </div>
                    {customer.visas?.[0] ? (
                        <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="text-lg font-mono font-bold text-green-900">{customer.visas[0].number || 'No Number'}</div>
                                <div className="text-xs font-bold px-2 py-1 bg-white rounded text-green-700 shadow-sm">{customer.visas[0].type}</div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="text-xs text-green-700">Expires: {new Date(customer.visas[0].expiryDate).toLocaleDateString()}</div>
                                <div className="text-xs font-medium text-green-800">{customer.visas[0].country}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4 border-2 border-dashed border-gray-100 rounded-lg">
                            <p className="text-xs text-gray-400 mb-2">No visa added</p>
                            <button onClick={() => setIsVisaSheetOpen(true)} className="text-xs font-medium text-blue-600 hover:underline">Add Details</button>
                        </div>
                    )}
                </div>

                {/* Family Group Widget */}
                <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            Family Group
                        </h3>
                        {customer.familyGroup && (
                            <Link
                                href={`/dashboard/${firmId}/customers/new?existingFamilyId=${customer.familyGroupId}&newFamilyName=${encodeURIComponent(customer.familyGroup.name || '')}`}
                                className="text-xs font-medium text-blue-600 hover:underline"
                            >
                                Add Member
                            </Link>
                        )}
                    </div>

                    {customer.familyGroup ? (
                        <div className="space-y-3">
                            <div className="text-sm font-medium text-gray-900 pb-2 border-b border-gray-100">
                                {customer.familyGroup.name}
                            </div>
                            <div className="space-y-2">
                                {customer.familyGroup.members?.map((member: any) => (
                                    <Link
                                        key={member.id}
                                        href={`/dashboard/${firmId}/customers/${member.id}`}
                                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                                {member.fullName.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="text-sm text-gray-700 font-medium group-hover:text-black">
                                                {member.fullName}
                                            </div>
                                        </div>
                                        {member.isFamilyHead && (
                                            <span className="text-[10px] font-bold bg-primary-teal-100 text-primary-teal-700 px-1.5 py-0.5 rounded">HEAD</span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-xs text-gray-500 mb-3">Not part of any family group.</p>
                            <button
                                onClick={handleCreateFamilyGroup}
                                disabled={isPending}
                                className="text-sm font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 w-full"
                            >
                                Create Group
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b border-gray-200">
                <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={cn(
                                "pb-3 pt-2 text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap px-2 sm:px-3 flex items-center gap-1.5 snap-start",
                                activeTab === tab.id
                                    ? "border-primary-teal-500 text-primary-teal-600"
                                    : "border-transparent text-gray-400 hover:text-primary-teal-500 hover:border-primary-teal-200"
                            )}
                        >
                            <tab.icon className="h-4 w-4 hidden sm:block" />
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[20px] text-center",
                                    activeTab === tab.id ? "bg-primary-teal-500 text-white" : "bg-gray-100 text-gray-500"
                                )}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Layout - Desktop: widgets left, content right | Mobile: stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-8">
                {/* Left Sidebar - Widgets (Desktop/Tablet Only) */}
                <div className="space-y-6 hidden lg:block">
                    {/* Passport Widget */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                Active Passport
                            </h3>
                            <button onClick={() => setIsPassportSheetOpen(true)} className="text-xs font-medium text-blue-600 hover:underline">Manage</button>
                        </div>
                        {customer.passports?.[0] ? (
                            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-lg font-mono font-bold text-blue-900">{customer.passports[0].number}</div>
                                    <div className="text-xl">🇮🇳</div>
                                </div>
                                <div className="text-xs text-blue-700">Expires: {new Date(customer.passports[0].expiryDate).toLocaleDateString()}</div>
                            </div>
                        ) : (
                            <div className="text-center py-4 border-2 border-dashed border-gray-100 rounded-lg">
                                <p className="text-xs text-gray-400 mb-2">No passport added</p>
                                <button onClick={() => setIsPassportSheetOpen(true)} className="text-xs font-medium text-blue-600 hover:underline">Add Details</button>
                            </div>
                        )}
                    </div>

                    {/* Visa Widget */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                Active Visa
                            </h3>
                            <button onClick={() => setIsVisaSheetOpen(true)} className="text-xs font-medium text-blue-600 hover:underline">Manage</button>
                        </div>
                        {customer.visas?.[0] ? (
                            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-lg font-mono font-bold text-green-900">{customer.visas[0].number || 'No Number'}</div>
                                    <div className="text-xs font-bold px-2 py-1 bg-white rounded text-green-700 shadow-sm">{customer.visas[0].type}</div>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="text-xs text-green-700">Expires: {new Date(customer.visas[0].expiryDate).toLocaleDateString()}</div>
                                    <div className="text-xs font-medium text-green-800">{customer.visas[0].country}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 border-2 border-dashed border-gray-100 rounded-lg">
                                <p className="text-xs text-gray-400 mb-2">No visa added</p>
                                <button onClick={() => setIsVisaSheetOpen(true)} className="text-xs font-medium text-blue-600 hover:underline">Add Details</button>
                            </div>
                        )}
                    </div>

                    {/* Family Group Widget */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-500" />
                                Family Group
                            </h3>
                            {customer.familyGroup && (
                                <Link
                                    href={`/dashboard/${firmId}/customers/new?existingFamilyId=${customer.familyGroupId}&newFamilyName=${encodeURIComponent(customer.familyGroup.name || '')}`}
                                    className="text-xs font-medium text-blue-600 hover:underline"
                                >
                                    Add Member
                                </Link>
                            )}
                        </div>

                        {customer.familyGroup ? (
                            <div className="space-y-3">
                                <div className="text-sm font-medium text-gray-900 pb-2 border-b border-gray-100">
                                    {customer.familyGroup.name}
                                </div>
                                <div className="space-y-2">
                                    {customer.familyGroup.members?.map((member: any) => (
                                        <Link
                                            key={member.id}
                                            href={`/dashboard/${firmId}/customers/${member.id}`}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                                    {member.fullName.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div className="text-sm text-gray-700 font-medium group-hover:text-black">
                                                    {member.fullName}
                                                </div>
                                            </div>
                                            {member.isFamilyHead && (
                                                <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">HEAD</span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-xs text-gray-500 mb-3">Not part of any family group.</p>
                                <button
                                    onClick={handleCreateFamilyGroup}
                                    disabled={isPending}
                                    className="text-sm font-medium border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 w-full"
                                >
                                    Create Group
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Content - Tab Content (spans 2 columns on desktop) */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Recent Activity / Applications Summary */}
                            <h3 className="font-semibold text-gray-900">Recent Applications</h3>
                            {customer.applications?.length > 0 ? (
                                <div className="space-y-4">
                                    {customer.applications.slice(0, 3).map((app: any) => (
                                        <div key={app.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{app.visaType}</h4>
                                                    <p className="text-sm text-gray-500">Destination: {app.targetCountry}</p>
                                                </div>
                                                <div className={cn(
                                                    "px-2.5 py-1 rounded-full text-xs font-bold uppercase",
                                                    app.status === 'APPROVED' ? "bg-green-100 text-green-700" :
                                                        app.status === 'REJECTED' ? "bg-red-100 text-red-700" :
                                                            "bg-amber-100 text-amber-700"
                                                )}>
                                                    {app.status}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    Updated {format(new Date(app.updatedAt), 'MMM d, yyyy')}
                                                </div>
                                                <div className="h-4 w-px bg-gray-200" />
                                                <div className="flex items-center gap-1">
                                                    <IndianRupee className="h-3.5 w-3.5" />
                                                    {app.payments?.length || 0} Payments
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-xl p-8 text-center">
                                    <p className="text-gray-500 mb-4">No applications yet.</p>
                                    <Link href={`/dashboard/${firmId}/applications/new?customerId=${customer.id}`} className="text-sm font-medium text-blue-600 hover:underline">Start First Application</Link>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'applications' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900">All Applications</h3>
                                <Link href={`/dashboard/${firmId}/applications/new?customerId=${customer.id}`} className="text-sm font-medium text-blue-600 hover:underline">+ New App</Link>
                            </div>
                            {customer.applications?.map((app: any) => (
                                <Link key={app.id} href={`/dashboard/${firmId}/applications/${app.id}`} className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-gray-900">{app.visaType} - {app.targetCountry}</div>
                                            <div className="text-sm text-gray-500 mt-1">Priority: {app.priority}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-400">{format(new Date(app.createdAt), 'MMM d, yyyy')}</span>
                                            <ArrowLeft className="h-4 w-4 text-gray-300 rotate-180" />
                                        </div>
                                    </div>

                                    {/* Progress Bar (Fake for now) */}
                                    <div className="mt-4 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-900 rounded-full" style={{ width: app.status === 'APPROVED' ? '100%' : '40%' }} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900">Documents</h3>
                                <button className="text-sm font-medium text-blue-600 hover:underline">Upload Document</button>
                            </div>
                            {customer.documents?.length > 0 ? (
                                <>
                                    {/* Mobile: Cards */}
                                    <div className="space-y-3 md:hidden">
                                        {customer.documents.map((doc: any) => (
                                            <div key={doc.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-50 rounded-lg">
                                                        <FileIcon className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm text-gray-900 truncate">{doc.name}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5">{doc.category}</div>
                                                    </div>
                                                    <a href={doc.fileUrl} target="_blank" className="text-xs font-medium text-primary-teal-600 px-3 py-1.5 bg-primary-teal-50 rounded-lg hover:bg-primary-teal-100 transition-colors">View</a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Desktop: Table */}
                                    <div className="hidden md:block bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-200">
                                                <tr>
                                                    <th className="px-5 py-3">Name</th>
                                                    <th className="px-5 py-3">Category</th>
                                                    <th className="px-5 py-3 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {customer.documents.map((doc: any) => (
                                                    <tr key={doc.id} className="group hover:bg-gray-50/60">
                                                        <td className="px-5 py-3.5 text-gray-900 font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <FileIcon className="h-4 w-4 text-gray-400" />
                                                                {doc.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-gray-500">{doc.category}</td>
                                                        <td className="px-5 py-3.5 text-right">
                                                            <a href={doc.fileUrl} target="_blank" className="text-blue-600 hover:underline">View</a>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl">
                                    <FileIcon className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                                    No documents found.
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'tasks' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900">Pending Tasks</h3>
                                {/* Add Task Button Logic would go here */}
                            </div>
                            <div className="space-y-3">
                                {customer.tasks?.map((task: any) => (
                                    <div key={task.id} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                                        <div className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center ${task.status === 'DONE' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                                            {task.status === 'DONE' && <CheckSquare className="h-3 w-3" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className={cn("text-sm font-medium text-gray-900", task.status === 'DONE' && "line-through text-gray-500")}>
                                                {task.title}
                                            </div>
                                            {task.dueDate && (
                                                <div className="flex items-center gap-1 mt-1 text-xs text-amber-600">
                                                    <Calendar className="h-3 w-3" />
                                                    Due {format(new Date(task.dueDate), 'MMM d')}
                                                </div>
                                            )}
                                        </div>
                                        <div className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded uppercase",
                                            task.priority === 'HIGH' ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"
                                        )}>
                                            {task.priority}
                                        </div>
                                    </div>
                                ))}
                                {(!customer.tasks || customer.tasks.length === 0) && (
                                    <div className="text-center py-8 text-gray-500">All caught up! No tasks.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 mb-4">Payment History</h3>
                            {allPayments.length > 0 ? (
                                <>
                                    {/* Mobile: Cards */}
                                    <div className="space-y-3 md:hidden">
                                        {allPayments.map((p: any) => (
                                            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-sm text-gray-900 truncate">{p.applicationTitle}</div>
                                                        <div className="text-xs text-gray-400 mt-0.5">{format(new Date(p.paidAt || p.createdAt), 'MMM d, yyyy')}</div>
                                                    </div>
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0",
                                                        p.status === 'COMPLETED' ? "bg-green-100 text-green-700" :
                                                            p.status === 'PENDING' ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                                                    )}>
                                                        {p.status}
                                                    </span>
                                                </div>
                                                <div className="text-lg font-bold text-gray-900">₹{Number(p.amount).toLocaleString()}</div>
                                            </div>
                                        ))}
                                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                                            <span className="text-xs text-gray-500">Total Paid </span>
                                            <span className="text-lg font-bold text-gray-900">₹{totalPaid.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    {/* Desktop: Table */}
                                    <div className="hidden md:block bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50/80 text-gray-500 font-medium border-b border-gray-200">
                                                <tr>
                                                    <th className="px-5 py-3">Date</th>
                                                    <th className="px-5 py-3">Application</th>
                                                    <th className="px-5 py-3">Amount</th>
                                                    <th className="px-5 py-3 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {allPayments.map((p: any) => (
                                                    <tr key={p.id} className="hover:bg-gray-50/60">
                                                        <td className="px-5 py-3.5 text-gray-500">
                                                            {format(new Date(p.paidAt || p.createdAt), 'MMM d, yyyy')}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-gray-900 font-medium">
                                                            {p.applicationTitle}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-gray-900">
                                                            ₹{Number(p.amount).toLocaleString()}
                                                        </td>
                                                        <td className="px-5 py-3.5 text-right">
                                                            <span className={cn(
                                                                "px-2.5 py-1 rounded-full text-xs font-bold",
                                                                p.status === 'COMPLETED' ? "bg-green-100 text-green-700" :
                                                                    p.status === 'PENDING' ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                                                            )}>
                                                                {p.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="bg-gray-50/80 border-t border-gray-200 font-bold text-gray-900">
                                                <tr>
                                                    <td colSpan={2} className="px-5 py-3 text-right">Total Paid</td>
                                                    <td className="px-5 py-3">₹{totalPaid.toLocaleString()}</td>
                                                    <td></td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </>
                            ) : (
                                <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl">
                                    <CreditCard className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                                    No payments recorded.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
