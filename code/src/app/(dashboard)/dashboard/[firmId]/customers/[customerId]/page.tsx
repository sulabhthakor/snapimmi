import { getCustomer } from '@/features/customers/server/actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Mail, Phone, Users, FileText, FolderClosed,
    CreditCard, Calendar, Clock, MoreHorizontal, Edit, Plus
} from 'lucide-react';

export default async function CustomerDetailPage({
    params
}: {
    params: Promise<{ firmId: string; customerId: string }>
}) {
    const { firmId, customerId } = await params;
    const customer = await getCustomer(customerId);

    if (!customer) {
        return notFound();
    }

    return (
        <div className="space-y-6">
            {/* Header / Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Link href={`/dashboard/${firmId}/customers`} className="hover:text-black flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Customers
                </Link>
                <span>/</span>
                <span className="font-medium text-gray-900">{customer.fullName}</span>
            </div>

            {/* Main Header Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center text-white text-2xl font-bold shadow-md ring-4 ring-gray-50">
                        {customer.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{customer.fullName}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-gray-100 border border-gray-200 font-mono text-xs">
                                ID: {customer.id.slice(-4).toUpperCase()}
                            </div>
                            {customer.isFamilyHead && (
                                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 font-medium text-xs">
                                    <Users className="h-3 w-3" />
                                    Family Head
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Link href={`/dashboard/${firmId}/customers/${customerId}/edit`} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                        <Edit className="h-4 w-4" />
                        Edit Profile
                    </Link>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                        <Plus className="h-4 w-4" />
                        New Application
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Sidebar: Profile & Info */}
                <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            Contact Information
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Email Address</div>
                                    <div className="text-sm text-gray-900 break-all">{customer.email || '—'}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Phone Number</div>
                                    <div className="text-sm text-gray-900">{customer.phone || '—'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Passport Info */}
                    {customer.passports.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                Active Passport
                            </h3>
                            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Passport Number</div>
                                        <div className="text-lg font-bold text-blue-900 font-mono">{customer.passports[0].number}</div>
                                    </div>
                                    <div className="text-2xl">🇮🇳</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-100/50">
                                    <div>
                                        <div className="text-xs text-blue-600">Country</div>
                                        <div className="text-sm font-medium text-blue-900">{customer.passports[0].country}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-blue-600">Expires</div>
                                        <div className="text-sm font-medium text-blue-900">
                                            {customer.passports[0].expiryDate.toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Main Content: Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Applications */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-gray-500" />
                                Applications
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-bold text-gray-700">
                                    {customer.applications.length}
                                </span>
                            </h3>
                            <button className="text-sm font-medium text-blue-600 hover:underline">View All</button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {customer.applications.length > 0 ? (
                                customer.applications.map((app) => (
                                    <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className={`h-10 w-1 rounded-full ${app.status === 'APPROVED' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                            <div>
                                                <div className="font-medium text-gray-900">{app.visaType} - {app.targetCountry}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                    <Clock className="h-3 w-3" />
                                                    Updated {app.updatedAt.toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${app.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {app.status}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No active applications.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Documents */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <FolderClosed className="h-5 w-5 text-gray-500" />
                                Recent Documents
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-bold text-gray-700">
                                    {customer.documents.length}
                                </span>
                            </h3>
                            <button className="text-sm font-medium text-blue-600 hover:underline">Manage Files</button>
                        </div>
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {customer.documents.length > 0 ? (
                                customer.documents.slice(0, 4).map((doc) => (
                                    <div key={doc.id} className="p-3 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all flex items-center gap-3 cursor-pointer group bg-gray-50/50">
                                        <div className="h-10 w-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                                            <div className="text-xs text-gray-500">{doc.category} • {(doc.fileSize / 1024).toFixed(0)} KB</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 p-4 text-center text-gray-500">
                                    No documents uploaded yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
