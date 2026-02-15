'use client';

import { useState, useTransition, useCallback } from 'react';
import { Application, STATUS_COLORS, STATUS_LABELS, Priority } from '../types';
import { getApplications } from '../server/actions';
import { EditApplicationSheet } from './EditApplicationSheet';
import { Search, ChevronRight } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface ApplicationTableProps {
    initialData: Application[];
    firmId: string;
}

const PRIORITY_COLORS: Record<Priority, string> = {
    HIGH: 'bg-red-50 text-red-700 border-red-100',
    MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    LOW: 'bg-gray-50 text-gray-700 border-gray-100',
};

export function ApplicationTable({ initialData, firmId }: ApplicationTableProps) {
    const [applications, setApplications] = useState<Application[]>(initialData);
    const [isPending, startTransition] = useTransition();
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        status: 'ALL',
        priority: 'ALL'
    });

    const router = useRouter();

    const fetchApplications = (newFilters: any) => {
        startTransition(async () => {
            const result = await getApplications(firmId, newFilters);
            setApplications(result);
        });
    };

    const handleSearch = (term: string) => {
        const newFilters = { ...filters, search: term };
        setFilters(newFilters);
        fetchApplications(newFilters);
    };

    const handleFilterChange = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        fetchApplications(newFilters);
    };

    return (
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="relative w-full sm:w-[350px]">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search applications..."
                        className="w-full pl-11 pr-4 py-2.5"
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="w-full sm:w-48">
                        <CustomSelect
                            value={filters.status}
                            onChange={(val) => handleFilterChange('status', val)}
                            options={[
                                { value: 'ALL', label: 'All Status' },
                                { value: 'PENDING', label: 'Pending' },
                                { value: 'DOCUMENTS_COLLECTED', label: 'Documents Collected' },
                                { value: 'APPLIED', label: 'Applied' },
                                { value: 'APPROVED', label: 'Approved' },
                                { value: 'REJECTED', label: 'Rejected' },
                            ]}
                            placeholder="All Status"
                        />
                    </div>

                    <div className="w-full sm:w-48">
                        <CustomSelect
                            value={filters.priority}
                            onChange={(val) => handleFilterChange('priority', val)}
                            options={[
                                { value: 'ALL', label: 'All Priority' },
                                { value: 'HIGH', label: 'High' },
                                { value: 'MEDIUM', label: 'Medium' },
                                { value: 'LOW', label: 'Low' },
                            ]}
                            placeholder="All Priority"
                        />
                    </div>
                </div>
            </div>

            {/* Table - Desktop */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-700 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Applicant</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Priority</th>
                                <th className="px-6 py-4">Last Updated</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {applications.map((app) => (
                                <tr
                                    key={app.id}
                                    onClick={() => setEditingApp(app)}
                                    className="group hover:bg-gray-50 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-xs">
                                                {app.customerName.charAt(0)}
                                            </div>
                                            <div className="font-semibold text-gray-900 group-hover:text-black transition-colors">
                                                {app.customerName}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">{app.visaType}</div>
                                        <div className="text-xs text-gray-600 font-medium">{app.country}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                                            {STATUS_LABELS[app.status]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${PRIORITY_COLORS[app.priority]}`}>
                                            {app.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(app.lastUpdated).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 inline-block" />
                                    </td>
                                </tr>
                            ))}
                            {applications.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No applications found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cards - Mobile */}
            <div className="md:hidden bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-y divide-gray-100">
                {applications.map((app) => (
                    <div
                        key={app.id}
                        onClick={() => setEditingApp(app)}
                        className="p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm shrink-0">
                                    {app.customerName.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <div className="font-semibold text-gray-900 truncate">{app.customerName}</div>
                                    <div className="text-xs text-gray-500">{app.visaType} · {app.country}</div>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 ml-2" />
                        </div>
                        <div className="flex items-center gap-2 ml-12 flex-wrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${STATUS_COLORS[app.status]}`}>
                                {STATUS_LABELS[app.status]}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${PRIORITY_COLORS[app.priority]}`}>
                                {app.priority}
                            </span>
                            <span className="text-[11px] text-gray-400 ml-auto">
                                {new Date(app.lastUpdated).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
                {applications.length === 0 && (
                    <div className="px-6 py-12 text-center text-gray-500">
                        No applications found matching your filters.
                    </div>
                )}
            </div>

            {/* Edit Sheet */}
            {editingApp && (
                <EditApplicationSheet
                    application={editingApp}
                    isOpen={!!editingApp}
                    onClose={() => {
                        setEditingApp(null);
                        // Refresh list logic is inside sheet but we might need to trigger re-fetch here if needed
                        // Ideally router.refresh() in sheet handles it, but local state needs update?
                        // For simplicity, just refetching when sheet closes or relying on router refresh + effect?
                        // The sheet calls router.refresh(). If we want table to update immediately without full page reload,
                        // we should pass a callback.
                        fetchApplications(filters);
                    }}
                />
            )}
        </div>
    );
}
