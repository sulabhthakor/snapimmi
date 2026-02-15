'use client';

import dynamic from 'next/dynamic';

const BottomNav = dynamic(
    () => import('@/components/layout/BottomNav').then(m => m.BottomNav),
    { ssr: false }
);

export function BottomNavWrapper({ firmId, firmName }: { firmId: string; firmName?: string }) {
    return <BottomNav firmId={firmId} firmName={firmName} />;
}
