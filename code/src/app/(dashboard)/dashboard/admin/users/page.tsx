import { prisma } from '@/lib/prisma';
import { Search } from 'lucide-react';
import { UserListRow } from '@/components/admin/UserListRow';

async function getUsers() {
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            firm: {
                select: { name: true, slug: true }
            }
        },
        take: 50 // Limit for now
    });
}

export default async function UsersPage() {
    const users = await getUsers();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Users</h1>
                    <p className="text-muted-foreground mt-2">Manage all users across the platform.</p>
                </div>
            </div>

            {/* Simple Search */}
            <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by email..."
                        className="w-full pl-9 pr-4 py-2 text-sm border-gray-200 rounded-lg focus:ring-black focus:border-black"
                    />
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Firm</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user) => (
                            <UserListRow key={user.id} user={user} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
