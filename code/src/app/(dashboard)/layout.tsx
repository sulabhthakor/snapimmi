import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    // @ts-ignore
    const firmId = session?.user?.firmId;

    if (!firmId) {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar firmId={firmId} />
            <div className="lg:pl-64 flex flex-col min-h-screen">
                <Header user={session?.user} />
                <main className="flex-1 py-8 px-6">
                    <div className="mx-auto max-w-7xl">
                        <Breadcrumbs />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
