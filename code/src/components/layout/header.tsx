'use client';

import { Bell, Search, Command } from 'lucide-react';
import { UserMenu } from './user-menu';

export function Header({ user }: { user?: any }) {
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white/80 backdrop-blur-md px-6 shadow-sm transition-all">
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                <form className="relative flex flex-1 items-center" action="#" method="GET">
                    <label htmlFor="search-field" className="sr-only">Search</label>
                    <div className="relative w-full max-w-lg">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <Search className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        </div>
                        <input
                            id="search-field"
                            className="block w-full rounded-full border border-gray-200 bg-gray-50/50 py-2.5 pl-11 pr-12 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm hover:bg-gray-50"
                            placeholder="Search anywhere..."
                            type="search"
                            name="search"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 font-sans text-[10px] font-medium text-gray-500">
                                <Command className="h-3 w-3" />K
                            </kbd>
                        </div>
                    </div>
                </form>
                <div className="flex items-center gap-x-4 lg:gap-x-6">
                    <button type="button" className="relative -m-2.5 p-2.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                        <span className="sr-only">View notifications</span>
                        <Bell className="h-5 w-5" aria-hidden="true" />
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white animate-pulse"></span>
                    </button>

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
