import { Suspense } from 'react';
import { CustomerList } from '@/features/customers/components/CustomerList';
import { getCustomers } from '@/features/customers/server/actions';

export default async function CustomersPage() {
    const initialData = await getCustomers({ page: 1, limit: 10, status: 'ALL' });
    // @ts-ignore
    const safeData = { data: initialData.data, total: initialData.total };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Customers</h1>
                    <p className="mt-2 text-base text-gray-600">Manage leads and active clients.</p>
                </div>
            </div>

            <Suspense fallback={<div>Loading customers...</div>}>
                <CustomerList initialData={safeData} />
            </Suspense>
        </div>
    );
}
