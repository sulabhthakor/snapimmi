'use client';

import dynamic from 'next/dynamic';

const AdminBottomNav = dynamic(
    () => import('@/components/admin/AdminBottomNav').then(m => m.AdminBottomNav),
    { ssr: false }
);

export function AdminBottomNavWrapper() {
    return <AdminBottomNav />;
}
