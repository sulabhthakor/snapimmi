import { Suspense } from 'react';
import { DocumentVault } from '@/features/documents/components/DocumentVault';
import { getDocuments } from '@/features/documents/server/actions';

export default async function DocumentsPage({ params }: { params: { firmId: string } }) {
    const documents = await getDocuments(params.firmId);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Documents Vault</h1>
                    <p className="text-gray-600 mt-1">Securely store and manage client passports, visas, and IDs.</p>
                </div>
            </div>

            <Suspense fallback={<div>Loading documents...</div>}>
                <DocumentVault documents={documents} />
            </Suspense>
        </div>
    );
}
