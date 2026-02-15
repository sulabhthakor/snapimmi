import { ExpiryTable } from '@/features/expiry-radar/components/ExpiryTable';
import { getExpiringItems } from '@/features/expiry-radar/server/actions';

export default async function ExpiryRadarPage({ params }: { params: Promise<{ firmId: string }> }) {
    const { firmId } = await params;

    const tableData = await getExpiringItems(firmId);

    return (
        <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Expiry Radar</h1>
                    <p className="mt-2 text-base text-gray-600">Monitor upcoming document and visa expirations.</p>
                </div>
            </div>

            <ExpiryTable data={tableData} firmId={firmId} />
        </div>
    );
}
