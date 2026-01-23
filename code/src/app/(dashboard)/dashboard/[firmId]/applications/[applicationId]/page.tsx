import { Suspense } from 'react';
import { getApplicationDetails } from '@/features/applications/server/actions';
import { ApplicationDetailView } from '@/features/applications/components/ApplicationDetailView';
import { notFound } from 'next/navigation';

export default async function ApplicationDetailPage({ params }: { params: Promise<{ applicationId: string; firmId: string }> }) {
    const { applicationId, firmId } = await params;
    const application = await getApplicationDetails(applicationId);

    if (!application) return notFound();

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ApplicationDetailView application={application} firmId={firmId} />
        </Suspense>
    );
}
