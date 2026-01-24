'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, LogOut, FolderClosed, Clock, Zap, IndianRupee } from 'lucide-react';
import { signOut } from 'next-auth/react';

const navigation = {
    main: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Applications', href: '/dashboard/applications', icon: FileText },
        { name: 'Customers', href: '/dashboard/customers', icon: Users },
        { name: 'Revenue', href: '/dashboard/revenue', icon: IndianRupee },
        { name: 'Documents', href: '/dashboard/documents', icon: FolderClosed },
    ],
    intelligence: [
        { name: 'Expiry Radar', href: '/dashboard/expiry-radar', icon: Clock },
    ],
    settings: [
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]
};

export function Sidebar({ firmId, firmName }: { firmId: string, firmName?: string }) {
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
        // Adjust href to include firmId
        const href = item.href === '/dashboard'
            ? `/dashboard/${firmId}`
            : item.href.replace('/dashboard', `/dashboard/${firmId}`);

        const isActive = pathname === href;

        return (
            <Link
                key={item.name}
                href={href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${isActive
                    ? 'bg-black text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
            >
                <item.icon className={`h-4 w-4 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                {item.name}
            </Link>
        );
    };

    return (
        <div className="hidden border-r border-gray-200 bg-gray-50/50 text-gray-900 lg:block lg:w-64 lg:fixed lg:inset-y-0 z-50 backdrop-blur-xl">
            {/* Header / Logo */}
            <div className="flex h-16 items-center px-6 border-b border-gray-200 bg-white/50">
                <Link href={`/dashboard/${firmId}`} className="flex items-center gap-2.5 font-bold text-xl group">
                    <div className="h-8 w-8 rounded-xl bg-black flex items-center justify-center shadow-lg shadow-gray-200 group-hover:scale-105 transition-transform">
                        <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">SnapImmi</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main</h3>
                    <div className="space-y-1">
                        {navigation.main.map(renderLink)}
                    </div>
                </div>

                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        Intelligence
                        <Zap className="h-3 w-3 text-amber-500 fill-amber-500 animate-pulse" />
                    </h3>
                    <div className="space-y-1">
                        {navigation.intelligence.map(renderLink)}
                    </div>
                </div>

                <div>
                    <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">System</h3>
                    <div className="space-y-1">
                        {navigation.settings.map(renderLink)}
                    </div>
                </div>
            </nav>

            {/* Footer / User / Sign Out */}
            <div className="p-4 border-t border-gray-200 bg-white/50">
                <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all group"
                >
                    <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-500" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
