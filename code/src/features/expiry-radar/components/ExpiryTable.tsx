'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Calendar,
    AlertTriangle,
    Search,
    Filter,
    ChevronRight,
    FileText,
    Plane
} from 'lucide-react';

interface ExpiryItem {
    id: string;
    customerId: string;
    customerName: string;
    type: 'Passport' | 'Visa';
    detail: string; // e.g., "USA B1/B2" or "Passport Number"
    expiryDate: string;
    daysLeft: number;
}

interface ExpiryTableProps {
    data: ExpiryItem[];
    firmId: string;
}

export function ExpiryTable({ data, firmId }: ExpiryTableProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL'); // ALL, CRITICAL, URGENT

    const getStatusColor = (days: number) => {
        if (days <= 30) return 'bg-red-50 text-red-700 border-red-100';
        if (days <= 60) return 'bg-amber-50 text-amber-700 border-amber-100';
        return 'bg-green-50 text-green-700 border-green-100';
    };

    const getStatusLabel = (days: number) => {
        if (days <= 30) return 'Critical';
        if (days <= 60) return 'Urgent';
        return 'Upcoming';
    };

    const filteredData = data.filter(item => {
        const matchesSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.detail.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = true;
        if (filterType === 'CRITICAL') matchesFilter = item.daysLeft <= 30;
        if (filterType === 'URGENT') matchesFilter = item.daysLeft > 30 && item.daysLeft <= 60;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative w-full sm:w-[350px]">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or document..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all placeholder:text-gray-500 text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <select
                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 focus:outline-none focus:border-black cursor-pointer bg-white"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="ALL">All Expiries</option>
                        <option value="CRITICAL">Critical (Is &lt; 30 days)</option>
                        <option value="URGENT">Urgent (30-60 days)</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-200 text-gray-600 font-medium">
                            <tr>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Document</th>
                                <th className="px-6 py-4">Expiry Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredData.length > 0 ? (
                                filteredData.map((item) => (
                                    <tr
                                        key={item.id}
                                        onClick={() => router.push(`/dashboard/${firmId}/customers/${item.customerId}`)}
                                        className="group hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 group-hover:text-black transition-colors">{item.customerName}</div>
                                            <div className="text-xs text-gray-500">ID: {item.customerId.slice(0, 8)}...</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${item.type === 'Passport' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                    {item.type === 'Passport' ? <FileText className="h-4 w-4" /> : <Plane className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{item.type}</div>
                                                    <div className="text-xs text-gray-500">{item.detail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-900 font-medium">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {item.expiryDate}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5 font-medium">
                                                {item.daysLeft} days remaining
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(item.daysLeft)}`}>
                                                {item.daysLeft <= 30 && <AlertTriangle className="h-3 w-3" />}
                                                {getStatusLabel(item.daysLeft)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-900 inline-block transition-colors" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center">
                                                <Search className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <p className="font-medium">No expiring documents found</p>
                                            <p className="text-xs">Try adjusting your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
