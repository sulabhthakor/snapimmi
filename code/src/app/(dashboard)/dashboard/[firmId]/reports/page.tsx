import { FileText, Download } from 'lucide-react';

export default function ReportsPage() {
    const reports = [
        { id: 1, name: 'Monthly Financial Report', date: 'Jan 2026', type: 'PDF' },
        { id: 2, name: 'Customer Acquisition', date: 'Q4 2025', type: 'CSV' },
        { id: 3, name: 'Visa Success Rate', date: '2025 Yearly', type: 'PDF' },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Reports</h1>
                    <p className="mt-2 text-base text-gray-600">Download and analyze firm performance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => (
                    <div key={report.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <FileText className="h-6 w-6" />
                            </div>
                            <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {report.type}
                            </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{report.name}</h3>
                        <p className="text-sm text-gray-500 mb-6">Generated: {report.date}</p>
                        <button className="w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-black hover:text-black transition-colors flex items-center justify-center gap-2">
                            <Download className="h-4 w-4" />
                            Download
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
