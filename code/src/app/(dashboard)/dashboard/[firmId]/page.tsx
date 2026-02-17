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

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">{greeting} 👋</h1>
                    <p className="text-gray-500 mt-1 text-sm sm:text-base">Here&apos;s what&apos;s happening at <span className="font-semibold text-gray-700">{firm?.name}</span> today.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Link
                        href={`/dashboard/${firmId}/reports`}
                        className="flex-1 md:flex-none bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 shadow-sm flex items-center justify-center gap-2 transition-all"
                    >
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Download</span> Report
                    </Link>
                    <Link
                        href={`/dashboard/${firmId}/applications/new`}
                        className="flex-1 md:flex-none bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
                    >
                        + New Application
                    </Link>
                </div>
            </div>

            {/* Onboarding Guide for new firms */}
            <OnboardingGuide firmId={firmId} stats={stats} />

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Link href={`/dashboard/${firmId}/customers`}>
                    <KPICard
                        title="Total Customers"
                        value={stats.totalCustomers}
                        icon={Users}
                        trend="+12% from last month"
                        trendUp={true}
                        gradient="indigo"
                    />
                </Link>
                <Link href={`/dashboard/${firmId}/applications`}>
                    <KPICard
                        title="Active Applications"
                        value={stats.activeApplications}
                        icon={FileText}
                        trend="+5 new this week"
                        trendUp={true}
                        gradient="blue"
                    />
                </Link>
                <Link href={`/dashboard/${firmId}/revenue`}>
                    <KPICard
                        title="Revenue (YTD)"
                        value={stats.revenue}
                        icon={TrendingUp}
                        trend="+8% vs last year"
                        trendUp={true}
                        gradient="emerald"
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
                        gradient="red"
                    />
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                {/* Left Column: Expiry Radar & Pipeline (2/3 width) */}
                <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                    {/* Expiry Radar */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2.5">
                                <div className="p-1.5 bg-amber-50 rounded-lg">
                                    <Clock className="h-4 w-4 text-amber-600" />
                                </div>
                                Expiry Radar
                            </h3>
                            <Link href={`/dashboard/${firmId}/expiry-radar`} className="text-sm text-gray-500 font-medium hover:text-black transition-colors">
                                View All →
                            </Link>
                        </div>
                        <div>
                            {stats.expiringItems.length > 0 ? stats.expiringItems.map((item, idx) => (
                                <Link
                                    key={item.id}
                                    href={`/dashboard/${firmId}/customers/${item.customerId}`}
                                    className={`flex items-center justify-between p-4 sm:px-6 hover:bg-gray-50/80 transition-colors cursor-pointer group ${idx !== stats.expiringItems.length - 1 ? 'border-b border-gray-100' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-xs ${item.daysLeft <= 30 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                {item.daysLeft}D
                                            </div>
                                            {item.daysLeft <= 7 && (
                                                <div className="absolute -top-0.5 -right-0.5 h-3 w-3 bg-red-500 rounded-full animate-pulse border-2 border-white" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 group-hover:text-black">{item.name}</div>
                                            <div className="text-sm text-gray-500">{item.type} · expires {item.date}</div>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 transition-colors shrink-0" />
                                </Link>
                            )) : (
                                <div className="p-8 sm:p-12 text-center text-gray-400">
                                    <div className="inline-flex items-center justify-center p-3 bg-gray-50 rounded-full mb-3">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <p className="text-sm font-medium">No expiring documents</p>
                                    <p className="text-xs mt-1">All documents are up to date</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Application Pipeline */}
                    <Link href={`/dashboard/${firmId}/applications`} className="block">
                        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 sm:p-6 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                            Application Pipeline
                                            <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                                        </h3>
                                        <p className="text-gray-500 text-sm mt-0.5">Current application stages overview</p>
                                    </div>
                                    <div className="text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                                        {stats.activeApplications} total
                                    </div>
                                </div>

                                <div className="h-48 flex items-end gap-3 sm:gap-6">
                                    {/* Pending */}
                                    <div className="w-full h-full flex flex-col justify-end gap-2 group/bar">
                                        <div className="text-center text-xs font-bold text-gray-700 mb-1">{stats.pipeline.PENDING}</div>
                                        <div className="w-full bg-gradient-to-t from-gray-200 to-gray-100 rounded-t-lg relative transition-all duration-700 hover:from-gray-300 hover:to-gray-200" style={{ height: `${Math.max(15, (stats.pipeline.PENDING / (Math.max(1, stats.activeApplications) * 1.5)) * 100)}%` }}>
                                        </div>
                                        <span className="text-[11px] text-center font-medium text-gray-500">Pending</span>
                                    </div>

                                    {/* Collecting */}
                                    <div className="w-full h-full flex flex-col justify-end gap-2 group/bar">
                                        <div className="text-center text-xs font-bold text-blue-700 mb-1">{stats.pipeline.DOCUMENTS_COLLECTED}</div>
                                        <div className="w-full bg-gradient-to-t from-blue-400 to-blue-200 rounded-t-lg relative transition-all duration-700 hover:from-blue-500 hover:to-blue-300" style={{ height: `${Math.max(15, (stats.pipeline.DOCUMENTS_COLLECTED / (Math.max(1, stats.activeApplications) * 1.5)) * 100)}%` }}>
                                        </div>
                                        <span className="text-[11px] text-center font-medium text-gray-500">Collecting</span>
                                    </div>

                                    {/* Applied */}
                                    <div className="w-full h-full flex flex-col justify-end gap-2 group/bar">
                                        <div className="text-center text-xs font-bold text-blue-700 mb-1">{stats.pipeline.APPLIED}</div>
                                        <div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg relative transition-all duration-700 hover:from-blue-700 hover:to-blue-500" style={{ height: `${Math.max(15, (stats.pipeline.APPLIED / (Math.max(1, stats.activeApplications) * 1.5)) * 100)}%` }}>
                                        </div>
                                        <span className="text-[11px] text-center font-medium text-gray-500">Applied</span>
                                    </div>

                                    {/* Approved */}
                                    <div className="w-full h-full flex flex-col justify-end gap-2 group/bar">
                                        <div className="text-center text-xs font-bold text-emerald-700 mb-1">{stats.pipeline.APPROVED}</div>
                                        <div className="w-full bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-lg relative transition-all duration-700 hover:from-emerald-600 hover:to-emerald-400" style={{ height: `${Math.max(15, (stats.pipeline.APPROVED / (Math.max(1, stats.activeApplications) * 1.5)) * 100)}%` }}>
                                        </div>
                                        <span className="text-[11px] text-center font-medium text-gray-500">Approved</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Right Column: Tasks & Activity (1/3 width) */}
                <div className="space-y-6 lg:space-y-8">
                    {/* Tasks Widget */}
                    <div className="h-[400px]">
                        <TaskList tasks={stats.tasks as any} firmId={firmId} />
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm">
                        <div className="p-5 sm:p-6 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2.5">
                                <div className="p-1.5 bg-gray-100 rounded-lg">
                                    <Activity className="h-4 w-4 text-gray-600" />
                                </div>
                                Recent Activity
                            </h3>
                        </div>
                        <div className="p-5 sm:p-6 space-y-0">
                            {stats.recentActivity.map((activity, idx) => (
                                <div key={activity.id} className="flex gap-4 relative pb-6 last:pb-0">
                                    {/* Connector Line */}
                                    {idx !== stats.recentActivity.length - 1 && (
                                        <div className="absolute left-5 top-10 bottom-0 w-px bg-gradient-to-b from-gray-200 to-transparent" />
                                    )}

                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700 z-10 shrink-0 shadow-sm">
                                        {activity.initial}
                                    </div>
                                    <div className="pt-0.5">
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            <span className="font-semibold text-gray-900">{activity.user}</span>{' '}
                                            {activity.action}{' '}
                                            <span className="font-medium text-gray-900">{activity.target}</span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                            {stats.recentActivity.length === 0 && (
                                <div className="text-center py-6 text-gray-400 text-sm">No recent activity</div>
                            )}
                        </div>
                        <div className="p-3 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl text-center">
                            <Link href={`/dashboard/${firmId}/activity`} className="text-xs font-medium text-gray-500 hover:text-black block w-full py-1 transition-colors">
                                View All History →
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, trend, trendUp, alert, gradient }: any) {
    const gradientMap: Record<string, string> = {
        indigo: 'from-indigo-500 to-indigo-600',
        blue: 'from-blue-500 to-blue-600',
        emerald: 'from-emerald-500 to-emerald-600',
        red: 'from-red-500 to-red-600',
    };
    const bg = gradient ? gradientMap[gradient] || gradientMap.indigo : (alert ? 'from-red-500 to-red-600' : 'from-gray-800 to-gray-900');

    return (
        <div className={`group p-6 rounded-2xl border ${alert ? 'bg-red-50/30 border-red-100' : 'bg-white border-gray-200/80'} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full`}>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${bg} shadow-lg shadow-gray-200/50`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                    {trend && (
                        <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${alert ? 'bg-red-100 text-red-700' :
                            trendUp ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                            {trendUp && <ArrowUpRight className="h-3 w-3" />}
                            {trend}
                        </div>
                    )}
                </div>
                <div className="mt-1">
                    <div className="text-3xl font-bold tracking-tight text-gray-900">{value}</div>
                    <div className={`text-sm font-medium mt-1 ${alert ? 'text-red-600' : 'text-gray-500'}`}>{title}</div>
                </div>
            </div>
        </div>
    )
}
