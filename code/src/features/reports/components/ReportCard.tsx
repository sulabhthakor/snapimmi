'use client';

import { FileText, Download, Loader2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

type ReportType = 'PDF' | 'CSV';

interface ReportCardProps {
    name: string;
    description: string;
    type: ReportType;
    action: () => Promise<{ filename: string; content: string }>;
}

export function ReportCard({ name, description, type, action }: ReportCardProps) {
    const [isPending, startTransition] = useTransition();

    const handleDownload = () => {
        startTransition(async () => {
            try {
                const { filename, content } = await action();

                // Create Blob and trigger download
                const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                if (link.download !== undefined) {
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', filename);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    toast.success('Report downloaded successfully');
                }
            } catch (error) {
                console.error('Download failed', error);
                toast.error('Failed to generate report');
            }
        });
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group h-full flex flex-col">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FileText className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {type}
                </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1">{description}</p>
            <button
                onClick={handleDownload}
                disabled={isPending}
                className="w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Download className="h-4 w-4" />
                        Download
                    </>
                )}
            </button>
        </div>
    );
}
