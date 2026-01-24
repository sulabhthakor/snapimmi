'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Bell, Check, ExternalLink, X } from 'lucide-react';
import { getNotifications, markAsRead, markAllAsRead } from '@/features/notifications/server/actions';
import { useRouter } from 'next/navigation';

type Notification = {
    id: string;
    title: string;
    message: string;
    type: string;
    link: string | null;
    isRead: boolean;
    createdAt: Date;
};

export function NotificationBell({ firmId }: { firmId?: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [hasUnread, setHasUnread] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Initial fetch
    useEffect(() => {
        const fetchNotes = async () => {
            const data = await getNotifications(firmId);
            setNotifications(data);
            setHasUnread(data.length > 0);
        };
        fetchNotes();

        // Poll every 30s (simplified real-time)
        const interval = setInterval(fetchNotes, 30000);
        return () => clearInterval(interval);
    }, [firmId]);

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

    const handleMarkRead = (id: string, link: string | null) => {
        startTransition(async () => {
            await markAsRead(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (notifications.length <= 1) setHasUnread(false);

            if (link) {
                setIsOpen(false);
                router.push(link);
            }
        });
    };

    const handleMarkAllRead = () => {
        startTransition(async () => {
            await markAllAsRead(firmId);
            setNotifications([]);
            setHasUnread(false);
            setIsOpen(false);
        });
    };

    return (
        <div ref={wrapperRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all"
            >
                <span className="sr-only">View notifications</span>
                <Bell className="h-5 w-5" aria-hidden="true" />
                {hasUnread && (
                    <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-600 ring-2 ring-white animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                <div className="inline-flex items-center justify-center p-3 bg-gray-50 rounded-full mb-2">
                                    <Bell className="h-5 w-5 text-gray-300" />
                                </div>
                                <p>No new notifications</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-50">
                                {notifications.map((note) => (
                                    <li key={note.id} className="relative bg-white hover:bg-gray-50 transition-colors p-4 group">
                                        <div className="flex gap-3">
                                            <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 
                                                ${note.type === 'SUCCESS' ? 'bg-green-500' :
                                                    note.type === 'WARNING' ? 'bg-amber-500' :
                                                        note.type === 'ERROR' ? 'bg-red-500' : 'bg-blue-500'}`
                                            }></div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{note.title}</p>
                                                <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{note.message}</p>
                                                <div className="mt-2 flex items-center gap-3">
                                                    {note.link && (
                                                        <button
                                                            onClick={() => handleMarkRead(note.id, note.link)}
                                                            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                        >
                                                            View Details <ExternalLink className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleMarkRead(note.id, null)}
                                                        className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                                                    >
                                                        <Check className="h-3 w-3" /> Dismiss
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-gray-400 whitespace-nowrap">
                                                {new Date(note.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
