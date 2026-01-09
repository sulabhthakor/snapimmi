'use client';

import { LogOut, User, LayoutDashboard } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function UserMenu({ user }: { user: any }) {
    // Get initials from name
    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const initials = user?.name ? getInitials(user.name) : 'U';

    return (
        <div className="relative group z-50">
            <button className="flex items-center gap-x-4 lg:flex-1 p-1.5 -m-1.5 focus:outline-none">
                <span className="sr-only">Open user menu</span>
                {user.image ? (
                    <img
                        className="h-9 w-9 rounded-full bg-gray-50 object-cover border border-gray-200"
                        src={user.image}
                        alt=""
                    />
                ) : (
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-700 border border-gray-200">
                        {initials}
                    </div>
                )}
            </button>

            {/* Dropdown Menu */}
            <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-xl bg-white py-2 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block border border-gray-100 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Signed in as</p>
                    <p className="truncate text-sm font-semibold text-gray-900">{user.email}</p>
                </div>

                <div className="p-1">
                    <a
                        href={`/dashboard/${user.firmId}/settings`}
                        className="flex items-center gap-x-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <User className="h-4 w-4 text-gray-500" />
                        My Profile
                    </a>
                    <a
                        href={`/dashboard/${user.firmId}`}
                        className="flex items-center gap-x-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <LayoutDashboard className="h-4 w-4 text-gray-500" />
                        Dashboard
                    </a>
                </div>

                <div className="p-1 border-t border-gray-50">
                    <button
                        onClick={async () => {
                            localStorage.clear();
                            sessionStorage.clear();
                            document.cookie.split(";").forEach((c) => {
                                document.cookie = c
                                    .replace(/^ +/, "")
                                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                            });
                            await signOut({ callbackUrl: '/login' });
                        }}
                        className="flex w-full items-center gap-x-3 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    );
}
