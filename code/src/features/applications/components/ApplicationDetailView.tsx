'use client';

import Link from 'next/link';
import {
    ArrowLeft, Calendar, User, FileText, CheckSquare, Settings,
    MoreHorizontal, Download, ExternalLink, IndianRupee, Clock, Flag,
    LayoutDashboard, Save, Loader2, Plus, Trash2, Eye, Edit3,
    TrendingUp, AlertCircle, CreditCard, ListChecks
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState, useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { RecordPaymentSheet } from '@/features/payments/components/RecordPaymentSheet';
import { updateApplicationStatus, updateApplication, getApplicationDetails } from '../server/actions';
import { deletePayment } from '@/features/payments/server/actions';
import { UpdateApplicationRequestSchema } from '../types';
import { VISA_TYPES, COUNTRIES } from '../constants';

import { Timeline } from '@/components/ui/Timeline';
import { EmptyState } from '@/components/ui/EmptyState';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { UploadDropzone } from '@/features/documents/components/UploadDropzone';

interface ApplicationDetailViewProps {
    application: any;
    firmId: string;
}

type TabId = 'overview' | 'documents' | 'payments' | 'timeline';

export function ApplicationDetailView({ application, firmId }: ApplicationDetailViewProps) {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [details, setDetails] = useState<any>(application);
    const router = useRouter();

    // Calculate totals
    const totalPaid = details.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
    const fees = details.fees || 0;
    const outstanding = Math.max(fees - totalPaid, 0);
    const tasksCount = details.tasks?.length || 0;
    const completedTasks = details.tasks?.filter((t: any) => t.status === 'DONE').length || 0;
    const docsCount = details.customer?.documents?.length || 0;

    const statusColors: Record<string, string> = {
        PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
        DOCUMENTS_COLLECTED: 'bg-sky-50 text-sky-700 border-sky-200',
        APPLIED: 'bg-violet-50 text-violet-700 border-violet-200',
        APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        REJECTED: 'bg-red-50 text-red-700 border-red-200',
    };

    const priorityColors: Record<string, string> = {
        HIGH: 'bg-red-50 text-red-700 border-red-200',
        MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
        LOW: 'bg-slate-50 text-slate-600 border-slate-200',
    };

    // Form for overview editing
    const form = useForm({
        resolver: zodResolver(UpdateApplicationRequestSchema),
        values: {
            id: details.id,
            country: details.targetCountry || details.country,
            visaType: details.visaType,
            status: details.status,
            priority: details.priority,
            notes: details.notes || '',
        }
    });

    const onSubmit = (data: any) => {
        startTransition(async () => {
            const result = await updateApplication(data);
            if (result.success) {
                toast.success('Application updated successfully');
                router.refresh();
                // Refresh local details
                const refreshed = await getApplicationDetails(details.id);
                if (refreshed) setDetails(refreshed);
            } else {
                toast.error('Failed to update application');
            }
        });
    };

    const handleDeletePayment = (paymentId: string) => {
        if (!confirm("Are you sure you want to delete this payment? This cannot be undone.")) return;
        startTransition(async () => {
            const res = await deletePayment(paymentId);
            if (res.success) {
                toast.success("Payment deleted");
                const data = await getApplicationDetails(details.id);
                if (data) setDetails(data);
                router.refresh();
            } else {
                toast.error("Failed to delete payment");
            }
        });
    };

    const refreshDetails = async () => {
        const data = await getApplicationDetails(details.id);
        if (data) setDetails(data);
        router.refresh();
    };

    // Timeline events
    const timelineEvents = details ? [
        { type: 'created', date: new Date(details.createdAt), title: 'Application Created', icon: LayoutDashboard, color: 'bg-gray-100 text-gray-600' },
        ...(details.payments?.map((p: any) => ({
            type: 'payment',
            date: new Date(p.createdAt),
            title: `Payment Recorded: ₹${Number(p.amount).toLocaleString()}`,
            subtitle: `${p.method} • ${p.status}`,
            icon: IndianRupee,
            color: 'bg-green-50 text-green-600'
        })) || []),
        ...(details.tasks?.filter((t: any) => t.status === 'DONE').map((t: any) => ({
            type: 'task',
            date: new Date(t.completedAt),
            title: `Task Completed: ${t.title}`,
            subtitle: `Assigned to ${t.assignee?.name}`,
            icon: FileText,
            color: 'bg-primary-teal-50 text-primary-teal-600'
        })) || [])
    ].sort((a, b) => b.date.getTime() - a.date.getTime()) : [];

    const tabs = [
        { id: 'overview' as TabId, label: 'Overview', icon: LayoutDashboard },
        { id: 'documents' as TabId, label: 'Documents', icon: FileText, count: docsCount },
        { id: 'payments' as TabId, label: 'Payments', icon: IndianRupee, count: details.payments?.length || 0 },
        { id: 'timeline' as TabId, label: 'Timeline', icon: Clock },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-8">
            {/* Record Payment Sheet */}
            <RecordPaymentSheet
                applicationId={details.id}
                applicationTitle={`${details.visaType} - ${details.targetCountry || details.country}`}
                isOpen={isPaymentOpen}
                onClose={() => {
                    setIsPaymentOpen(false);
                    startTransition(async () => {
                        await refreshDetails();
                    });
                }}
            />

            {/* Upload Dropzone Modal */}
            {isUploadOpen && (
                <UploadDropzone
                    customerId={details.customerId}
                    applicationId={details.id}
                    defaultCategory="Application"
                    onClose={() => {
                        setIsUploadOpen(false);
                        startTransition(async () => {
                            await refreshDetails();
                        });
                    }}
                />
            )}

            {/* Breadcrumb / Back Navigation */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href={`/dashboard/${firmId}/applications`} className="hover:text-primary-teal-600 flex items-center gap-1 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Applications
                </Link>
                <span className="text-gray-300">/</span>
                <span className="font-medium text-gray-900">{details.visaType} — {details.targetCountry || details.country}</span>
            </div>

            {/* ── Header Card ─────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="p-4 sm:p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-5">
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{details.visaType}</h1>
                                <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", statusColors[details.status])}>
                                    {details.status.replace(/_/g, ' ')}
                                </span>
                                <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", priorityColors[details.priority])}>
                                    {details.priority}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-gray-500 text-sm">
                                <span className="flex items-center gap-1.5">
                                    <Flag className="h-3.5 w-3.5 text-primary-teal-500" />
                                    {details.targetCountry || details.country}
                                </span>
                                <span className="text-gray-300 hidden sm:inline">|</span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-primary-teal-500" />
                                    {format(new Date(details.createdAt), 'MMM d, yyyy')}
                                </span>
                                <span className="text-gray-300 hidden sm:inline">|</span>
                                <span className="flex items-center gap-1.5 font-mono text-xs text-gray-400">
                                    ID: {details.id.slice(0, 8)}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-3 shrink-0 w-full md:w-auto">
                            <button
                                onClick={() => setIsPaymentOpen(true)}
                                className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
                            >
                                <IndianRupee className="h-4 w-4" />
                                Record Payment
                            </button>
                            <button
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={isPending}
                                className="flex-1 md:flex-none justify-center flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-teal-500 to-primary-teal-600 text-white rounded-xl text-sm font-semibold hover:from-primary-teal-600 hover:to-primary-teal-700 shadow-[0_4px_12px_0_rgba(44,129,141,0.3)] hover:shadow-[0_6px_16px_0_rgba(44,129,141,0.4)] transition-all disabled:opacity-60 active:scale-95"
                            >
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>

                    {/* Status Stepper */}
                    <div className="mt-6 md:mt-8 pt-6 border-t border-gray-100 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-hide">
                        <div className="min-w-[320px]">
                            <div className="relative">
                                <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100" />
                                <div className="relative flex justify-between">
                                    {['PENDING', 'DOCUMENTS_COLLECTED', 'APPLIED', 'APPROVED'].map((step, i) => {
                                        const allSteps = ['PENDING', 'DOCUMENTS_COLLECTED', 'APPLIED', 'APPROVED', 'REJECTED'];
                                        const currentStepIndex = allSteps.indexOf(details.status);
                                        const stepIndex = ['PENDING', 'DOCUMENTS_COLLECTED', 'APPLIED', 'APPROVED'].indexOf(step);
                                        const isCompleted = stepIndex <= currentStepIndex && details.status !== 'REJECTED';
                                        const isActive = stepIndex === currentStepIndex;

                                        return (
                                            <div key={step} className="flex flex-col items-center gap-2 bg-white px-1 sm:px-2">
                                                <div className={cn(
                                                    "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all z-10",
                                                    isCompleted
                                                        ? "bg-gradient-to-br from-primary-teal-500 to-primary-teal-600 border-primary-teal-500 text-white shadow-[0_2px_8px_rgba(44,129,141,0.3)]"
                                                        : "bg-white border-gray-200 text-gray-400"
                                                )}>
                                                    {i + 1}
                                                </div>
                                                <span className={cn(
                                                    "text-[10px] sm:text-xs font-medium text-center leading-tight",
                                                    isCompleted ? "text-primary-teal-700" : "text-gray-400"
                                                )}>
                                                    {step.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Summary Stat Cards ─────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                    { label: 'Total Paid', value: `₹${totalPaid.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Fees', value: fees ? `₹${fees.toLocaleString()}` : '—', icon: CreditCard, color: 'text-primary-teal-600', bg: 'bg-primary-teal-50' },
                    { label: 'Documents', value: docsCount.toString(), icon: FileText, color: 'text-sky-600', bg: 'bg-sky-50' },
                    { label: 'Tasks', value: `${completedTasks}/${tasksCount}`, icon: ListChecks, color: 'text-violet-600', bg: 'bg-violet-50' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-200/60 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg", stat.bg)}>
                                <stat.icon className={cn("h-4 w-4", stat.color)} />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
                                <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Tab Navigation ──────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
                <div className="px-4 md:px-6 border-b border-gray-100 flex gap-2 md:gap-1 overflow-x-auto scrollbar-hide -mx-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-2 py-3.5 px-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap relative",
                                activeTab === tab.id
                                    ? "border-primary-teal-500 text-primary-teal-700"
                                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200"
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                            {tab.count !== undefined && tab.count > 0 && (
                                <span className={cn(
                                    "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                                    activeTab === tab.id
                                        ? "bg-primary-teal-100 text-primary-teal-700"
                                        : "bg-gray-100 text-gray-500"
                                )}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* ── Tab Content ─────────────────────────────────────── */}
                <div className="p-4 md:p-6 bg-gray-50/30">

                    {/* ════ OVERVIEW TAB ════ */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                            {/* Left: Editable Form */}
                            <div className="lg:col-span-2 space-y-6">
                                <form id="edit-app-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                        <h3 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
                                            <Edit3 className="h-4 w-4 text-primary-teal-500" />
                                            Application Details
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                                                <Controller
                                                    name="status"
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <CustomSelect
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            options={[
                                                                { value: 'PENDING', label: 'Pending' },
                                                                { value: 'DOCUMENTS_COLLECTED', label: 'Documents Collected' },
                                                                { value: 'APPLIED', label: 'Applied' },
                                                                { value: 'APPROVED', label: 'Approved' },
                                                                { value: 'REJECTED', label: 'Rejected' },
                                                            ]}
                                                            placeholder="Select Status"
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</label>
                                                <Controller
                                                    name="priority"
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <CustomSelect
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            options={[
                                                                { value: 'LOW', label: 'Low' },
                                                                { value: 'MEDIUM', label: 'Medium' },
                                                                { value: 'HIGH', label: 'High' },
                                                            ]}
                                                            placeholder="Select Priority"
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Visa Type</label>
                                                <Controller
                                                    name="visaType"
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <CustomSelect
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            options={VISA_TYPES.map(t => ({ value: t, label: t }))}
                                                            placeholder="Select Type"
                                                        />
                                                    )}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</label>
                                                <Controller
                                                    name="country"
                                                    control={form.control}
                                                    render={({ field }) => (
                                                        <CustomSelect
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            options={COUNTRIES.map(c => ({ value: c, label: c }))}
                                                            placeholder="Select Country"
                                                        />
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2 mt-5">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Internal Notes</label>
                                            <textarea
                                                {...form.register('notes')}
                                                rows={4}
                                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-primary-teal-500/10 focus:border-primary-teal-500 transition-all shadow-sm resize-none placeholder:text-gray-400"
                                                placeholder="Add internal notes about this application..."
                                            />
                                        </div>
                                    </div>

                                    {/* Tasks Section */}
                                    <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
                                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                <CheckSquare className="h-4 w-4 text-primary-teal-500" />
                                                Reminders & Tasks
                                            </h3>
                                            <span className="text-xs text-gray-500 font-medium">{completedTasks}/{tasksCount} completed</span>
                                        </div>
                                        <div className="divide-y divide-gray-50">
                                            {details.tasks && details.tasks.length > 0 ? (
                                                details.tasks.map((task: any) => (
                                                    <div key={task.id} className="p-4 flex items-start gap-3 hover:bg-gray-50/50 transition-colors">
                                                        <div className={cn(
                                                            "mt-0.5 h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                                                            task.status === 'DONE'
                                                                ? 'bg-emerald-500 border-emerald-500'
                                                                : 'border-gray-300 bg-white'
                                                        )}>
                                                            {task.status === 'DONE' && (
                                                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className={cn("text-sm font-medium", task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900')}>
                                                                {task.title}
                                                            </div>
                                                            <div className="text-xs text-gray-500 flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                                                                {task.dueDate && (
                                                                    <span className={cn(
                                                                        "flex items-center gap-1",
                                                                        new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? "text-red-500" : "text-amber-600"
                                                                    )}>
                                                                        <Clock className="h-3 w-3" />
                                                                        {format(new Date(task.dueDate), 'MMM d')}
                                                                    </span>
                                                                )}
                                                                {task.assignee && <span>• {task.assignee.name}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center">
                                                    <ListChecks className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">No tasks linked to this application.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {/* Right: Customer Info Sidebar */}
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-primary-teal-500" />
                                        Applicant Details
                                    </h3>
                                    <div className="flex items-center gap-4 mb-5">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-teal-400 to-primary-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                            {details.customer.fullName.charAt(0)}
                                        </div>
                                        <div>
                                            <Link
                                                href={`/dashboard/${firmId}/customers/${details.customerId}`}
                                                className="block font-bold text-gray-900 hover:text-primary-teal-600 transition-colors"
                                            >
                                                {details.customer.fullName}
                                            </Link>
                                            <div className="text-xs text-gray-500">{details.customer.email}</div>
                                        </div>
                                    </div>
                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Phone</span>
                                            <span className="text-gray-900 font-medium">{details.customer.phone || '—'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Passport</span>
                                            <span className="text-gray-900 font-medium">{details.customer.passports?.[0]?.number || '—'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Created</span>
                                            <span className="text-gray-900 font-medium">{format(new Date(details.createdAt), 'dd MMM yyyy')}</span>
                                        </div>
                                    </div>
                                    <div className="mt-5">
                                        <Link
                                            href={`/dashboard/${firmId}/customers/${details.customerId}`}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-primary-teal-600 bg-primary-teal-50 rounded-xl hover:bg-primary-teal-100 transition-colors"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            View Full Profile
                                        </Link>
                                    </div>
                                </div>

                                {/* Quick Financial Summary */}
                                <div className="bg-white rounded-xl border border-gray-200/60 p-6 shadow-sm">
                                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                                        <IndianRupee className="h-4 w-4 text-primary-teal-500" />
                                        Financial Summary
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Total Fees</span>
                                            <span className="text-gray-900 font-semibold">{fees ? `₹${fees.toLocaleString()}` : '—'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Total Paid</span>
                                            <span className="text-emerald-600 font-semibold">₹{totalPaid.toLocaleString()}</span>
                                        </div>
                                        {fees > 0 && (
                                            <>
                                                <div className="border-t border-gray-100 pt-3 flex justify-between text-sm">
                                                    <span className="text-gray-500">Outstanding</span>
                                                    <span className={cn("font-bold", outstanding > 0 ? "text-red-600" : "text-emerald-600")}>
                                                        ₹{outstanding.toLocaleString()}
                                                    </span>
                                                </div>
                                                {/* Progress bar */}
                                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-gradient-to-r from-primary-teal-400 to-primary-teal-500 h-full rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min((totalPaid / fees) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════ DOCUMENTS TAB ════ */}
                    {activeTab === 'documents' && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900">Customer Documents</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{docsCount} document{docsCount !== 1 ? 's' : ''} attached</p>
                                </div>
                                <button
                                    onClick={() => setIsUploadOpen(true)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-teal-500 to-primary-teal-600 text-white rounded-xl text-sm font-semibold hover:from-primary-teal-600 hover:to-primary-teal-700 shadow-[0_4px_12px_0_rgba(44,129,141,0.3)] transition-all"
                                >
                                    <Plus className="h-4 w-4" />
                                    Upload Document
                                </button>
                            </div>

                            {details.customer?.documents?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {details.customer.documents.map((doc: any) => (
                                        <div key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200/60 shadow-sm hover:border-primary-teal-200 hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2.5 bg-primary-teal-50 text-primary-teal-600 rounded-xl shrink-0">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                                                    <div className="text-xs text-gray-500">{doc.category} • {format(new Date(doc.uploadedAt), 'd MMM yyyy')}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                                                <a href={doc.fileUrl} target="_blank" className="p-2 text-gray-500 hover:text-primary-teal-600 hover:bg-primary-teal-50 rounded-lg transition-colors" title="View">
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                                <a href={doc.fileUrl} download className="p-2 text-gray-500 hover:text-primary-teal-600 hover:bg-primary-teal-50 rounded-lg transition-colors" title="Download">
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={FileText}
                                    title="No Documents"
                                    description="This customer hasn't uploaded any documents yet."
                                    action={{ label: 'Upload Document', onClick: () => setIsUploadOpen(true) }}
                                />
                            )}
                        </div>
                    )}

                    {/* ════ PAYMENTS TAB ════ */}
                    {activeTab === 'payments' && (
                        <div className="space-y-5 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-900">Payment History</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Total: <span className="text-emerald-600 font-semibold">₹{totalPaid.toLocaleString()}</span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsPaymentOpen(true)}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-teal-500 to-primary-teal-600 text-white rounded-xl text-sm font-semibold hover:from-primary-teal-600 hover:to-primary-teal-700 shadow-[0_4px_12px_0_rgba(44,129,141,0.3)] transition-all"
                                >
                                    <Plus className="h-4 w-4" />
                                    Record Payment
                                </button>
                            </div>

                            {details.payments?.length > 0 ? (
                                <div className="space-y-3">
                                    {details.payments.map((p: any) => (
                                        <div key={p.id} className="p-4 bg-white rounded-xl border border-gray-200/60 shadow-sm flex items-center justify-between hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "p-2.5 rounded-xl",
                                                    p.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                )}>
                                                    <IndianRupee className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">₹{Number(p.amount).toLocaleString()}</div>
                                                    <div className="text-xs text-gray-500">{p.method} • {format(new Date(p.createdAt), 'd MMM yyyy')}</div>
                                                    {p.notes && <div className="text-xs text-gray-400 mt-0.5">{p.notes}</div>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "px-2.5 py-1 rounded-lg text-xs font-bold",
                                                    p.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700' :
                                                        p.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-600'
                                                )}>
                                                    {p.status}
                                                </div>
                                                <button
                                                    onClick={() => handleDeletePayment(p.id)}
                                                    disabled={isPending}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Delete Payment"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon={IndianRupee}
                                    title="No Payments"
                                    description="No payments recorded for this application."
                                    action={{ label: 'Record Payment', onClick: () => setIsPaymentOpen(true) }}
                                />
                            )}
                        </div>
                    )}

                    {/* ════ TIMELINE TAB ════ */}
                    {activeTab === 'timeline' && (
                        <div className="animate-in fade-in duration-300">
                            <div className="mb-5">
                                <h3 className="font-bold text-gray-900">Activity Timeline</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Chronological history of all application events</p>
                            </div>
                            <Timeline events={timelineEvents} emptyMessage="No activity recorded yet for this application." />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
