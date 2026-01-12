import { Users, FileText, AlertTriangle, TrendingUp, Clock, Activity, ArrowUpRight } from 'lucide-react';
import { Suspense } from 'react';
import Link from 'next/link';

// Placeholder for future server actions
async function getDashboardStats(firmId: string) {
    // Simulate DB delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        totalCustomers: 124,
        activeApplications: 45,
        expiringDocuments: 5,
        revenue: "₹ 12.5L",
        recentActivity: [
            { id: 1, user: 'Rahul', action: 'Uploaded Passport', target: 'Amit Shah', time: '2 mins ago' },
            { id: 2, user: 'Priya', action: 'Created Application', target: 'Canada Student Visa', time: '1 hour ago' },
            { id: 3, user: 'Rahul', action: 'Sent Reminder', target: 'Sara Smith', time: '3 hours ago' },
        ],
        expiringItems: [
            { id: 1, name: 'John Doe', type: 'Passport', date: '2024-02-10', daysLeft: 2 },
            { id: 2, name: 'Jane Smith', type: 'Visa (USA)', date: '2024-02-15', daysLeft: 7 },
        ]
    };
}

export default async function DashboardPage({ params }: { params: Promise<{ firmId: string }> }) {
    const { firmId } = await params;
    const stats = await getDashboardStats(firmId);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/dashboard/${firmId}/reports`}
                        className="bg-white border text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm flex items-center justify-center"
                    >
                        Download Report
                    </Link>
                    <Link
                        href={`/dashboard/${firmId}/applications/new`}
                        className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 shadow-md flex items-center justify-center"
                    >
                        + New Application
                    </Link>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href={`/dashboard/${firmId}/customers`}>
                    <KPICard
                        title="Total Customers"
                        value={stats.totalCustomers}
                        icon={Users}
                        trend="+12% from last month"
                        trendUp={true}
                    />
                </Link>
                <Link href={`/dashboard/${firmId}/applications`}>
                    <KPICard
                        title="Active Applications"
                        value={stats.activeApplications}
                        icon={FileText}
                        trend="+5 new this week"
                        trendUp={true}
                    />
                </Link>
                <Link href={`/dashboard/${firmId}/revenue`}>
                    <KPICard
                        title="Revenue (YTD)"
                        value={stats.revenue}
                        icon={TrendingUp}
                        trend="+8% vs last year"
                        trendUp={true}
                    />
                </Link>
                <Link href={`/dashboard/${firmId}/expiry-radar`}>
                    <KPICard
                        title="Expiring Soon"
                        value={stats.expiringDocuments}
                        icon={AlertTriangle}
                        trend="Requires attention"
                        trendUp={false}
                        alert={true}
                    />
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Expiry Radar & Quick Actions (2/3 width) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Expiry Radar */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-gray-500" />
                                Expiry Radar
                            </h3>
                            <Link href={`/dashboard/${firmId}/expiry-radar`} className="text-sm text-black font-medium hover:underline">
                                View All
                            </Link>
                        </div>
                        <div className="p-0">
                            {stats.expiringItems.map((item, idx) => (
                                <div key={item.id} className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${idx !== stats.expiringItems.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                                            {item.daysLeft}D
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{item.name}</div>
                                            <div className="text-sm text-gray-500">{item.type} expires on {item.date}</div>
                                        </div>
                                    </div>
                                    <button className="text-xs border px-3 py-1 rounded-full hover:bg-white hover:border-gray-300">
                                        Remind
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chart Placeholder (To be implemented) */}
                    <Link href={`/dashboard/${firmId}/applications`} className="block">
                        <div className="bg-gray-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group hover:scale-[1.01] transition-transform">
                            <div className="relative z-10">
                                <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
                                    Application Pipeline
                                    <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </h3>
                                <p className="text-gray-400 text-sm mb-6">Overview of current application stages.</p>
                                <div className="h-48 flex items-end gap-4">
                                    {/* Dummy Bars */}
                                    <div className="w-full bg-gray-800 rounded-t-sm h-[40%] relative group/bar">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">Lead</div>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-t-sm h-[60%] relative group/bar">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">Docs</div>
                                    </div>
                                    <div className="w-full bg-blue-600 rounded-t-sm h-[80%] relative group/bar">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">Applied</div>
                                    </div>
                                    <div className="w-full bg-green-500 rounded-t-sm h-[30%] relative group/bar">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity">Approved</div>
                                    </div>
                                </div>
                            </div>
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                        </div>
                    </Link>
                </div>

                {/* Right Column: Activity Feed (1/3 width) */}
                <div className="space-y-8">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm ring-1 ring-gray-900/5">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-gray-500" />
                                Recent Activity
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {stats.recentActivity.map((activity) => (
                                <div key={activity.id} className="flex gap-4 relative">
                                    {/* Connector Line */}
                                    <div className="absolute left-[19px] top-8 bottom-[-24px] w-0.5 bg-gray-100 last:hidden" />

                                    <div className="h-10 w-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-800 z-10 ring-4 ring-white shadow-sm">
                                        {activity.user[0]}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-900">
                                            <span className="font-medium">{activity.user}</span> {activity.action} <span className="font-medium">{activity.target}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl text-center hover:bg-gray-100 transition-colors">
                            <Link href={`/dashboard/${firmId}/activity`} className="text-xs font-medium text-gray-600 hover:text-black block w-full py-1">
                                View All History
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, trend, trendUp, alert }: any) {
    return (
        <div className={`p-6 rounded-xl border ${alert ? 'bg-red-50/50 border-red-100 ring-1 ring-red-200/50' : 'bg-white border-gray-200 ring-1 ring-gray-900/5'} shadow-sm hover:shadow-md transition-all h-full`}>
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${alert ? 'bg-red-100 text-red-600' : 'bg-gray-50 text-gray-900'}`}>
                    <Icon className="h-5 w-5" />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${alert ? 'text-red-700' : (trendUp ? 'text-green-600' : 'text-gray-500')}`}>
                        {trendUp && <ArrowUpRight className="h-3 w-3" />}
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <div className="text-3xl font-bold tracking-tight text-gray-900">{value}</div>
                <div className={`text-sm font-medium ${alert ? 'text-red-600' : 'text-gray-500'}`}>{title}</div>
            </div>
        </div>
    )
}
