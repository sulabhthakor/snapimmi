'use client';

import { useState } from 'react';
import { User, Shield, CheckCircle2, UserPlus } from 'lucide-react';
import { AddMemberDialog } from './AddMemberDialog';
import { useRouter } from 'next/navigation';

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLogin: Date | null;
}

export function TeamList({ firmId, members, currentUserRole }: { firmId: string, members: TeamMember[], currentUserRole?: string }) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const router = useRouter();

    const handleSuccess = () => {
        router.refresh(); // Refresh server component data
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Team Members</h2>
                    <p className="text-sm text-gray-500">Manage who has access to your firm dashboard.</p>
                </div>
                {currentUserRole === 'FIRM_OWNER' && (
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-primary-teal-500 to-primary-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-primary-teal-600 hover:to-primary-teal-700 transition-all shadow-md shadow-primary-teal-100"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add Member
                    </button>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Role</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Last Login</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {members.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{member.name}</div>
                                            <div className="text-xs text-gray-500">{member.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5">
                                        {member.role === 'FIRM_OWNER' ? (
                                            <Shield className="h-3 w-3 text-primary-teal-600" />
                                        ) : (
                                            <User className="h-3 w-3 text-gray-400" />
                                        )}
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${member.role === 'FIRM_OWNER' ? 'bg-primary-teal-50 text-primary-teal-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {member.role.replace('_', ' ')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {member.isActive ? (
                                        <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium border border-green-100">
                                            <CheckCircle2 className="h-3 w-3" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full text-xs">Inactive</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-gray-500">
                                    {member.lastLogin ? (
                                        new Date(member.lastLogin).toLocaleDateString()
                                    ) : (
                                        'Never'
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAddOpen && (
                <AddMemberDialog
                    firmId={firmId}
                    onClose={() => setIsAddOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
