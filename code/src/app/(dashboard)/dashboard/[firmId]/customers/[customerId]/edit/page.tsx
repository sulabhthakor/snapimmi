import { getCustomer } from '@/features/customers/server/actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EditCustomerForm } from '@/features/customers/components/EditCustomerForm';

export default async function EditCustomerPage({
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
                <Link href={`/dashboard/${firmId}/customers/${customerId}`} className="hover:text-black flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Profile
                </Link>
                <span>/</span>
                <span className="font-medium text-gray-900">Edit Customer</span>
            </div>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Customer Details</h1>
                <p className="text-gray-600 mt-1">Update profile information, passport details, family settings, and manage documents.</p>
            </div>

            <EditCustomerForm customer={customer} firmId={firmId} />
        </div>
    );
}
