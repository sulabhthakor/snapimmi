import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { SystemBanner } from '@/components/layout/SystemBanner';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { prisma } from '@/lib/prisma';
import { getSystemSettings } from '@/features/admin/system-settings-actions';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    // @ts-ignore
    const firmId = session?.user?.firmId;
    // @ts-ignore
    const userRole = session?.user?.role;

    // Check Maintenance Mode
    const settings = await getSystemSettings();
    if (settings?.maintenanceMode && userRole !== 'SUPER_ADMIN') {
        redirect('/maintenance');
    }

    // Allow SUPER_ADMIN users without firmId to access admin routes
    if (!firmId && userRole === 'SUPER_ADMIN') {
        return <>{children}</>;
    }

    if (!firmId) {
        redirect('/login');
    }

    const firm = await prisma.firm.findUnique({
        where: { id: firmId },
        select: { name: true }
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar firmId={firmId} firmName={firm?.name} />
            <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
                <SystemBanner />
                <Header user={session?.user} />
                <main className="flex-1 py-4 lg:py-8 px-4 lg:px-6">
                    <div className="mx-auto max-w-7xl">
                        <Breadcrumbs />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
