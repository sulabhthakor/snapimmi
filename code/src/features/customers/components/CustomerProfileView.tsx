'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Users, FileText, FolderClosed, MoreHorizontal, Edit, Plus, Eye, Download, FileIcon } from 'lucide-react';
import { EditPassportSheet } from './EditPassportSheet';
import { EditVisaSheet } from './EditVisaSheet';

interface CustomerProfileViewProps {
    customer: any;
    firmId: string;
}

export function CustomerProfileView({ customer, firmId }: CustomerProfileViewProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'documents'>('overview');
    const [isPassportSheetOpen, setIsPassportSheetOpen] = useState(false);
    const [isVisaSheetOpen, setIsVisaSheetOpen] = useState(false);

    return (
        <div className="space-y-6">
            <EditPassportSheet customer={customer} isOpen={isPassportSheetOpen} onClose={() => setIsPassportSheetOpen(false)} />
            <EditVisaSheet customer={customer} isOpen={isVisaSheetOpen} onClose={() => setIsVisaSheetOpen(false)} />

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
                    <Link href={`/dashboard/${firmId}/customers/${customer.id}/edit`} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                        <Edit className="h-4 w-4" />
                        Edit Profile
                    </Link>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
                        <Plus className="h-4 w-4" />
                        New Application
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 flex items-center gap-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-1 ${activeTab === 'overview' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('documents')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap px-1 ${activeTab === 'documents' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                >
                    Documents & Visa
                </button>
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

                    {/* Passport Info Widget */}
                    {customer.passports.length > 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    Active Passport
                                </h3>
                                <button onClick={() => setIsPassportSheetOpen(true)} className="text-xs font-medium text-blue-600 hover:underline">Edit</button>
                            </div>
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
                                            {new Date(customer.passports[0].expiryDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-500 mb-3">No passport details added.</p>
                                <button onClick={() => setIsPassportSheetOpen(true)} className="text-sm font-medium text-blue-600 hover:underline border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50">
                                    Add Passport
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'overview' && (
                        <>
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
                                        customer.applications.map((app: any) => (
                                            <div key={app.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                                <div className="flex gap-4">
                                                    <div className={`h-10 w-1 rounded-full ${app.status === 'APPROVED' ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                    <div>
                                                        <div className="font-medium text-gray-900">{app.visaType} - {app.targetCountry}</div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                                            {/*@ts-ignore*/}
                                                            Updated {new Date(app.updatedAt).toLocaleDateString()}
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
                        </>
                    )}

                    {activeTab === 'documents' && (
                        <div className="space-y-6">
                            {/* Passport & Visa Documents */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-gray-500" />
                                        Identity Documents
                                    </h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => setIsPassportSheetOpen(true)} className="text-sm font-medium text-gray-600 hover:text-black">Edit Passport</button>
                                        <span className="text-gray-300">|</span>
                                        <button onClick={() => setIsVisaSheetOpen(true)} className="text-sm font-medium text-blue-600 hover:underline">Update Visa</button>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    {/* Passport Files */}
                                    {customer.passports?.[0]?.frontImage && (
                                        <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">Passport Front</div>
                                                    <div className="text-xs text-gray-500">ID Verification</div>
                                                </div>
                                            </div>
                                            <a href={customer.passports[0].frontImage} target="_blank" className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg">
                                                <Eye className="h-4 w-4" />
                                            </a>
                                        </div>
                                    )}
                                    {customer.passports?.[0]?.backImage && (
                                        <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">Passport Back</div>
                                                    <div className="text-xs text-gray-500">Address Verification</div>
                                                </div>
                                            </div>
                                            <a href={customer.passports[0].backImage} target="_blank" className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg">
                                                <Eye className="h-4 w-4" />
                                            </a>
                                        </div>
                                    )}
                                    {/* Visa Files */}
                                    {customer.visas?.map((visa: any) => (
                                        <div key={visa.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-50 text-purple-600 rounded">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">Visa - {visa.country}</div>
                                                    <div className="text-xs text-gray-500">{visa.type} • Expires {new Date(visa.expiryDate).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {visa.fileUrl && (
                                                    <a href={visa.fileUrl} target="_blank" className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg">
                                                        <Eye className="h-4 w-4" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {(!customer.passports?.[0]?.frontImage && !customer.visas?.length) && (
                                        <div className="text-center text-sm text-gray-500 py-4">No identity documents uploaded.</div>
                                    )}
                                </div>
                            </div>

                            {/* Generic Files */}
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <FolderClosed className="h-5 w-5 text-gray-500" />
                                        Other Documents
                                    </h3>
                                    <button className="text-sm font-medium text-blue-600 hover:underline">Upload New</button>
                                </div>
                                {/* Generic Files */}
                                {(() => {
                                    // Filter out documents that are already displayed as Passport or Visa
                                    const knownUrls = new Set<string>();
                                    if (customer.passports?.[0]?.frontImage) knownUrls.add(customer.passports[0].frontImage);
                                    if (customer.passports?.[0]?.backImage) knownUrls.add(customer.passports[0].backImage);
                                    customer.visas?.forEach((v: any) => {
                                        if (v.fileUrl) knownUrls.add(v.fileUrl);
                                    });

                                    const otherDocuments = customer.documents.filter((doc: any) => !knownUrls.has(doc.fileUrl));

                                    return (
                                        <div className="p-4 grid grid-cols-1 gap-3">
                                            {otherDocuments.length > 0 ? (
                                                otherDocuments.map((doc: any) => (
                                                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-300 hover:shadow-sm transition-all group bg-gray-50/50">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                                                                <FileIcon className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900 truncate">{doc.name}</div>
                                                                <div className="text-xs text-gray-500">{doc.category} • {(doc.fileSize / 1024).toFixed(0)} KB</div>
                                                            </div>
                                                        </div>
                                                        <a href={doc.fileUrl} download className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                                            <Download className="h-4 w-4" />
                                                        </a>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-sm text-gray-500 py-4">
                                                    No other documents uploaded.
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
