'use client';

import { useState, useCallback, useTransition } from 'react';
import { Customer } from '../types';
import { getCustomers } from '../server/actions';
import { useParams, useRouter } from 'next/navigation';
import { Search, Plus, Filter, MoreHorizontal, FileText, FolderClosed } from 'lucide-react';
import Link from 'next/link';

export function CustomerList({ initialData }: { initialData: { data: Customer[], total: number } }) {
    const [customers, setCustomers] = useState(initialData.data);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPending, startTransition] = useTransition();
    const params = useParams();
    const router = useRouter();
    const firmId = params.firmId as string;

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        startTransition(async () => {
            const result = await getCustomers({ search: term, page: 1, limit: 10, status: 'ALL' });
            // @ts-ignore
            setCustomers(result.data);
        });
    }, []);

    // Helper to get initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-[350px]">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        className="block w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm"
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 hover:text-black transition-colors shadow-sm">
                        <Filter className="h-4 w-4" />
                        Filters
                    </button>
                    <Link
                        href={`/dashboard/${firmId}/customers/new`}
                        className="flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        Add Customer
                    </Link>
                </div>
            </div>

            {/* Premium Table */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-900">Customer</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Contact Info</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Active Apps</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Documents</th>
                                <th className="px-6 py-4 text-right font-semibold text-gray-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-white group-hover:ring-gray-100 transition-all">
                                                {getInitials(customer.fullName)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{customer.fullName}</div>
                                                <div className="text-xs text-gray-500 font-medium">ID: {customer.id.slice(-4).toUpperCase()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="text-gray-900 font-medium">{customer.email || '—'}</div>
                                            <div className="text-gray-500">{customer.phone}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {(customer._count?.applications || 0) > 0 ? (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold">
                                                <FileText className="h-3 w-3" />
                                                {customer._count?.applications} Active
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium">
                                            <FolderClosed className="h-3 w-3 text-gray-500" />
                                            {customer._count?.documents || 0} Files
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-black transition-colors p-2 hover:bg-gray-100 rounded-full">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {customers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                                                <Users className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <p className="text-lg font-medium text-gray-900">No customers found</p>
                                            <p className="text-sm">Get started by creating your first customer.</p>
                                            <Link
                                                href={`/dashboard/${firmId}/customers/new`}
                                                className="mt-4 text-sm font-medium text-black hover:underline"
                                            >
                                                Add New Customer
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer (Static for now) */}
                {customers.length > 0 && (
                    <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <div>Showing <span className="font-medium text-gray-900">{customers.length}</span> results</div>
                        <div className="flex gap-2">
                            <button disabled className="px-3 py-1 rounded border bg-white disabled:opacity-50">Previous</button>
                            <button disabled className="px-3 py-1 rounded border bg-white disabled:opacity-50">Next</button>
                        </div>
                    </div>
                )}
            </div>

            {isPending && (
                <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
            )}
        </div>
    );
}

// Icon for empty state
function Users(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
