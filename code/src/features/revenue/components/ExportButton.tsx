'use client';

import { Download } from 'lucide-react';
import { useState } from 'react';
import { exportTransactionsCSV } from '@/features/revenue/server/actions';
import { useSearchParams } from 'next/navigation';
import { format } from 'date-fns';

interface ExportButtonProps {
    firmId: string;
}

export function ExportButton({ firmId }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);
    const searchParams = useSearchParams();

    const handleExport = async () => {
        setIsExporting(true);

        try {
            const status = searchParams.get('status') || undefined;
            const dateFrom = searchParams.get('from') || undefined;
            const dateTo = searchParams.get('to') || undefined;

            const csvContent = await exportTransactionsCSV(firmId, {
                status,
                dateFrom,
                dateTo
            });

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `revenue_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export report');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 flex items-center gap-2 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Report'}
        </button>
    );
}
