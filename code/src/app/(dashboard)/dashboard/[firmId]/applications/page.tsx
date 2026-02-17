import { Suspense } from 'react';
import Link from 'next/link';
import { ApplicationTable } from '@/features/applications/components/ApplicationTable';
import { getApplications } from '@/features/applications/server/actions';

export default async function ApplicationsPage({
    params,
    searchParams
}: {
    params: Promise<{ firmId: string }>;
    searchParams: Promise<{ customerId?: string; search?: string; status?: string; priority?: string }>;
}) {
    const { firmId } = await params;
    const { customerId, search, status, priority } = await searchParams;

    // Initial fetch with URL params
    const initialFilters = { customerId, search, status, priority };
    const applications = await getApplications(firmId, initialFilters);

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Application Pipeline</h1>
                    <p className="text-gray-600 mt-1">Track and manage visa applications across stages.</p>
                </div>
                <Link
                    href={`/dashboard/${firmId}/applications/new`}
                    className="w-full sm:w-auto text-center bg-gradient-to-r from-primary-teal-500 to-primary-teal-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:from-primary-teal-600 hover:to-primary-teal-700 shadow-[0_4px_12px_0_rgba(44,129,141,0.3)] hover:shadow-[0_6px_16px_0_rgba(44,129,141,0.4)] transform hover:-translate-y-0.5 transition-all"
                >
                    + New Application
                </Link>
            </div>

            <Suspense fallback={<div className="p-4 text-center text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">Loading applications...</div>}>
                <ApplicationTable initialData={applications} firmId={firmId} />
            </Suspense>
        </div>
    );
}
