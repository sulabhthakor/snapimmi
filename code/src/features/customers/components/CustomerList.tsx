'use client';

import { useState, useCallback, useTransition } from 'react';
import { Customer } from '../types';
import { getCustomers } from '../server/actions';
import { useParams } from 'next/navigation';

export function CustomerList({ initialData }: { initialData: { data: Customer[], total: number } }) {
    const [customers, setCustomers] = useState(initialData.data);
    const [searchTerm, setSearchTerm] = useState('');
    const [isPending, startTransition] = useTransition();
    const params = useParams();
    const firmId = params.firmId as string;

    const handleSearch = useCallback((term: string) => {
        setSearchTerm(term);
        startTransition(async () => {
            const result = await getCustomers({ search: term, page: 1, limit: 10, status: 'ALL' });
            // @ts-ignore
            setCustomers(result.data);
        });
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <input
                    type="text"
                    placeholder="Search customers..."
                    className="flex h-10 w-[300px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    onChange={(e) => handleSearch(e.target.value)}
                />
                <a href={`/dashboard/${firmId}/customers/new`} className="bg-black text-white px-4 py-2 rounded-md hover:bg-black/90 text-sm font-medium">
                    Add Customer
                </a>
            </div>

            <div className="rounded-md border">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted/50 font-medium">
                        <tr className="border-b">
                            <th className="p-4 align-middle">Name</th>
                            <th className="p-4 align-middle">Phone</th>
                            <th className="p-4 align-middle">Applications</th>
                            <th className="p-4 align-middle">Documents</th>
                            <th className="p-4 align-middle text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id} className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-4 flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                                        {customer.fullName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium">{customer.fullName}</div>
                                        <div className="text-muted-foreground text-xs">{customer.email}</div>
                                    </div>
                                </td>
                                <td className="p-4">{customer.phone}</td>
                                <td className="p-4">
                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                        {customer._count?.applications || 0}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                        {customer._count?.documents || 0}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-blue-600 hover:underline mr-2">View</button>
                                </td>
                            </tr>
                        ))}
                        {customers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                                    No customers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isPending && <p className="text-sm text-muted-foreground">Loading...</p>}
        </div>
    );
}
