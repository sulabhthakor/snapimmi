import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminBottomNavWrapper } from '@/components/admin/AdminBottomNavWrapper';
import { Header } from '@/components/layout/header';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

export default async function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Strict Role Check
    // @ts-ignore
    if (session?.user?.role !== 'SUPER_ADMIN') {
        redirect('/login');
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="lg:pl-64 flex flex-col min-h-screen">
                <Header user={session?.user} />
                <main className="flex-1 py-4 lg:py-8 px-4 lg:px-6 pb-24 lg:pb-8">
                    <div className="mx-auto max-w-7xl">
                        <Breadcrumbs />
                        {children}
                    </div>
                </main>
            </div>
            <AdminBottomNavWrapper />
        </div>
    );
}
