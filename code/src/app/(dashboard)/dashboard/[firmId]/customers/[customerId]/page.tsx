import { getCustomer } from '@/features/customers/server/actions';
import { notFound } from 'next/navigation';
import { CustomerProfileView } from '@/features/customers/components/CustomerProfileView';

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

    return <CustomerProfileView customer={customer} firmId={firmId} />;
}
