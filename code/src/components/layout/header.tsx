'use client';

import { Bell, Search, Command } from 'lucide-react';
import { UserMenu } from './user-menu';
import { GlobalSearch } from '../GlobalSearch';
import { NotificationBell } from '../NotificationBell';
import { MobileSidebar } from './sidebar';

export function Header({ user }: { user?: any }) {
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white/80 backdrop-blur-md px-4 lg:px-6 shadow-sm transition-all">
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <div className="flex items-center gap-x-2 lg:flex-1 lg:gap-x-4">
                    <MobileSidebar firmId={user?.firmId} />
                    <div className="flex-1 lg:flex-none">
                        <GlobalSearch firmId={user?.firmId} />
                    </div>
                </div>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <NotificationBell firmId={user?.firmId} />

                    <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

                    {user ? (
                        <UserMenu user={user} />
                    ) : (
                        <div className="flex items-center gap-x-4 lg:flex-1">
                            {/* Fallback if no user */}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
