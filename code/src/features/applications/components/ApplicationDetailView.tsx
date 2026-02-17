'use client';

import Link from 'next/link';
import {
    ArrowLeft, Calendar, User, FileText, CheckSquare, Settings,
    MoreHorizontal, Download, ExternalLink, IndianRupee, Clock, Flag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { EditApplicationSheet } from './EditApplicationSheet';
import { RecordPaymentSheet } from '@/features/payments/components/RecordPaymentSheet';
import { updateApplicationStatus } from '../server/actions';
import { toast } from 'sonner';

interface ApplicationDetailViewProps {
    application: any;
    firmId: string;
}

export function ApplicationDetailView({ application, firmId }: ApplicationDetailViewProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    // Calculate totals
    const totalPaid = application.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
    const fees = application.fees || 0; // Assuming fees field might exist or we use a hardcoded value? Schema has `fees` optional.

    const statusColors = {
        PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        DOCUMENTS_COLLECTED: 'bg-primary-teal-100 text-primary-teal-800 border-primary-teal-200',
        APPLIED: 'bg-primary-teal-200 text-primary-teal-900 border-primary-teal-300',
        APPROVED: 'bg-green-100 text-green-800 border-green-200',
        REJECTED: 'bg-red-100 text-red-800 border-red-200',
    };

    const handleStatusUpdate = async (newStatus: string) => {
        const res = await updateApplicationStatus(application.id, newStatus as any);
        if (res.success) {
            toast.success("Status updated");
        } else {
            toast.error(res.error || "Failed to update status");
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <EditApplicationSheet
                application={application}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
            />

            <RecordPaymentSheet
                applicationId={application.id}
                applicationTitle={`${application.visaType} - ${application.targetCountry}`}
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
            />

            {/* Breadcrumb / Back Navigation */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Link href={`/dashboard/${firmId}/applications`} className="hover:text-black flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Applications
                </Link>
                <span>/</span>
                <span className="font-medium text-gray-900">{application.visaType} - {application.targetCountry}</span>
            </div>

            {/* Header Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">{application.visaType}</h1>
                            <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border", statusColors[application.status as keyof typeof statusColors])}>
                                {application.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span className="flex items-center gap-1.5">
                                <Flag className="h-3.5 w-3.5" />
                                {application.targetCountry}
                            </span>
                            <span className="text-gray-300">|</span>
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                Created {format(new Date(application.createdAt), 'MMM d, yyyy')}
                            </span>
                            <span className="text-gray-300">|</span>
                            <span className="flex items-center gap-1.5 text-gray-900 font-medium">
                                ID: {application.id.slice(0, 8)}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsPaymentOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                            <IndianRupee className="h-4 w-4" />
                            Record Payment
                        </button>
                        <button
                            onClick={() => setIsEditOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
                        >
                            <Settings className="h-4 w-4" />
                            Manage Application
                        </button>
                    </div>
                </div>

                {/* Status Stepper (Simplified) */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className="relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2" />
                        <div className="relative flex justify-between">
                            {['PENDING', 'DOCUMENTS_COLLECTED', 'APPLIED', 'APPROVED'].map((step, i) => {
                                const currentStepIndex = ['PENDING', 'DOCUMENTS_COLLECTED', 'APPLIED', 'APPROVED', 'REJECTED'].indexOf(application.status);
                                const stepIndex = ['PENDING', 'DOCUMENTS_COLLECTED', 'APPLIED', 'APPROVED'].indexOf(step);
                                const isCompleted = stepIndex <= currentStepIndex && application.status !== 'REJECTED';
                                const isActive = stepIndex === currentStepIndex;

                                return (
                                    <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors z-10",
                                            isCompleted ? "bg-slate-900 border-slate-900 text-white" : "bg-white border-gray-200 text-gray-400"
                                        )}>
                                            {i + 1}
                                        </div>
                                        <span className={cn("text-xs font-medium", isCompleted ? "text-slate-900" : "text-gray-400")}>
                                            {step.replace('_', ' ')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Customer & Context */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            Applicant Details
                        </h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-teal-500 to-primary-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                {application.customer.fullName.charAt(0)}
                            </div>
                            <div>
                                <Link
                                    href={`/dashboard/${firmId}/customers/${application.customerId}`}
                                    className="block font-bold text-gray-900 hover:text-primary-teal-600 hover:underline"
                                >
                                    {application.customer.fullName}
                                </Link>
                                <div className="text-xs text-gray-500">{application.customer.email}</div>
                            </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-gray-50">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Phone</span>
                                <span className="text-gray-900 font-medium">{application.customer.phone || '—'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Passport</span>
                                <span className="text-gray-900 font-medium">{application.customer.passports?.[0]?.number || '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Pending Tasks */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <CheckSquare className="h-4 w-4 text-gray-500" />
                                Tasks
                            </h3>
                            {/* Add task button could go here */}
                        </div>
                        <div className="divide-y divide-gray-100">
                            {application.tasks && application.tasks.length > 0 ? (
                                application.tasks.map((task: any) => (
                                    <div key={task.id} className="p-3 flex items-start gap-3 hover:bg-gray-50">
                                        <div className={`mt-0.5 h-4 w-4 rounded border ${task.status === 'DONE' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`} />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                            {task.dueDate && (
                                                <div className="text-xs text-amber-600 flex items-center gap-1 mt-0.5">
                                                    <Clock className="h-3 w-3" />
                                                    {format(new Date(task.dueDate), 'MMM d')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-sm text-gray-500">No pending tasks.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Documents & payments */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Documents */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-gray-500" />
                                Related Documents
                            </h3>
                            <button className="text-sm font-medium text-primary-teal-600 hover:underline">Upload Document</button>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Filter docs for this application? 
                                Currently fetching ALL customer docs. 
                                Ideally we link docs to application explicitly (schema change done).
                                For now, showing all Customer docs is a fallback, but we should prioritize application-linked ones.
                            */}
                            {application.customer.documents?.length > 0 ? (
                                application.customer.documents.map((doc: any) => (
                                    <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group">
                                        <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-500 group-hover:text-primary-teal-600 group-hover:bg-primary-teal-50">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                                            <div className="text-xs text-gray-500">{doc.category}</div>
                                        </div>
                                        <a href={doc.fileUrl} target="_blank" className="p-2 text-gray-400 hover:text-black">
                                            <ExternalLink className="h-4 w-4" />
                                        </a>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 text-center py-8 text-gray-500">
                                    No documents attached.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment History */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <IndianRupee className="h-5 w-5 text-gray-500" />
                                Financials
                            </h3>
                            <div className="text-sm font-medium text-gray-900">
                                Total Paid: <span className="text-green-600">₹{totalPaid.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {application.payments?.length > 0 ? (
                                application.payments.map((p: any) => (
                                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                        <div>
                                            <div className="font-medium text-gray-900">₹{Number(p.amount).toLocaleString()}</div>
                                            <div className="text-xs text-gray-500">{format(new Date(p.createdAt), 'MMM d, yyyy')} • {p.method}</div>
                                        </div>
                                        <div className={cn(
                                            "px-2.5 py-0.5 rounded-full text-xs font-bold capitalize",
                                            p.status === 'COMPLETED' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                        )}>
                                            {p.status}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No payments recorded.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
