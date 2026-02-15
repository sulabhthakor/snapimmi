'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Building2, Users, Settings, Menu,
    Globe, LogOut, ChevronRight
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';

export function AdminBottomNav() {
    const pathname = usePathname();
    const [moreOpen, setMoreOpen] = useState(false);

    const mainItems = [
        { name: 'Overview', icon: LayoutDashboard, href: '/dashboard/admin' },
        { name: 'Firms', icon: Building2, href: '/dashboard/admin/firms' },
        { name: 'Users', icon: Users, href: '/dashboard/admin/users' },
        { name: 'Settings', icon: Settings, href: '/dashboard/admin/settings' },
    ];

    const moreItems = [
        { name: 'Master Data', icon: Globe, href: '/dashboard/admin/master-data' },
    ];

    const isActive = (href: string) => {
        if (href === '/dashboard/admin') return pathname === '/dashboard/admin' || pathname === '/dashboard/admin/';
        return pathname.startsWith(href);
    };

    const isMoreActive = moreItems.some(item => pathname.startsWith(item.href));

    const handleSignOut = async () => {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        await signOut({ callbackUrl: '/login' });
    };

    return (
        <>
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
                <div className="bg-white/80 backdrop-blur-xl border-t border-gray-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                    <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
                        {mainItems.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 group relative"
                                >
                                    {active && (
                                        <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-black rounded-full transition-all duration-300" />
                                    )}
                                    <div className={`p-1.5 rounded-xl transition-all duration-200 ${active
                                        ? 'bg-black/5 scale-105'
                                        : 'group-hover:bg-gray-100 group-active:scale-95'
                                        }`}>
                                        <item.icon className={`h-5 w-5 transition-colors duration-200 ${active
                                            ? 'text-black'
                                            : 'text-gray-400 group-hover:text-gray-600'
                                            }`} />
                                    </div>
                                    <span className={`text-[10px] font-medium transition-colors duration-200 leading-tight ${active
                                        ? 'text-black'
                                        : 'text-gray-400 group-hover:text-gray-600'
                                        }`}>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}

                        <button
                            onClick={() => setMoreOpen(true)}
                            className="flex flex-col items-center justify-center gap-0.5 min-w-0 flex-1 py-1 group relative"
                        >
                            {isMoreActive && (
                                <div className="absolute -top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-black rounded-full transition-all duration-300" />
                            )}
                            <div className={`p-1.5 rounded-xl transition-all duration-200 ${isMoreActive
                                ? 'bg-black/5 scale-105'
                                : 'group-hover:bg-gray-100 group-active:scale-95'
                                }`}>
                                <Menu className={`h-5 w-5 transition-colors duration-200 ${isMoreActive
                                    ? 'text-black'
                                    : 'text-gray-400 group-hover:text-gray-600'
                                    }`} />
                            </div>
                            <span className={`text-[10px] font-medium transition-colors duration-200 leading-tight ${isMoreActive
                                ? 'text-black'
                                : 'text-gray-400 group-hover:text-gray-600'
                                }`}>
                                More
                            </span>
                        </button>
                    </div>
                    <div className="pb-safe" />
                </div>
            </nav>

            <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
                <SheetContent side="bottom" className="rounded-t-3xl px-0 pb-0 max-h-[70vh]">
                    <SheetTitle className="sr-only">More Options</SheetTitle>
                    <SheetDescription className="sr-only">
                        Additional admin navigation options.
                    </SheetDescription>

                    <div className="flex justify-center pt-2 pb-4">
                        <div className="w-10 h-1 bg-gray-300 rounded-full" />
                    </div>

                    <div className="px-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center shadow-lg">
                                <Settings className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 text-sm">Admin Panel</div>
                                <div className="text-xs text-gray-500">Platform Management</div>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 py-3 space-y-1">
                        <div className="px-2 mb-2">
                            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Navigation</span>
                        </div>
                        {moreItems.map((item) => {
                            const active = pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMoreOpen(false)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group ${active
                                        ? 'bg-black text-white shadow-md'
                                        : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                        <span className="font-medium text-sm">{item.name}</span>
                                    </div>
                                    <ChevronRight className={`h-4 w-4 ${active ? 'text-white/60' : 'text-gray-300'}`} />
                                </Link>
                            );
                        })}
                    </div>

                    <div className="px-4 py-3 border-t border-gray-100 mt-2">
                        <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 active:bg-red-100 transition-all group"
                        >
                            <LogOut className="h-5 w-5 text-red-400 group-hover:text-red-500" />
                            <span className="font-medium text-sm">Sign Out</span>
                        </button>
                    </div>
                    <div className="pb-safe" />
                </SheetContent>
            </Sheet>
        </>
    );
}
