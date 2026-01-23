'use client';

import { useState, useTransition, useEffect } from 'react';
import { Check, ChevronsUpDown, Search, User, Loader2 } from 'lucide-react';
import { getCustomers } from '@/features/customers/server/actions';
// import { useDebounce } from '@/hooks/use-debounce';

// Simple debounce impl since I don't want to assume hooks exist
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

interface CustomerSearchInputProps {
    onSelect: (customer: { id: string; fullName: string }) => void;
    placeholder?: string;
}

export function CustomerSearchInput({ onSelect, placeholder = "Search customer..." }: CustomerSearchInputProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounceValue(search, 500);
    const [results, setResults] = useState<any[]>([]);
    const [isPending, startTransition] = useTransition();
    const [selectedName, setSelectedName] = useState('');

    useEffect(() => {
        if (debouncedSearch.length < 2) {
            setResults([]);
            return;
        }

        startTransition(async () => {
            const res = await getCustomers({ search: debouncedSearch, page: 1, limit: 10, status: 'ALL' });
            setResults(res.data);
            setOpen(true);
        });
    }, [debouncedSearch]);

    const handleSelect = (customer: any) => {
        setSelectedName(customer.fullName);
        onSelect({ id: customer.id, fullName: customer.fullName });
        setOpen(false);
        setSearch(''); // Clear search or keep name? Usually keep name.
    };

    return (
        <div className="relative w-full">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <input
                    type="text"
                    placeholder={selectedName || placeholder}
                    className={`w-full rounded-lg border bg-white pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all ${selectedName ? 'border-green-500 ring-1 ring-green-100 text-green-700 font-medium' : 'border-gray-200 text-gray-900'
                        }`}
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        if (selectedName) setSelectedName(''); // Clear selection if typing
                    }}
                    onFocus={() => {
                        if (results.length > 0) setOpen(true);
                    }}
                />
                {isPending && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-gray-400" />}
            </div>

            {open && results.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-white rounded-lg border border-gray-100 shadow-xl z-50 max-h-60 overflow-y-auto">
                    {results.map((customer) => (
                        <div
                            key={customer.id}
                            className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0"
                            onClick={() => handleSelect(customer)}
                        >
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                <User className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-900">{customer.fullName}</div>
                                <div className="text-xs text-gray-500">{customer.phone || customer.email}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
