import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowLeft, Building2, Mail, Calendar, Shield, Users, CreditCard, Activity, Globe, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { FirmActions } from '@/components/admin/FirmActions';

async function getFirm(id: string) {
    return await prisma.firm.findUnique({
        where: { id },
        include: {
            users: {
                orderBy: { createdAt: 'desc' },
                take: 10
            },
            _count: {
                select: { applications: true, customers: true, users: true }
            }
        }
    });
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default async function FirmDetailPage({ params }: { params: Promise<{ firmId: string }> }) {
    const { firmId } = await params;
    const firm = await getFirm(firmId);

    if (!firm) {
        notFound();
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Top Navigation */}
            <div>
                <Link
                    href="/dashboard/admin/firms"
                    className="group flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors w-fit mb-6"
                >
                    <div className="p-1 rounded-md group-hover:bg-gray-100 transition-colors mr-2">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    Back to Firms
                </Link>

                {/* Hero / Header Section */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-6">
                        {/* Firm Branding/Logo Placeholder */}
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-900 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-100">
                            {firm.logoUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={firm.logoUrl} alt={firm.name} className="h-full w-full object-cover rounded-2xl" />
                            ) : (
                                <span>{getInitials(firm.name)}</span>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{firm.name}</h1>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${firm.status === 'ACTIVE'
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : (firm.status === 'SUSPENDED' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200')
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${firm.status === 'ACTIVE' ? 'bg-green-500' : (firm.status === 'SUSPENDED' ? 'bg-red-500' : 'bg-yellow-500')}`} />
                                    {firm.status}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-3.5 w-3.5" />
                                    @{firm.slug}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5" />
                                    {firm.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Joined {format(new Date(firm.createdAt), 'MMM d, yyyy')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                        <Button variant="outline" className="gap-2 bg-white hover:bg-gray-50">
                            <Mail className="h-4 w-4" />
                            Contact
                        </Button>
                        <FirmActions firmId={firm.id} status={firm.status} />
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{firm._count.users}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Users className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Customers</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{firm._count.customers}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Users className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Applications</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{firm._count.applications}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                            <Activity className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Current Plan</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{firm.subscriptionPlan}</p>
                        </div>
                        <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <CreditCard className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Users List */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-gray-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-500" />
                                    Team Members
                                </CardTitle>
                                <CardDescription>Users associated with this firm.</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" className="h-8">View All</Button>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white text-gray-500 font-medium border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Role</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {firm.users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                                        {getInitials(user.name)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-xs text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                                                    {user.role.toLowerCase().replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium border border-green-100">
                                                        <span className="w-1 h-1 rounded-full bg-green-600"></span>
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium border border-red-100">
                                                        <span className="w-1 h-1 rounded-full bg-red-600"></span>
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/dashboard/admin/users/${user.id}`} className="text-gray-400 hover:text-gray-900">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {firm.users.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                                No users found for this firm.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Settings / Details */}
                <div className="space-y-6">
                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Activity className="h-4 w-4" />
                                Subscription Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Plan</span>
                                <span className="font-medium text-gray-900">{firm.subscriptionPlan}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Status</span>
                                <span className={`text-sm font-medium ${firm.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                                    {firm.status}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Billing Cycle</span>
                                <span className="font-medium text-gray-900">Monthly</span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                <span className="text-sm text-gray-500">Next Invoice</span>
                                <span className="font-medium text-gray-900">-</span>
                            </div>
                            <Button variant="outline" className="w-full mt-2">Manage Subscription</Button>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                Domain Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase">Custom Slug</label>
                                <div className="flex items-center gap-2 font-mono text-sm bg-gray-50 p-2 rounded border border-gray-200 text-gray-600">
                                    snapimmi.com/{firm.slug}
                                </div>
                            </div>
                            <Button variant="outline" className="w-full">Configure Vanity URL</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
