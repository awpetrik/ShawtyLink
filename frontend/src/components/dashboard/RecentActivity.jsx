import { Link2, Clock, MapPin } from 'lucide-react'

export default function RecentActivity({ activities }) {
    if (!activities?.length) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No recent activity</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {activities.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-xl transition-colors group">
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 shrink-0">
                        <Link2 size={18} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {activity.short_code}
                            <span className="text-gray-400 font-normal mx-2">→</span>
                            <span className="text-gray-500 truncate">{activity.original_url}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {new Date(activity.created_at).toLocaleDateString()}
                            </span>
                            {activity.clicks > 0 && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    {activity.clicks} clicks
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
