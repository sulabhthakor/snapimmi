import { TrendingUp, Download, ArrowUpRight, DollarSign, CreditCard, Filter, MoreHorizontal, Calendar } from 'lucide-react';
import { getRevenueStats, getRecentTransactions, getRevenueChartData } from '@/features/revenue/server/actions';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { PaymentActionsMenu } from '@/features/payments/components/PaymentActionsMenu';
import { TransactionRow } from '@/features/revenue/components/TransactionRow';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { ExportButton } from '@/features/revenue/components/ExportButton';

export default async function RevenuePage({
    params,
    searchParams
}: {
    params: Promise<{ firmId: string }>;
    searchParams: Promise<{ status?: string; from?: string; to?: string }>;
}) {
    const session = await auth();
    // @ts-ignore
    if (!session?.user?.firmId || session.user.firmId !== params.firmId) {
        // redirect('/login'); // strict check
    }

    const { firmId } = await params;
    const { status, from, to } = await searchParams;

    const [stats, transactions, chartData] = await Promise.all([
        getRevenueStats(firmId),
        getRecentTransactions(firmId, {
            status,
            dateFrom: from,
            dateTo: to
        }),
        getRevenueChartData(firmId)
    ]);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Revenue</h1>
                    <p className="mt-2 text-base text-gray-600">Overview of financial performance and transactions.</p>
                </div>
                <div className="flex gap-3">
                    <DateRangePicker firmId={firmId} />
                    <ExportButton firmId={firmId} />
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Revenue */}
                <Link href={`/dashboard/${firmId}/revenue`}>
                    <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-xl p-6 shadow-lg ring-1 ring-white/10 cursor-pointer hover:scale-105 transition-transform">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-gray-400 text-sm font-medium mb-1">Total Revenue (YTD)</div>
                                <div className="text-3xl font-bold tracking-tight">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats.totalRevenue)}
                                </div>
                            </div>
                            <div className="p-2 bg-white/10 rounded-lg">
                                <DollarSign className="h-5 w-5 text-green-400" />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-green-400 text-xs font-medium mt-4">
                            <ArrowUpRight className="h-3 w-3" />
                            {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}% vs last month
                        </div>
                    </div>
                </Link>

                {/* Pending Invoices */}
                <Link href={`/dashboard/${firmId}/revenue?status=PENDING`}>
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm ring-1 ring-gray-900/5 cursor-pointer hover:shadow-md hover:border-amber-300 transition-all">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-gray-500 text-sm font-medium mb-1">Pending Invoices</div>
                                <div className="text-3xl font-bold tracking-tight text-gray-900">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats.pendingAmount)}
                                </div>
                            </div>
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <CreditCard className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                        <div className="text-gray-500 text-xs mt-4">{stats.pendingCount} invoices awaiting payment</div>
                    </div>
                </Link>

                {/* Avg Deal Size */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm ring-1 ring-gray-900/5">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-gray-500 text-sm font-medium mb-1">Avg. Deal Size</div>
                            <div className="text-3xl font-bold tracking-tight text-gray-900">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats.avgDealSize)}
                            </div>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs font-medium mt-4">
                        <Calendar className="h-3 w-3" />
                        Based on completed payments
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
                            {transactions.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <div className="inline-flex items-center justify-center p-4 bg-gray-50 rounded-full mb-3">
                                        <CreditCard className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <p className="text-sm">No transactions found.</p>
                                </div>
                            ) : (
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500">
                                        <tr>
                                            <th className="px-6 py-4 font-medium">Customer</th>
                                            <th className="px-6 py-4 font-medium">Service</th>
                                            <th className="px-6 py-4 font-medium">Amount</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                            <th className="px-4 py-4 font-medium"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transactions.map((trx) => (
                                            <TransactionRow
                                                key={trx.id}
                                                transaction={trx}
                                                firmId={firmId}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Chart / Stats (1/3) */}
                <div className="space-y-6 lg:self-start">
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/5 p-6 h-auto flex flex-col">
                        <h3 className="font-semibold text-gray-900 mb-6">Revenue Trend (Last 6 Months)</h3>

                        {/* CSS Chart Placeholder using Real Data */}
                        {chartData.length > 0 ? (
                            <div className="flex items-end justify-between gap-2 h-48 border-b border-gray-100 pb-2 relative mt-4">
                                {chartData.map((d, i) => {
                                    const maxVal = Math.max(...chartData.map(c => c.revenue));
                                    const heightPct = maxVal > 0 ? (d.revenue / maxVal) * 100 : 0;

                                    return (
                                        <div key={i} className="w-full bg-blue-50 hover:bg-blue-100 rounded-t-sm relative group transition-colors flex flex-col justify-end" style={{ height: '100%' }}>
                                            <div className="w-full bg-blue-600 rounded-t-sm transition-all duration-500" style={{ height: `${heightPct}%` }}></div>
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap shadow-xl">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(d.revenue)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                                No data available
                            </div>
                        )}

                        <div className="flex justify-between mt-3 text-xs text-gray-500 font-medium">
                            {chartData.map((d, i) => (
                                <span key={i}>{d.month}</span>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
