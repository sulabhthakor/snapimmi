import { Activity, Clock } from 'lucide-react';

export default function ActivityPage() {
    // Placeholder data
    const activities = [
        { id: 1, user: 'Rahul', action: 'Uploaded Passport', target: 'Amit Shah', time: '2 mins ago' },
        { id: 2, user: 'Priya', action: 'Created Application', target: 'Canada Student Visa', time: '1 hour ago' },
        { id: 3, user: 'Rahul', action: 'Sent Reminder', target: 'Sara Smith', time: '3 hours ago' },
        { id: 4, user: 'System', action: 'Automated Check', target: 'Expiry Scan', time: '5 hours ago' },
        { id: 5, user: 'Admin', action: 'Updated Settings', target: 'Firm Profile', time: '1 day ago' },
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Activity Log</h1>
                    <p className="mt-2 text-base text-gray-600">Audit trail of all actions within the firm.</p>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/5 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Activity className="h-5 w-5 text-gray-500" />
                            All Activities
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">Last 30 days</span>
                    </div>
                </div>
                <div className="divide-y divide-gray-100">
                    {activities.map((activity) => (
                        <div key={activity.id} className="p-4 flex items-start hover:bg-gray-50 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 mr-4 shrink-0 border border-gray-200">
                                {activity.user[0]}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-gray-900">
                                    <span className="font-semibold">{activity.user}</span> {activity.action} <span className="font-semibold">{activity.target}</span>
                                </p>
                                <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    {activity.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
