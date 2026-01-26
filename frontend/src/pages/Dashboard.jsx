import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { BarChart3, Link as LinkIcon, Users, Calendar, TrendingUp } from 'lucide-react'
import StatsCard from '../components/dashboard/StatsCard'
import RecentActivity from '../components/dashboard/RecentActivity'
import EmptyState from '../components/dashboard/EmptyState'
import CreateLinkModal from '../components/links/CreateLinkModal'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function Dashboard() {
    const { user, api } = useAuth()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/dashboard/stats')
                setStats(res.data)
            } catch (err) {
                console.error("Failed to load stats", err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [api])

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="h-10 w-64 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-40 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    // Determine state
    const hasLinks = stats?.active_links > 0 || stats?.total_clicks > 0
    const firstName = user?.email?.split('@')[0] || 'User'

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 18) return 'Good afternoon'
        return 'Good evening'
    }

    return (
        <div className="space-y-8">
            <CreateLinkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {getGreeting()}, <span className="text-blue-600 dark:text-blue-400 capitalize">{firstName}</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        {hasLinks
                            ? "Here's what's happening with your links today."
                            : "Let's get your first link set up and running."}
                    </p>
                </div>

                {hasLinks && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn-primary flex items-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        <LinkIcon size={18} />
                        New Link
                    </button>
                )}
            </div>

            {!hasLinks ? (
                <EmptyState onCreateClick={() => setIsModalOpen(true)} />
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatsCard
                            title="Total Clicks"
                            value={stats?.total_clicks || 0}
                            icon={BarChart3}
                            change={12}
                            delay={0}
                            color="blue"
                        />
                        <StatsCard
                            title="Active Links"
                            value={stats?.active_links || 0}
                            icon={LinkIcon}
                            change={5}
                            delay={0.1}
                            color="green"
                        />
                        <StatsCard
                            title="Click Rate"
                            value={stats?.unique_visitors || 0}
                            icon={TrendingUp}
                            change={2.4}
                            delay={0.2}
                            color="purple"
                        />
                        <StatsCard
                            title="Top Source"
                            value={stats?.avg_daily || "Direct"}
                            icon={Users}
                            delay={0.3}
                            color="orange"
                        />
                    </div>

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content (Recent Activity) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-3xl p-6 border border-gray-100 dark:border-zinc-700 shadow-sm"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
                                <Link to="/links" className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                    View All
                                </Link>
                            </div>
                            <RecentActivity activities={stats?.recent_links} />
                        </motion.div>

                        {/* Sidebar (Pro Tip) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none" />

                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-white/20">
                                    <span>💡</span> Pro Tip
                                </div>

                                <h3 className="font-bold text-xl mb-3 leading-snug">Boost your reach</h3>
                                <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                                    Share your links on social media platforms between 9AM - 11AM on Tuesdays for maximum engagement.
                                </p>

                                <Link to="/analytics" className="w-full bg-white text-blue-600 px-4 py-3 rounded-xl text-sm font-bold shadow-sm hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                                    View Analytics
                                    <BarChart3 size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    )
}
