import { LucideIcon } from 'lucide-react';

export interface TimelineEvent {
    type: string;
    date: Date;
    title: string;
    subtitle?: string;
    icon: LucideIcon;
    color: string; // e.g., "bg-blue-50 text-blue-600"
}

interface TimelineProps {
    events: TimelineEvent[];
    emptyMessage?: string;
}

export function Timeline({ events, emptyMessage = "No activity yet." }: TimelineProps) {
    if (events.length === 0) {
        return <div className="p-8 text-center text-gray-500 text-sm">{emptyMessage}</div>;
    }

    return (
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            {events.map((event, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Icon */}
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${event.color.split(' ')[0]}`}>
                        <event.icon className={`h-5 w-5 ${event.color.split(' ')[1]}`} />
                    </div>
                    {/* Card */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                            <div className="font-bold text-gray-900 text-sm">{event.title}</div>
                            <time className="font-caveat font-medium text-indigo-500 text-xs">{event.date.toLocaleDateString()}</time>
                        </div>
                        {event.subtitle && (
                            <div className="text-gray-500 text-xs">{event.subtitle}</div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
