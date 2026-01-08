import { Suspense } from 'react';
import { CustomerList } from '@/features/customers/components/CustomerList';
import { getCustomers } from '@/features/customers/server/actions';

export default async function CustomersPage() {
    const initialData = await getCustomers({ page: 1, limit: 10, status: 'ALL' });
    // @ts-ignore
    const safeData = { data: initialData.data, total: initialData.total };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">Manage leads and active clients.</p>
                </div>
            </div>

            <Suspense fallback={<div>Loading customers...</div>}>
                <CustomerList initialData={safeData} />
            </Suspense>
        </div>
    );
}
