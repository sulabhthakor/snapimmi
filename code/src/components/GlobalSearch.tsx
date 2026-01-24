'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { Search, Command, Users, FileText, File, Loader2, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { globalSearch } from '@/features/search/server/actions'; // Adjust import if needed based on alias

export function GlobalSearch({ firmId }: { firmId?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>(null);
    const [isPending, startTransition] = useTransition();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Toggle on Cmd+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
                inputRef.current?.blur();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Search Effect
    useEffect(() => {
        if (query.length < 2) {
            setResults(null);
            return;
        }

        const timer = setTimeout(() => {
            startTransition(async () => {
                const data = await globalSearch(firmId, query);
                setResults(data);
                setIsOpen(true);
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [query, firmId]);

    const handleSelect = (url: string) => {
        if (url.startsWith('http')) {
            window.open(url, '_blank');
        } else {
            router.push(url);
        }
        setIsOpen(false);
        setQuery('');
    };

    const hasResults = results && (results.customers.length > 0 || results.applications.length > 0 || results.documents.length > 0);

    return (
        <div ref={wrapperRef} className="relative w-full max-w-lg z-50">
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    {isPending ? (
                        <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4 text-gray-400" />
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    className="block w-full rounded-full border border-gray-200 bg-gray-50/50 py-2.5 pl-11 pr-12 text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black transition-all shadow-sm hover:bg-gray-50"
                    placeholder="Search anywhere..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-gray-200 bg-gray-100 px-1.5 font-sans text-[10px] font-medium text-gray-500">
                        <Command className="h-3 w-3" />K
                    </kbd>
                </div>
            </div>

            {/* Results Dropdown */}
            {isOpen && (query.length >= 2) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    {!isPending && !hasResults && (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            No results found for "{query}"
                        </div>
                    )}

                    {hasResults && (
                        <div className="py-2">
                            {/* Customers */}
                            {results.customers.length > 0 && (
                                <div className="px-2 mb-2">
                                    <h3 className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">Customers</h3>
                                    {results.customers.map((c: any) => (
                                        <button key={c.id} onClick={() => handleSelect(c.url)} className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg group transition-colors">
                                            <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <Users className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900">{c.title}</div>
                                                <div className="text-xs text-gray-500 truncate">{c.subtitle}</div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Applications */}
                            {results.applications.length > 0 && (
                                <div className="px-2 mb-2 border-t border-gray-50 pt-2">
                                    <h3 className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">Applications</h3>
                                    {results.applications.map((a: any) => (
                                        <button key={a.id} onClick={() => handleSelect(a.url)} className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg group transition-colors">
                                            <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                <FileText className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900">{a.title}</div>
                                                <div className="text-xs text-gray-500 truncate">{a.subtitle}</div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Documents */}
                            {results.documents.length > 0 && (
                                <div className="px-2 border-t border-gray-50 pt-2">
                                    <h3 className="text-xs font-semibold text-gray-400 px-2 py-1 uppercase tracking-wider">Documents</h3>
                                    {results.documents.map((d: any) => (
                                        <button key={d.id} onClick={() => handleSelect(d.url)} className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg group transition-colors">
                                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                                                <File className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{d.title}</div>
                                                <div className="text-xs text-gray-500 truncate">{d.subtitle}</div>
                                            </div>
                                            <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
