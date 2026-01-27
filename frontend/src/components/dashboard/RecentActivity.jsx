import { useState } from 'react'
import { Link2, Clock, MapPin, Copy, Check, Edit2 } from 'lucide-react'
import clsx from 'clsx'

import { useToast } from '../../context/ToastContext'

export default function RecentActivity({ activities, onEdit }) {
    const { addToast } = useToast()
    const [copiedId, setCopiedId] = useState(null)

    const handleCopy = (shortCode) => {
        const url = `${window.location.origin}/${shortCode}`
        navigator.clipboard.writeText(url)
        setCopiedId(shortCode)
        addToast("Link copied to clipboard!")
        setTimeout(() => setCopiedId(null), 2000)
    }

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

                    <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => handleCopy(activity.short_code)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Copy Link"
                        >
                            {copiedId === activity.short_code ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                        {onEdit && (
                            <button
                                onClick={() => onEdit(activity)}
                                className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700/50 rounded-lg transition-colors"
                                title="Edit Link"
                            >
                                <Edit2 size={16} />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
