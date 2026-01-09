'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, Settings, LogOut, FolderClosed } from 'lucide-react';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/dashboard/customers', icon: Users },
    { name: 'Documents', href: '/dashboard/documents', icon: FolderClosed },
    { name: 'Applications', href: '/dashboard/applications', icon: FileText },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar({ firmId }: { firmId: string }) {
    const pathname = usePathname();

    return (
        <div className="hidden border-r bg-gray-900 text-white lg:block lg:w-64 lg:fixed lg:inset-y-0">
            <div className="flex h-16 items-center px-6 border-b border-gray-800">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
                        <span className="text-black font-bold text-sm">S</span>
                    </div>
                    SnapImmi
                </Link>
            </div>
            <nav className="flex-1 space-y-1 px-3 py-6">
                {navigation.map((item) => {
                    // Adjust href to include firmId
                    // If item.href is /dashboard, it becomes /dashboard/[firmId]
                    // If item.href is /dashboard/customers, it becomes /dashboard/[firmId]/customers
                    const href = item.href === '/dashboard'
                        ? `/dashboard/${firmId}`
                        : item.href.replace('/dashboard', `/dashboard/${firmId}`);

                    const isActive = pathname === href;

                    return (
                        <Link
                            key={item.name}
                            href={href}
                            className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                                ? 'bg-gray-800 text-white shadow-sm'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-800">
                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
