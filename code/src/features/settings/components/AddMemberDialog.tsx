'use client';

import { useState, useTransition } from 'react';
import { X, Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { inviteTeamMember } from '../server/actions';

export function AddMemberDialog({ firmId, onClose, onSuccess }: { firmId: string, onClose: () => void, onSuccess: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('AGENT');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            const result = await inviteTeamMember(firmId, {
                name,
                email,
                password,
                role: role as any
            });

            if (result.success) {
                toast.success('Team member invited successfully');
                onSuccess();
                onClose();
            } else {
                toast.error(result.error || 'Failed to invite user');
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Add Team Member
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-1 rounded-full transition-all">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                            placeholder="e.g. Aditi Rao"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                            placeholder="e.g. aditi@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                        <input
                            required
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                            placeholder="********"
                            minLength={6}
                        />
                        <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white"
                        >
                            <option value="AGENT">Agent</option>
                            <option value="FIRM_OWNER">Firm Owner (Admin)</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
                        >
                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Invite Member'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
