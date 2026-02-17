import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { FirmListRow } from '@/components/admin/FirmListRow';

async function getFirms() {
    return await prisma.firm.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { users: true, applications: true }
            }
        }
    });
}

export default async function FirmsPage() {
    const firms = await getFirms();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Firms</h1>
                    <p className="text-muted-foreground mt-2">Manage registered firms and their subscription status.</p>
                </div>
                <Link href="/dashboard/admin/firms/new">
                    <Button className="bg-gradient-to-r from-primary-teal-500 to-primary-teal-600 hover:from-primary-teal-600 hover:to-primary-teal-700 text-white gap-2 shadow-[0_4px_12px_0_rgba(44,129,141,0.3)] hover:shadow-[0_6px_16px_0_rgba(44,129,141,0.4)]">
                        <Plus className="h-4 w-4" />
                        Add New Firm
                    </Button>
                </Link>
            </div>

            {/* Filters & Search (Placeholder for now) */}
            <div className="flex items-center gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search firms..."
                        className="w-full pl-9 pr-4 py-2 text-sm border-gray-200 rounded-lg focus:ring-black focus:border-black"
                    />
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4">For Firm</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Plan</th>
                            <th className="px-6 py-4">Stats</th>
                            <th className="px-6 py-4">Created</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {firms.map((firm) => (
                            <FirmListRow key={firm.id} firm={firm} />
                        ))}
                        {firms.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    No firms found. Create one to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
