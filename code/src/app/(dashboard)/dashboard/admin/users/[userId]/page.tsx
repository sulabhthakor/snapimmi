// ... imports kept same, relying on existing imports plus some new icons if needed
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { Building2, Mail, Calendar, Key, Shield, UserX, Trash2, ArrowLeft, User, MapPin, Clock, History } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { UserActions } from './components/UserActions';
import { ResetPasswordButton } from './components/ResetPasswordButton';

async function getUser(userId: string) {
    return await prisma.user.findUnique({
        where: { id: userId },
        include: {
            firm: {
                select: { name: true, slug: true, logoUrl: true }
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

export default async function UserDetailPage(props: { params: Promise<{ userId: string }> }) {
    const params = await props.params;
    const user = await getUser(params.userId);

    if (!user) {
        notFound();
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Navigation & Breadcrumbs */}
            <div>
                <Link
                    href="/dashboard/admin/users"
                    className="group flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors w-fit mb-6"
                >
                    <div className="p-1 rounded-md group-hover:bg-gray-100 transition-colors mr-2">
                        <ArrowLeft className="h-4 w-4" />
                    </div>
                    Back to User Management
                </Link>

                {/* Main Header / Hero Section */}
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-6">
                        {/* Avatar */}
                        <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-gray-200">
                            {getInitials(user.name)}
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900">{user.name}</h1>

                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.isActive
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5" />
                                    {user.email}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Key className="h-3.5 w-3.5" />
                                    <span className="capitalize">{user.role.replace('_', ' ').toLowerCase()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <History className="h-3.5 w-3.5" />
                                    Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                        <ResetPasswordButton userId={user.id} />
                        <Button variant="default" className="bg-black hover:bg-gray-800 gap-2">
                            Edit Profile
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Left Column: Stats & Information */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Detailed Profile Card */}
                    <Card className="shadow-sm border-gray-200 overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <User className="h-4 w-4 text-gray-500" />
                                    Personal Details
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Full Name</span>
                                    <div className="font-medium text-gray-900 border-b border-gray-100 pb-2">{user.name}</div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</span>
                                    <div className="font-medium text-gray-900 border-b border-gray-100 pb-2 flex items-center justify-between">
                                        {user.email}
                                        <Mail className="h-3 w-3 text-gray-400" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Account Role</span>
                                    <div className="font-medium text-gray-900 border-b border-gray-100 pb-2 flex items-center justify-between">
                                        {user.role}
                                        <Shield className="h-3 w-3 text-gray-400" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Registration Date</span>
                                    <div className="font-medium text-gray-900 border-b border-gray-100 pb-2 flex items-center justify-between">
                                        {format(new Date(user.createdAt), 'MMMM d, yyyy')}
                                        <Calendar className="h-3 w-3 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Firm Association Card */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Building2 className="h-4 w-4 text-gray-500" />
                                Firm Association
                            </CardTitle>
                            <CardDescription>The legal entity this user belongs to.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            {user.firm ? (
                                <div className="flex items-start gap-4 p-4 bg-indigo-50/30 rounded-xl border border-indigo-100/50">
                                    <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center border border-gray-200 shadow-sm shrink-0">
                                        {user.firm.logoUrl ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={user.firm.logoUrl} alt={user.firm.name} className="h-8 w-8 object-contain" />
                                        ) : (
                                            <Building2 className="h-6 w-6 text-indigo-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{user.firm.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">@{user.firm.slug}</p>
                                        <Link
                                            href={`/dashboard/admin/firms/${user.firm.slug}`}
                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                                        >
                                            View Firm Details
                                            <ArrowLeft className="h-3 w-3 rotate-180" />
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                                        <User className="h-5 w-5 text-gray-500" />
                                    </div>
                                    <p className="font-medium text-gray-900">No Firm Associated</p>
                                    <p className="text-sm text-gray-500">This user is a platform-level user or hasn't been assigned to a firm yet.</p>
                                    <Button variant="outline" size="sm" className="mt-4">
                                        Assign to Firm
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Actions & Security */}
                <UserActions
                    userId={user.id}
                    isActive={user.isActive}
                    mustChangePassword={(user as any).mustChangePassword ?? false}
                />
            </div>
        </div>
    );
}
