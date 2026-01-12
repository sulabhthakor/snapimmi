'use client';

import { LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';

export function UserMenu({ user }: { user: any }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative z-50" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-1 pr-2 rounded-full hover:bg-gray-100/80 transition-all border border-transparent hover:border-gray-200 group"
            >
                {user.image ? (
                    <img
                        className="h-8 w-8 rounded-full bg-gray-50 object-cover ring-2 ring-white shadow-sm"
                        src={user.image}
                        alt=""
                    />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-xs font-bold text-white shadow-md ring-2 ring-white">
                        {initials}
                    </div>
                )}
                <div className="hidden lg:flex lg:items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                        {user.name}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-gray-600' : ''}`} />
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 z-50 mt-3 w-64 origin-top-right rounded-2xl bg-white p-1 shadow-xl shadow-gray-200/50 ring-1 ring-black/5 border border-gray-100 animate-in fade-in zoom-in-95 duration-200 slide-in-from-top-2">
                    <div className="px-4 py-3 mb-1 border-b border-gray-50">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Signed in as</p>
                        <p className="truncate text-sm font-bold text-gray-900">{user.email}</p>
                    </div>

                    <div className="space-y-0.5">
                        <a
                            href={`/dashboard/${user.firmId}/settings`}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                        >
                            <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-black group-hover:shadow-sm transition-all">
                                <User className="h-4 w-4" />
                            </div>
                            My Profile
                        </a>
                        <a
                            href={`/dashboard/${user.firmId}`}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors group"
                        >
                            <div className="p-1.5 rounded-lg bg-gray-100 text-gray-500 group-hover:bg-white group-hover:text-black group-hover:shadow-sm transition-all">
                                <LayoutDashboard className="h-4 w-4" />
                            </div>
                            Dashboard
                        </a>
                    </div>

                    <div className="mt-1 pt-1 border-t border-gray-50">
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
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors group"
                        >
                            <div className="p-1.5 rounded-lg bg-red-50 text-red-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                <LogOut className="h-4 w-4" />
                            </div>
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
