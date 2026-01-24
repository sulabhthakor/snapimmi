import { Users, FileText, AlertTriangle, TrendingUp, Clock, Activity, ArrowUpRight } from 'lucide-react';
import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { differenceInDays, format } from 'date-fns';
import { getTasks } from '@/features/tasks/server/actions';
import { TaskList } from '@/features/tasks/components/TaskList';
import { auth } from '@/auth';
import { Passport, Visa, Customer } from '@prisma/client';
import { OnboardingGuide } from '@/components/ui/OnboardingGuide';

// Dashboard Stats Query
async function getDashboardStats(firmId: string) {
    const today = new Date();
    const future30 = new Date(today);
    future30.setDate(today.getDate() + 30);
    const future60 = new Date(today);
    future60.setDate(today.getDate() + 60);
    const yearStart = new Date(today.getFullYear(), 0, 1);

    const [
        totalCustomers,
        activeApplications,
        applicationStatusCounts,
        expiringPassports,
        expiringVisas,
        tasks,
        revenueResult,
        recentApps,
        recentDocs
    ] = await Promise.all([
        prisma.customer.count({ where: { firmId, deletedAt: null } }),
        prisma.application.count({
            where: {
                firmId,
                deletedAt: null,
                status: { notIn: ['APPROVED', 'REJECTED'] as any }
            }
        }),
        prisma.application.groupBy({
            by: ['status'],
            where: { firmId, deletedAt: null },
            _count: true
        }),
        prisma.passport.findMany({
            where: {
                customer: { firmId },
                expiryDate: { lte: future60, gte: today },
                deletedAt: null
            },
            include: { customer: true },
            orderBy: { expiryDate: 'asc' },
            take: 5
        }),
        prisma.visa.findMany({
            where: {
                customer: { firmId },
                expiryDate: { lte: future60, gte: today },
                status: 'Active',
                deletedAt: null
            },
            include: { customer: true },
            orderBy: { expiryDate: 'asc' },
            take: 5
        }),
        getTasks(firmId),
        prisma.payment.aggregate({
            where: { firmId, status: 'COMPLETED', paidAt: { gte: yearStart } },
            _sum: { amount: true }
        }),
        // Derived Activity: Recent Applications
        prisma.application.findMany({
            where: { firmId, deletedAt: null },
            include: { customer: { select: { fullName: true } } },
            orderBy: { createdAt: 'desc' },
            take: 5
        }),
        // Derived Activity: Recent Documents
        prisma.document.findMany({
            where: { customer: { firmId: firmId }, deletedAt: null },
            include: { customer: { select: { fullName: true } } },
            orderBy: { uploadedAt: 'desc' },
            take: 5
        })
    ]);

    // Combine and sort expiring items
    const expiringItems = [
        ...expiringPassports.map((p: Passport & { customer: Customer }) => ({
            id: p.id,
            customerId: p.customerId,
            name: p.customer.fullName,
            type: 'Passport',
            date: format(new Date(p.expiryDate), 'dd MMM yyyy'),
            daysLeft: differenceInDays(new Date(p.expiryDate), today),
            rawDate: p.expiryDate
        })),
        ...expiringVisas.map((v: Visa & { customer: Customer }) => ({
            id: v.id,
            customerId: v.customerId,
            name: v.customer.fullName,
            type: `Visa (${v.country})`,
            date: format(new Date(v.expiryDate), 'dd MMM yyyy'),
            daysLeft: differenceInDays(new Date(v.expiryDate), today),
            rawDate: v.expiryDate
        }))
    ].sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 5);

    // Format revenue
    const revenueAmount = Number(revenueResult._sum.amount || 0);
    const formattedRevenue = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(revenueAmount);

    // Pipeline Counts
    const pipeline = {
        PENDING: 0,
        DOCUMENTS_COLLECTED: 0,
        APPLIED: 0,
        APPROVED: 0
    };
    applicationStatusCounts.forEach(item => {
        if (item.status in pipeline) {
            pipeline[item.status as keyof typeof pipeline] = item._count;
        }
    });

    // Merge Activity
    const activityFeed = [
        ...recentApps.map(a => ({
            id: `app-${a.id}`,
            user: a.customer.fullName, // Or derive Agent name if available, using Customer for now
            action: 'started application for',
            target: `${a.visaType} - ${a.targetCountry}`,
            time: format(new Date(a.createdAt), 'MMM d, h:mm a'),
            timestamp: new Date(a.createdAt).getTime(),
            initial: a.customer.fullName.charAt(0)
        })),
        ...recentDocs.map(d => ({
            id: `doc-${d.id}`,
            user: d.customer.fullName,
            action: 'uploaded document',
            target: d.name,
            time: format(new Date(d.uploadedAt), 'MMM d, h:mm a'),
            timestamp: new Date(d.uploadedAt).getTime(),
            initial: d.customer.fullName.charAt(0)
        }))
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

    return {
        totalCustomers,
        activeApplications,
        expiringDocuments: expiringItems.length,
        revenue: formattedRevenue,
        recentActivity: activityFeed,
        expiringItems,
        tasks,
        pipeline
    };
}

export default async function DashboardPage({ params }: { params: Promise<{ firmId: string }> }) {
    const { firmId } = await params;

    // 🚨 SPECIAL CASE: Super Admin Dashboard
    if (firmId === 'admin') {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Super Admin Dashboard</h1>
                        <p className="text-gray-600 mt-1">Platform overview.</p>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p>Welcome, Administrator. Global stats coming soon.</p>
                </div>
            </div>
        )
    }

    const [stats, firm] = await Promise.all([
        getDashboardStats(firmId),
        prisma.firm.findUnique({
            where: { id: firmId },
            select: { name: true }
        })
    ]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">{firm?.name} Dashboard</h1>
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

            {/* Onboarding Guide for new firms */}
            <OnboardingGuide firmId={firmId} stats={stats} />

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
                                <Link
                                    key={item.id}
                                    href={`/dashboard/${firmId}/customers/${item.customerId}`}
                                    className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer ${idx !== stats.expiringItems.length - 1 ? 'border-b border-gray-50' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${item.daysLeft <= 30 ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                            {item.daysLeft}D
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{item.name}</div>
                                            <div className="text-sm text-gray-500">{item.type} expires on {item.date}</div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 group-hover:text-black">View →</span>
                                </Link>
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
                                    {/* Real Data Bars */}
                                    <div className="w-full bg-gray-800 rounded-t-sm relative group/bar transition-all duration-500" style={{ height: `${Math.max(15, (stats.pipeline.PENDING / (Math.max(1, stats.activeApplications) * 1.5)) * 100)}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-sm">
                                            Pending: {stats.pipeline.PENDING}
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-t-sm relative group/bar transition-all duration-500" style={{ height: `${Math.max(15, (stats.pipeline.DOCUMENTS_COLLECTED / (Math.max(1, stats.activeApplications) * 1.5)) * 100)}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-sm">
                                            Docs: {stats.pipeline.DOCUMENTS_COLLECTED}
                                        </div>
                                    </div>
                                    <div className="w-full bg-blue-600 rounded-t-sm relative group/bar transition-all duration-500" style={{ height: `${Math.max(15, (stats.pipeline.APPLIED / (Math.max(1, stats.activeApplications) * 1.5)) * 100)}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-sm">
                                            Applied: {stats.pipeline.APPLIED}
                                        </div>
                                    </div>
                                    <div className="w-full bg-green-500 rounded-t-sm relative group/bar transition-all duration-500" style={{ height: `${Math.max(15, (stats.pipeline.APPROVED / (Math.max(1, stats.activeApplications) * 1.5)) * 100)}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-sm">
                                            Approved: {stats.pipeline.APPROVED}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
                        </div>
                    </Link>
                </div>

                {/* Right Column: Tasks & Activity (1/3 width) */}
                <div className="space-y-8">
                    {/* Tasks Widget */}
                    <div className="h-[400px]">
                        <TaskList tasks={stats.tasks as any} firmId={firmId} />
                    </div>

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
                                        {activity.initial}
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
