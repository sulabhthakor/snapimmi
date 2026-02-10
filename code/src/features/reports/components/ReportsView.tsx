'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { FileDown, Loader2, Users, CreditCard, FileText } from 'lucide-react';
import { generateCustomerReport, generateFinancialReport, generateApplicationsReport } from '../server/actions';
import { toast } from 'sonner';

export function ReportsView({ firmId }: { firmId: string }) {
    const [downloading, setDownloading] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || undefined;
    const to = searchParams.get('to') || undefined;

    const handleDownload = async (type: 'customers' | 'financials' | 'applications') => {
        setDownloading(type);
        try {
            let result;
            if (type === 'customers') result = await generateCustomerReport(firmId, from, to);
            else if (type === 'financials') result = await generateFinancialReport(firmId, from, to);
            else if (type === 'applications') result = await generateApplicationsReport(firmId, from, to);

            if (result) {
                // Create Blob and trigger download
                const blob = new Blob([result.content], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', result.filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded`);
            }
        } catch (error) {
            console.error("Report generation failed", error);
            toast.error("Failed to generate report");
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-end">
                <DateRangePicker firmId={firmId} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customers Report */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                        <Users className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Customer Data</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">Export all customer details including contact info and family grouping.</p>
                    <button
                        onClick={() => handleDownload('customers')}
                        disabled={!!downloading}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-black font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                        {downloading === 'customers' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                        Download CSV
                    </button>
                </div>

                {/* Financial Report */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-10 w-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
                        <CreditCard className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Financial Records</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">Export payment history, revenue data, and transaction details.</p>
                    <button
                        onClick={() => handleDownload('financials')}
                        disabled={!!downloading}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-black font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                        {downloading === 'financials' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                        Download CSV
                    </button>
                </div>

                {/* Applications Report */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                        <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Applications</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">Export application status, tracking numbers, and priorities.</p>
                    <button
                        onClick={() => handleDownload('applications')}
                        disabled={!!downloading}
                        className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-black font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                        {downloading === 'applications' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                        Download CSV
                    </button>
                </div>
            </div>
        </div>
    );
}
