import { TrendingUp, Download, ArrowUpRight, DollarSign, CreditCard, Filter, MoreHorizontal } from 'lucide-react';

export default function RevenuePage() {
    const transactions = [
        { id: 'TRX-9871', customer: 'Rahul Sharma', avatar: 'RS', service: 'Canada Study Visa', date: 'Jan 12, 2026', amount: '₹12,400', status: 'Paid' },
        { id: 'TRX-9872', customer: 'Priya Patel', avatar: 'PP', service: 'Passport Renewal', date: 'Jan 11, 2026', amount: '₹2,500', status: 'Pending' },
        { id: 'TRX-9873', customer: 'Amit Singh', avatar: 'AS', service: 'Australia Tourist Visa', date: 'Jan 10, 2026', amount: '₹15,000', status: 'Paid' },
        { id: 'TRX-9874', customer: 'Sneha Gupta', avatar: 'SG', service: 'Schengen Visa', date: 'Jan 09, 2026', amount: '₹8,900', status: 'Failed' },
        { id: 'TRX-9875', customer: 'Vikram Malhotra', avatar: 'VM', service: 'UK Work Visa', date: 'Jan 08, 2026', amount: '₹45,000', status: 'Paid' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Revenue</h1>
                    <p className="mt-2 text-base text-gray-600">Overview of financial performance and transactions.</p>
                </div>
                <div className="flex gap-3">
                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all hover:text-black">
                        <Filter className="h-4 w-4" />
                        Date Range
                    </button>
                    <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 flex items-center gap-2 shadow-md">
                        <Download className="h-4 w-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-xl p-6 shadow-lg ring-1 ring-white/10">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-gray-400 text-sm font-medium mb-1">Total Revenue (YTD)</div>
                            <div className="text-3xl font-bold tracking-tight">₹ 12,50,000</div>
                        </div>
                        <div className="p-2 bg-white/10 rounded-lg">
                            <DollarSign className="h-5 w-5 text-green-400" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-green-400 text-xs font-medium mt-4">
                        <ArrowUpRight className="h-3 w-3" />
                        +8% vs last year
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm ring-1 ring-gray-900/5">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-gray-500 text-sm font-medium mb-1">Pending Invoices</div>
                            <div className="text-3xl font-bold tracking-tight text-gray-900">₹ 45,000</div>
                        </div>
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <CreditCard className="h-5 w-5 text-amber-600" />
                        </div>
                    </div>
                    <div className="text-gray-500 text-xs mt-4">3 invoices awaiting payment</div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm ring-1 ring-gray-900/5">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-gray-500 text-sm font-medium mb-1">Avg. Deal Size</div>
                            <div className="text-3xl font-bold tracking-tight text-gray-900">₹ 25,000</div>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-green-600 text-xs font-medium mt-4">
                        <ArrowUpRight className="h-3 w-3" />
                        +2% this month
                    </div>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Transactions Table (2/3) */}
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
                            <button className="text-sm font-medium text-gray-600 hover:text-black hover:underline">View All</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Customer</th>
                                        <th className="px-6 py-4 font-medium">Service</th>
                                        <th className="px-6 py-4 font-medium">App Amount</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-4 py-4 font-medium"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {transactions.map((trx) => (
                                        <tr key={trx.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 ring-2 ring-white">
                                                        {trx.avatar}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{trx.customer}</div>
                                                        <div className="text-xs text-gray-500">{trx.date}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{trx.service}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{trx.amount}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${trx.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-100' : ''}
                                                    ${trx.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' : ''}
                                                    ${trx.status === 'Failed' ? 'bg-red-50 text-red-700 border border-red-100' : ''}
                                                `}>
                                                    {trx.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button className="p-1 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Chart / Stats (1/3) */}
                <div className="space-y-6">
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/5 p-6 h-full flex flex-col">
                        <h3 className="font-semibold text-gray-900 mb-6">Revenue Trend</h3>

                        {/* CSS Chart Placeholder */}
                        <div className="flex-1 flex items-end justify-between gap-2 h-48 border-b border-gray-100 pb-2 relative">
                            {[40, 65, 45, 80, 55, 90].map((h, i) => (
                                <div key={i} className="w-full bg-blue-50 hover:bg-blue-100 rounded-t-sm relative group transition-colors" style={{ height: `${h}%` }}>
                                    <div className="absolute bottom-0 w-full bg-blue-600 rounded-t-sm" style={{ height: `${h * 0.4}%` }}></div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                                        ₹ {h * 250}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-3 text-xs text-gray-500 font-medium">
                            <span>Jul</span>
                            <span>Aug</span>
                            <span>Sep</span>
                            <span>Oct</span>
                            <span>Nov</span>
                            <span>Dec</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
