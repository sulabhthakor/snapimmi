'use client';

import { useState, useTransition, useCallback } from 'react';
import { Application, STATUS_COLORS, STATUS_LABELS, Priority } from '../types';
import { getApplications } from '../server/actions';
import { EditApplicationSheet } from './EditApplicationSheet';
import { Search, Filter, MoreHorizontal, FileText, ChevronRight } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative w-full sm:w-[350px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-700" />
                    <input
                        type="text"
                        placeholder="Search applications..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all placeholder:text-gray-600 text-gray-900"
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                    <select
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 focus:outline-none focus:border-black cursor-pointer bg-white"
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        value={filters.status}
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="DOCUMENTS_COLLECTED">Documents Collected</option>
                        <option value="APPLIED">Applied</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                    </select>

                    <select
                        className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 focus:outline-none focus:border-black cursor-pointer bg-white"
                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                        value={filters.priority}
                    >
                        <option value="ALL">All Priority</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
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
