'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, LogOut, FolderClosed, Clock, Zap, IndianRupee, Menu } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

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

interface SidebarContentProps {
    firmId: string;
    firmName?: string;
    onLinkClick?: () => void;
}

export function SidebarContent({ firmId, firmName, onLinkClick }: SidebarContentProps) {
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
                onClick={onLinkClick}
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
        <div className="flex h-full flex-col bg-gradient-to-b from-gray-50 to-white text-gray-900">
            {/* Header / Logo */}
            <div className="flex h-16 items-center px-6 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
                <Link href={`/dashboard/${firmId}`} className="flex items-center gap-2.5 font-bold text-xl group" onClick={onLinkClick}>
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-primary-teal-500 to-primary-teal-600 flex items-center justify-center shadow-[0_4px_12px_0_rgba(44,129,141,0.3)] group-hover:scale-105 transition-transform">
                        <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-teal-600 to-primary-teal-500">SnapImmi</span>
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

export function MobileSidebar({ firmId, firmName }: { firmId: string, firmName?: string }) {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open sidebar</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                    Main navigation menu for the application.
                </SheetDescription>
                <SidebarContent firmId={firmId} firmName={firmName} onLinkClick={() => setOpen(false)} />
            </SheetContent>
        </Sheet>
    );
}

export function Sidebar({ firmId, firmName }: { firmId: string, firmName?: string }) {
    return (
        <div className="hidden border-r border-gray-200/50 bg-gradient-to-b from-gray-50 to-white text-gray-900 lg:block lg:w-64 lg:fixed lg:inset-y-0 z-50 backdrop-blur-md shadow-sm">
            <SidebarContent firmId={firmId} firmName={firmName} />
        </div>
    );
}
