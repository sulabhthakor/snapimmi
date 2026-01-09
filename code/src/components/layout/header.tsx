'use client';

import { Bell, Search } from 'lucide-react';
import { UserMenu } from './user-menu';

export function Header({ user }: { user?: any }) {
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b bg-white px-6 shadow-sm">
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <form className="relative flex flex-1" action="#" method="GET">
                    <label htmlFor="search-field" className="sr-only">Search</label>
                    <div className="relative w-full max-w-md">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            id="search-field"
                            className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                            placeholder="Search..."
                            type="search"
                            name="search"
                        />
                    </div>
                </form>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
                        <span className="sr-only">View notifications</span>
                        <Bell className="h-6 w-6" aria-hidden="true" />
                    </button>
                    <div className="h-6 w-px bg-gray-200" aria-hidden="true" />

                    {user ? (
                        <UserMenu user={user} />
                    ) : (
                        <div className="flex items-center gap-x-4 lg:flex-1">
                            {/* Fallback if no user, but should normally be handled by auth guard */}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
