'use client';

import Link from "next/link";
import { UserMenu } from '@/components/layout/user-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export function LandingHeader({ user }: { user?: any }) {
    const [isOpen, setIsOpen] = useState(false);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Solutions', href: '#solutions' },
        { name: 'Pricing', href: '#pricing' },
    ];

    return (
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100/50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between relative">

                {/* Mobile Menu Trigger (Left) */}
                <div className="md:hidden">
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="-ml-2">
                                <Menu className="h-6 w-6" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                            <SheetTitle className="text-left text-lg font-bold">Menu</SheetTitle>
                            <SheetDescription className="text-left text-sm text-gray-500 mb-6">
                                Navigate through SnapImmi features and options.
                            </SheetDescription>
                            <nav className="flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <a
                                        key={link.name}
                                        href={link.href}
                                        className="text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.name}
                                    </a>
                                ))}
                                <hr className="my-2 border-gray-100" />
                                {!user && (
                                    <>
                                        <Link
                                            href="/login"
                                            className="text-lg font-medium text-gray-900 hover:text-gray-600 transition-colors"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href="/login"
                                            className="inline-flex justify-center items-center px-5 py-3 text-base font-medium bg-black text-white rounded-full hover:bg-gray-800 transition-all shadow-lg"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                                {user && (
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex justify-center items-center px-5 py-3 text-base font-medium bg-black text-white rounded-full hover:bg-gray-800 transition-all shadow-lg"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Go to Dashboard
                                    </Link>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Logo (Center on Mobile, Left on Desktop) */}
                <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 md:static md:transform-none">
                    <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight">SnapImmi</span>
                </div>

                {/* Desktop Navigation (Center-ish) */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 absolute left-1/2 -translate-x-1/2">
                    {navLinks.map((link) => (
                        <a key={link.name} href={link.href} className="hover:text-black transition-colors">
                            {link.name}
                        </a>
                    ))}
                </nav>

                {/* Right Actions (User / Auth) */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <UserMenu user={user} />
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/login"
                                className="hidden md:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/login"
                                className="px-5 py-2 text-sm font-medium bg-black text-white rounded-full hover:bg-gray-800 transition-all hover:shadow-lg hover:shadow-gray-200"
                            >
                                <span className="hidden md:inline">Get Started</span>
                                <span className="md:hidden">Login</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
