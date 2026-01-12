import { ExpiryTable } from '@/features/expiry-radar/components/ExpiryTable';

export default async function ExpiryRadarPage({ params }: { params: Promise<{ firmId: string }> }) {
    const { firmId } = await params;

    // Mock Data - In real app, fetch from DB
    const expiringItems = [
        { id: '1', customerId: 'cust_123', customerName: 'John Doe', type: 'Passport' as const, detail: 'USA Passport', date: '2024-02-10', daysLeft: 2 },
        { id: '2', customerId: 'cust_456', customerName: 'Jane Smith', type: 'Visa' as const, detail: 'Canada Student Visa', date: '2024-02-15', daysLeft: 7 },
        { id: '3', customerId: 'cust_789', customerName: 'Robert Fox', type: 'Visa' as const, detail: 'UK Work Visa', date: '2024-03-01', daysLeft: 45 },
        { id: '4', customerId: 'cust_101', customerName: 'Alice Johnson', type: 'Passport' as const, detail: 'Indian Passport', date: '2024-05-20', daysLeft: 120 },
    ];

    // Transform to component format
    const tableData = expiringItems.map(item => ({
        id: item.id,
        customerId: item.customerId,
        customerName: item.customerName,
        type: item.type,
        detail: item.detail,
        expiryDate: item.date,
        daysLeft: item.daysLeft
    }));

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Expiry Radar</h1>
                    <p className="mt-2 text-base text-gray-600">Monitor upcoming document and visa expirations.</p>
                </div>
            </div>

            <ExpiryTable data={tableData} firmId={firmId} />
        </div>
    );
}
