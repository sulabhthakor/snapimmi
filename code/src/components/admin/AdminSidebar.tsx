'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Users, Settings, LogOut, Globe, ShieldCheck } from 'lucide-react';
import { signOut } from 'next-auth/react';

const navigation = {
    main: [
        { name: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
        { name: 'Firms', href: '/dashboard/admin/firms', icon: Building2 },
        { name: 'All Users', href: '/dashboard/admin/users', icon: Users },
    ],
    system: [
        { name: 'Master Data', href: '/dashboard/admin/master-data', icon: Globe },
        { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
    ]
};

export function AdminSidebar() {
    const pathname = usePathname();

    const handleSignOut = async () => {
        // Clear all browser storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear all cookies accessible via JS
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        await signOut({ callbackUrl: '/login' });
    };

    const renderLink = (item: any) => {
        const isActive = pathname === item.href;

        return (
            <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${isActive
                    ? 'bg-gradient-to-r from-primary-teal-500 to-primary-teal-600 text-white shadow-[0_4px_12px_0_rgba(44,129,141,0.25)]'
                    : 'text-gray-600 hover:bg-primary-teal-50 hover:text-primary-teal-700'
                    }`}
            >
                <item.icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-primary-teal-500 group-hover:text-primary-teal-600'}`} />
                {item.name}
            </Link>
        );
    };

    return (
        <div className="hidden border-r border-gray-200/50 bg-gradient-to-b from-gray-50 to-white text-gray-900 lg:block lg:w-64 lg:fixed lg:inset-y-0 z-50 backdrop-blur-md shadow-sm">
            {/* Header / Logo */}
            <div className="flex h-16 items-center px-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
                <Link href="/dashboard/admin" className="flex items-center gap-2.5 font-bold text-xl group">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-teal-500 to-primary-teal-600 flex items-center justify-center shadow-[0_4px_12px_0_rgba(44,129,141,0.3)] group-hover:scale-105 transition-transform">
                        <ShieldCheck className="h-4 w-4 text-white" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-teal-600 to-primary-teal-500">Admin</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Platform</h3>
                    <div className="space-y-1">
                        {navigation.main.map(renderLink)}
                    </div>
                </div>

                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">System</h3>
                    <div className="space-y-1">
                        {navigation.system.map(renderLink)}
                    </div>
                </div>
            </nav>

            {/* Footer / Sign Out */}
            <div className="p-4 border-t border-gray-200/50 bg-white/80 backdrop-blur-sm">
                <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all group"
                >
                    <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
