import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardRootPage() {
    const session = await auth();
    // @ts-ignore
    const firmId = session?.user?.firmId;

    if (firmId) {
        redirect(`/dashboard/${firmId}`);
    } else if (session?.user) {
        // Logged in but no firmId (Admin)
        redirect('/dashboard/admin');
    } else {
        redirect('/login');
    }
}
