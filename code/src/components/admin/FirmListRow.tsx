'use client';

import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { FirmActions } from '@/components/admin/FirmActions';

interface FirmListRowProps {
    firm: {
        id: string;
        name: string;
        email: string;
        status: string;
        subscriptionPlan: string;
        createdAt: Date;
        _count: {
            users: number;
            applications: number;
        };
    };
}

export function FirmListRow({ firm }: FirmListRowProps) {
    const router = useRouter();

    const handleRowClick = (e: React.MouseEvent) => {
        // Prevent navigation if clicking on actions or links inside
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
            return;
        }
        router.push(`/dashboard/admin/firms/${firm.id}`);
    };

    return (
        <tr
            onClick={handleRowClick}
            className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
                        <Building2 className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">{firm.name}</div>
                        <div className="text-xs text-gray-500">{firm.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${firm.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                        firm.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'}`}>
                    {firm.status}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {firm.subscriptionPlan}
                </span>
            </td>
            <td className="px-6 py-4 text-gray-500">
                <div className="flex items-center gap-4">
                    <div title="Users">👤 {firm._count.users}</div>
                    <div title="Applications">📄 {firm._count.applications}</div>
                </div>
            </td>
            <td className="px-6 py-4 text-gray-500">
                {format(new Date(firm.createdAt), 'MMM d, yyyy')}
            </td>
            <td className="px-6 py-4 text-right">
                <div onClick={(e) => e.stopPropagation()}>
                    <FirmActions firmId={firm.id} status={firm.status} mode="menu" />
                </div>
            </td>
        </tr>
    );
}
