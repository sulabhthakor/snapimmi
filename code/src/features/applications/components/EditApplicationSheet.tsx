'use client';

import { useState, useTransition, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Application, UpdateApplicationRequestSchema } from '../types';
import { updateApplication, getApplicationDetails } from '../server/actions';
import { deletePayment } from '@/features/payments/server/actions';
import { Loader2, X, Save, FileText, Clock, IndianRupee, LayoutDashboard, Download, Eye, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { VISA_TYPES, COUNTRIES } from '../constants';

import { RecordPaymentSheet } from '@/features/payments/components/RecordPaymentSheet';
import { Timeline } from '@/components/ui/Timeline';
import { EmptyState } from '@/components/ui/EmptyState';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { UploadDropzone } from '@/features/documents/components/UploadDropzone';

interface EditApplicationSheetProps {
    application: Application;
    isOpen: boolean;
    onClose: () => void;
}

export function EditApplicationSheet({ application, isOpen, onClose }: EditApplicationSheetProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'payments' | 'timeline'>('overview');
    const [isPending, startTransition] = useTransition();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const router = useRouter();

    // Data State
    const [details, setDetails] = useState<any>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Fetch details on open
    useEffect(() => {
        if (isOpen && application.id) {
            setIsLoadingDetails(true);
            startTransition(async () => {
                const data = await getApplicationDetails(application.id);
                setDetails(data);
                setIsLoadingDetails(false);
            });
        }
    }, [isOpen, application.id]);

    const form = useForm({
        resolver: zodResolver(UpdateApplicationRequestSchema),
        values: { // Use values to update when app changes
            id: application.id,
            country: application.country,
            visaType: application.visaType,
            status: application.status,
            priority: application.priority,
            notes: (details?.notes) || '',
        }
    });

    const onSubmit = (data: any) => {
        startTransition(async () => {
            const result = await updateApplication(data);
            if (result.success) {
                onClose();
                router.refresh();
                toast.success('Application updated successfully');
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
                // Refresh details
                if (application.id) {
                    const data = await getApplicationDetails(application.id);
                    setDetails(data);
                }
                router.refresh();
            } else {
                toast.error("Failed to delete payment");
            }
        });
    };

    if (!isOpen) return null;

    // Timeline Aggregation
    const timelineEvents = details ? [
        { type: 'created', date: new Date(details.createdAt), title: 'Application Created', icon: LayoutDashboard, color: 'bg-gray-100 text-gray-600' },
        ...(details.payments?.map((p: any) => ({
            type: 'payment',
            date: new Date(p.createdAt),
            title: `Payment Recorded: ₹${p.amount}`,
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
            color: 'bg-blue-50 text-blue-600'
        })) || [])
    ].sort((a, b) => b.date.getTime() - a.date.getTime()) : [];

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

            {/* Panel */}
            <div className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col animate-in slide-in-from-right duration-300">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">{application.visaType} - {application.country}</h2>
                        <p className="text-xs text-gray-500">{application.customerName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="px-6 border-b border-gray-100 flex gap-6 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'documents', label: 'Documents', icon: FileText },
                        { id: 'payments', label: 'Payments', icon: IndianRupee },
                        { id: 'timeline', label: 'Timeline', icon: Clock },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {isLoadingDetails && !details ? (
                        <div className="flex items-center justify-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && (
                                <form id="edit-app-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
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
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
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

                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Internal Notes</label>
                                            <textarea
                                                {...form.register('notes')}
                                                rows={4}
                                                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all shadow-sm resize-none placeholder:text-gray-400"
                                                placeholder="Add internal notes about this application..."
                                            />
                                        </div>

                                        {/* Reminders / Tasks Section */}
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <Clock className="h-4 w-4" /> Reminders & Tasks
                                            </h3>
                                            <div className="space-y-2">
                                                {details?.tasks?.length > 0 ? (
                                                    details.tasks.map((task: any) => (
                                                        <div key={task.id} className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                                                            <div className={`w-2 h-2 rounded-full ${task.status === 'DONE' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                            <div className="flex-1">
                                                                <div className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</div>
                                                                <div className="text-xs text-gray-500 flex gap-2">
                                                                    {task.dueDate && <span>Due {format(new Date(task.dueDate), 'd MMM')}</span>}
                                                                    {task.assignee && <span>• {task.assignee.name}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-xs text-gray-500 italic p-2 border border-dashed border-gray-300 rounded-lg text-center">No tasks linked to this application.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            )}

                            {activeTab === 'documents' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-gray-900">Customer Documents</h3>
                                        <button
                                            onClick={() => setIsUploadOpen(true)}
                                            className="text-xs bg-black text-white px-3 py-1.5 rounded-lg font-medium hover:bg-gray-800 flex items-center gap-1"
                                        >
                                            <Plus className="h-3 w-3" /> Upload
                                        </button>
                                    </div>

                                    {details?.customer?.documents?.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-3">
                                            {details.customer.documents.map((doc: any) => (
                                                <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition-all group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                            <FileText className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                                                            <div className="text-xs text-gray-500">{doc.category} • {format(new Date(doc.uploadedAt), 'd MMM yyyy')}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <a href={doc.fileUrl} target="_blank" className="p-2 aspect-square flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg" title="View">
                                                            <Eye className="h-4 w-4" />
                                                        </a>
                                                        <a href={doc.fileUrl} download className="p-2 aspect-square flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg" title="Download">
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState icon={FileText} title="No Documents" description="This customer hasn't uploaded any documents yet." />
                                    )}
                                </div>
                            )}

                            {activeTab === 'payments' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-gray-900">Payment History</h3>
                                        <button
                                            onClick={() => setIsPaymentOpen(true)}
                                            className="text-xs bg-black text-white px-3 py-1.5 rounded-lg font-medium hover:bg-gray-800 flex items-center gap-1"
                                        >
                                            <Plus className="h-3 w-3" /> Record
                                        </button>
                                    </div>

                                    {details?.payments?.length > 0 ? (
                                        <div className="space-y-3">
                                            {details.payments.map((p: any) => (
                                                <div key={p.id} className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-full ${p.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                            <IndianRupee className="h-5 w-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">₹{p.amount}</div>
                                                            <div className="text-xs text-gray-500">{p.method} • {format(new Date(p.createdAt), 'd MMM yyyy')}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <div className={`px-2 py-1 rounded-md text-xs font-bold ${p.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                                                            p.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-600'
                                                            }`}>
                                                            {p.status}
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeletePayment(p.id)}
                                                            disabled={isPending}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                                            title="Delete Payment"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState icon={IndianRupee} title="No Payments" description="No payments recorded for this application." />
                                    )}
                                </div>
                            )}

                            {activeTab === 'timeline' && (
                                <div>
                                    <Timeline events={timelineEvents} />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {
                    activeTab === 'overview' && (
                        <div className="p-6 border-t border-gray-100 bg-white flex justify-between gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={() => setIsPaymentOpen(true)}
                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                                Record Payment
                            </button>
                            <div className="flex gap-3">
                                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black">Cancel</button>
                                <button type="submit" form="edit-app-form" disabled={isPending} className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 font-medium inline-flex items-center gap-2 shadow-md">
                                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    )
                }
            </div >

            <RecordPaymentSheet
                applicationId={application.id}
                applicationTitle={`${application.country} - ${application.visaType}`}
                isOpen={isPaymentOpen}
                onClose={() => {
                    setIsPaymentOpen(false);
                    // Refresh details on payment close
                    if (application.id) {
                        startTransition(async () => {
                            const data = await getApplicationDetails(application.id);
                            setDetails(data);
                        });
                    }
                    router.refresh();
                }}
            />

            {isUploadOpen && (
                <UploadDropzone
                    customerId={application.customerId}
                    applicationId={application.id}
                    defaultCategory="Application"
                    onClose={() => {
                        setIsUploadOpen(false);
                        if (application.id) {
                            startTransition(async () => {
                                const data = await getApplicationDetails(application.id);
                                setDetails(data);
                            });
                        }
                        router.refresh();
                    }}
                />
            )}
        </div >
    );
}
