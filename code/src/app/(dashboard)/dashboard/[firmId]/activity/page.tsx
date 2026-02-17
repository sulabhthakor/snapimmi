import { Activity, Clock, Filter, Upload, FileText, Settings, Bell, Zap } from 'lucide-react';

export default function ActivityPage() {
    // Placeholder data
    const activities = [
        { id: 1, user: 'Rahul', action: 'Uploaded Passport', target: 'Amit Shah', time: '2 mins ago', type: 'upload' },
        { id: 2, user: 'Priya', action: 'Created Application', target: 'Canada Student Visa', time: '1 hour ago', type: 'create' },
        { id: 3, user: 'Rahul', action: 'Sent Reminder', target: 'Sara Smith', time: '3 hours ago', type: 'notification' },
        { id: 4, user: 'System', action: 'Automated Check', target: 'Expiry Scan', time: '5 hours ago', type: 'system' },
        { id: 5, user: 'Admin', action: 'Updated Settings', target: 'Firm Profile', time: '1 day ago', type: 'settings' },
    ];

    const getTypeStyle = (type: string) => {
        switch (type) {
            case 'upload': return { bg: 'bg-blue-50', dot: 'bg-blue-500', icon: Upload };
            case 'create': return { bg: 'bg-emerald-50', dot: 'bg-emerald-500', icon: FileText };
            case 'notification': return { bg: 'bg-amber-50', dot: 'bg-amber-500', icon: Bell };
            case 'system': return { bg: 'bg-purple-50', dot: 'bg-purple-500', icon: Zap };
            case 'settings': return { bg: 'bg-gray-100', dot: 'bg-gray-500', icon: Settings };
            default: return { bg: 'bg-gray-50', dot: 'bg-gray-400', icon: Activity };
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Activity Log</h1>
                    <p className="mt-1 text-sm sm:text-base text-gray-500">Audit trail of all actions within your firm.</p>
                </div>
            </div>

            {/* Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button className="px-4 py-2 rounded-full text-xs font-semibold bg-gray-900 text-white shadow-sm transition-all">All</button>
                <button className="px-4 py-2 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">Uploads</button>
                <button className="px-4 py-2 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">Applications</button>
                <button className="px-4 py-2 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">System</button>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2.5">
                            <div className="p-1.5 bg-gray-100 rounded-lg">
                                <Activity className="h-4 w-4 text-gray-600" />
                            </div>
                            All Activities
                        </h3>
                        <span className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full font-medium">Last 30 days</span>
                    </div>
                </div>
                <div className="divide-y divide-gray-50">
                    {activities.map((activity, idx) => {
                        const style = getTypeStyle(activity.type);
                        const TypeIcon = style.icon;
                        return (
                            <div key={activity.id} className="p-4 sm:px-6 flex items-start hover:bg-gray-50/60 transition-colors group">
                                {/* Timeline dot & connector */}
                                <div className="flex flex-col items-center mr-4 shrink-0">
                                    <div className={`h-10 w-10 rounded-xl ${style.bg} flex items-center justify-center border border-gray-100 shadow-sm`}>
                                        <TypeIcon className={`h-4 w-4 ${style.dot.replace('bg-', 'text-')}`} />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-semibold text-gray-900">{activity.user}</span>{' '}
                                        {activity.action}{' '}
                                        <span className="font-medium text-gray-900">{activity.target}</span>
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
                                        <Clock className="h-3 w-3" />
                                        {activity.time}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {activities.length === 0 && (
                    <div className="p-12 text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-gray-50 rounded-full mb-3">
                            <Activity className="h-6 w-6 text-gray-300" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">No activity yet</p>
                        <p className="text-xs text-gray-400 mt-1">Actions will appear here as they happen</p>
                    </div>
                )}
            </div>
        </div>
    );
}
