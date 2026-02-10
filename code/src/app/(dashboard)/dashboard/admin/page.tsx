import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Building2, Users, AlertCircle, TrendingUp } from 'lucide-react';

async function getAdminStats() {
    const [firmCount, userCount, activeFirms, suspendedFirms, pendingFirms, settings] = await Promise.all([
        prisma.firm.count(),
        prisma.user.count(),
        prisma.firm.count({ where: { status: 'ACTIVE' } }),
        prisma.firm.count({ where: { status: 'SUSPENDED' } }),
        prisma.firm.count({ where: { status: 'PENDING_VERIFICATION' } }),
        prisma.systemSettings.findFirst(),
    ]);

    return {
        firmCount,
        userCount,
        activeFirms,
        suspendedFirms,
        pendingFirms,
        settings
    };
}

export default async function AdminDashboardPage() {
    const stats = await getAdminStats();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Overview</h1>
                <p className="text-muted-foreground mt-2">Platform-wide statistics and controls.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link href="/dashboard/admin/firms">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Firms</CardTitle>
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.firmCount}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.activeFirms} Active, {stats.suspendedFirms} Suspended
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/admin/users">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.userCount}</div>
                            <p className="text-xs text-muted-foreground">
                                Across all firms
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/admin/settings">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Status</CardTitle>
                            <TrendingUp className={`h-4 w-4 ${stats.settings?.maintenanceMode ? 'text-amber-500' : 'text-green-500'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stats.settings?.maintenanceMode ? 'text-amber-600' : 'text-green-600'}`}>
                                {stats.settings?.maintenanceMode ? 'Maintenance' : 'Operational'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {stats.settings?.maintenanceMode
                                    ? 'System access restricted'
                                    : stats.settings?.allowRegistrations
                                        ? 'All systems normal'
                                        : 'Registrations paused'}
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/admin/firms?status=PENDING_VERIFICATION">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Actions</CardTitle>
                            <AlertCircle className={`h-4 w-4 ${stats.pendingFirms > 0 ? 'text-amber-500' : 'text-gray-400'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.pendingFirms}</div>
                            <p className="text-xs text-muted-foreground">
                                Firms awaiting verification
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Future: Recent Activity Log or Audit Table */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-1 lg:col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground border border-dashed rounded-lg bg-gray-50/50">
                            No recent system alerts.
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-1 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="grid grid-cols-1 gap-2">
                            <Link
                                href="/dashboard/admin/firms/new"
                                className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-black hover:text-white cursor-pointer transition-all flex items-center justify-between group"
                            >
                                <span>Add New Firm</span>
                                <Building2 className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                            </Link>
                            <Link
                                href="/dashboard/admin/settings"
                                className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 hover:bg-black hover:text-white cursor-pointer transition-all flex items-center justify-between group"
                            >
                                <span>System Settings</span>
                                <TrendingUp className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
