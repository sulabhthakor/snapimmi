'use client';

import { useRouter } from 'next/navigation';
import { User, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { UserActions } from '@/components/admin/UserActions';

interface UserListRowProps {
    user: {
        id: string;
        name: string | null;
        email: string | null;
        role: string;
        isActive: boolean;
        createdAt: Date;
        firm: {
            name: string;
            slug: string;
        } | null;
    };
}

export function UserListRow({ user }: UserListRowProps) {
    const router = useRouter();

    const handleRowClick = (e: React.MouseEvent) => {
        // Prevent navigation if clicking on actions or links inside
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
            return;
        }
        router.push(`/dashboard/admin/users/${user.id}`);
    };

    return (
        <tr
            onClick={handleRowClick}
            className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                        <User className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {user.role}
                </span>
            </td>
            <td className="px-6 py-4">
                {user.firm ? (
                    <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span>{user.firm.name}</span>
                    </div>
                ) : (
                    <span className="text-gray-400 italic">No Firm (System)</span>
                )}
            </td>
            <td className="px-6 py-4">
                {user.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Active
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        Inactive
                    </span>
                )}
            </td>
            <td className="px-6 py-4 text-gray-500">
                {format(new Date(user.createdAt), 'MMM d, yyyy')}
            </td>
            <td className="px-6 py-4 text-right">
                <div onClick={(e) => e.stopPropagation()}>
                    <UserActions userId={user.id} isActive={user.isActive} />
                </div>
            </td>
        </tr>
    );
}
