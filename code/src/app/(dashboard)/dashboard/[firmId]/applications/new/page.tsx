import { NewApplicationForm } from '@/features/applications/components/NewApplicationForm';

export default async function NewApplicationPage({ params }: { params: Promise<{ firmId: string }> }) {
    const { firmId } = await params;
    return (
        <div className="max-w-4xl mx-auto py-12 px-6">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Create New Application</h1>
                <p className="text-gray-500">Follow the steps to register a new visa or passport application.</p>
            </div>

            <NewApplicationForm firmId={firmId} />
        </div>
    );
}
