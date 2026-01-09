import { Suspense } from 'react';
import { KanbanBoard } from '@/features/applications/components/KanbanBoard';
import { getApplications } from '@/features/applications/server/actions';

export default async function ApplicationsPage({ params }: { params: { firmId: string } }) {
    const applications = await getApplications(params.firmId);

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Application Pipeline</h1>
                    <p className="text-gray-500">Track and manage visa applications across stages.</p>
                </div>
                <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 shadow-md">
                    + New Application
                </button>
            </div>

            <Suspense fallback={<div>Loading board...</div>}>
                <KanbanBoard initialData={applications} />
            </Suspense>
        </div>
    );
}
