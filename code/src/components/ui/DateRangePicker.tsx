'use client';

import { useState, useRef, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import { format, subDays, subMonths, subYears, startOfDay, endOfDay } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';

interface DateRangePickerProps {
    firmId: string;
}

const presets = [
    { label: 'Last 7 Days', getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
    { label: 'Last 30 Days', getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
    { label: 'Last 3 Months', getValue: () => ({ from: subMonths(new Date(), 3), to: new Date() }) },
    { label: 'Last Year', getValue: () => ({ from: subYears(new Date(), 1), to: new Date() }) },
];

export function DateRangePicker({ firmId }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read current filters from URL
    useEffect(() => {
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        if (from) setFromDate(from);
        if (to) setToDate(to);
    }, [searchParams]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const applyDateRange = (from: Date | null, to: Date | null) => {
        const params = new URLSearchParams(searchParams.toString());

        if (from && to) {
            params.set('from', format(startOfDay(from), 'yyyy-MM-dd'));
            params.set('to', format(endOfDay(to), 'yyyy-MM-dd'));
        } else {
            params.delete('from');
            params.delete('to');
        }

        router.push(`/dashboard/${firmId}/revenue?${params.toString()}`);
        setIsOpen(false);
    };

    const applyPreset = (getValue: () => { from: Date; to: Date }) => {
        const { from, to } = getValue();
        applyDateRange(from, to);
    };

    const applyCustomRange = () => {
        if (fromDate && toDate) {
            applyDateRange(new Date(fromDate), new Date(toDate));
        }
    };

    const clearFilters = () => {
        setFromDate('');
        setToDate('');
        applyDateRange(null, null);
    };

    const hasActiveFilter = searchParams.has('from') || searchParams.has('to');

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`bg-white border ${hasActiveFilter ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-300'} text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all hover:text-black`}
            >
                <Calendar className="h-4 w-4" />
                {hasActiveFilter ? 'Date: Custom Range' : 'Date Range'}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 z-50 w-80 bg-white border border-gray-200 rounded-lg shadow-xl ring-1 ring-black/5 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 text-sm">Select Date Range</h3>
                            {hasActiveFilter && (
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
                                >
                                    <X className="h-3 w-3" />
                                    Clear
                                </button>
                            )}
                        </div>

                        {/* Presets */}
                        <div className="space-y-1 mb-4">
                            {presets.map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => applyPreset(preset.getValue)}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom Range */}
                        <div className="pt-3 border-t border-gray-100">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Custom Range
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">From</label>
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">To</label>
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <button
                                    onClick={applyCustomRange}
                                    disabled={!fromDate || !toDate}
                                    className="w-full bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Apply Custom Range
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
