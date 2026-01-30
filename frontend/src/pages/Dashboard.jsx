import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { BarChart3, Link as LinkIcon, Users, Calendar, TrendingUp, Github, Instagram, ExternalLink, Star, Coffee } from 'lucide-react'
import StatsCard from '../components/dashboard/StatsCard'
import RecentActivity from '../components/dashboard/RecentActivity'
import EmptyState from '../components/dashboard/EmptyState'
import CreateLinkModal from '../components/links/CreateLinkModal'
import EditLinkModal from '../components/links/EditLinkModal'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function Dashboard() {
    const { user, api } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editLink, setEditLink] = useState(null)
    const [currentTipIndex, setCurrentTipIndex] = useState(0)

    // Define Tip Cards
    const tipCards = [
        {
            badge: '☕',
            title: 'Donate',
            heading: 'Buy me a coffee ☕️',
            description: 'Enjoying ShawtyLink? Support the developer by buying a coffee via Saweria!',
            buttonText: 'Support on Saweria',
            buttonIcon: Coffee,
            buttonLink: 'https://saweria.co/CertifiedLunatics',
            isExternal: true
        },
        {
            badge: '💡',
            title: 'Pro Tip',
            heading: 'Boost your reach',
            description: 'Share your links on social media platforms for maximum engagement.',
            buttonText: 'View Analytics',
            buttonIcon: BarChart3,
            buttonLink: '/analytics',
            isExternal: false
        },
        {
            badge: '⭐',
            title: 'Support',
            heading: 'Star us on GitHub',
            description: 'Love ShawtyLink? Give us a star on GitHub to support the project and help us grow!',
            buttonText: 'Star Repository',
            buttonIcon: Star,
            buttonLink: 'https://github.com/awpetrik/ShawtyLink',
            isExternal: true
        }
    ]

    // Auto-rotate tips every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTipIndex((prev) => (prev + 1) % tipCards.length)
        }, 8000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const fetchStats = async () => {
            // Only fetch if editLink is null (to avoid double fetch on modal close if not needed, 
            // but actually we want to refresh stats after edit. So we can reuse this function)
            try {
                const res = await api.get('/dashboard/stats')
                setStats(res.data)
            } catch (err) {
                console.error("Failed to load stats", err)
            } finally {
                setLoading(false)
            }
        }
        if (!editLink && !isModalOpen) fetchStats()
        // Simple polling/refresh strategy could be better but sticking to ease
    }, [api, editLink, isModalOpen])

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
    const firstName = user?.full_name || user?.email?.split('@')[0] || 'User'

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 18) return 'Good afternoon'
        return 'Good evening'
    }

    return (
        <div className="space-y-8">
            <CreateLinkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
            <EditLinkModal isOpen={!!editLink} onClose={() => setEditLink(null)} link={editLink} onSuccess={() => setEditLink(null)} />


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
                            onClick={() => navigate('/analytics')}
                        />
                        <StatsCard
                            title="Active Links"
                            value={stats?.active_links || 0}
                            icon={LinkIcon}
                            change={5}
                            delay={0.1}
                            color="green"
                            onClick={() => navigate('/links')}
                        />
                        <StatsCard
                            title="Click Rate"
                            value={stats?.unique_visitors || 0}
                            icon={TrendingUp}
                            change={2.4}
                            delay={0.2}
                            color="purple"
                            onClick={() => navigate('/analytics')}
                        />
                        <StatsCard
                            title="Top Source"
                            value={stats?.avg_daily || "Direct"}
                            icon={Users}
                            delay={0.3}
                            color="orange"
                            onClick={() => navigate('/analytics')}
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
                            <RecentActivity
                                activities={stats?.recent_links}
                                onEdit={(link) => setEditLink(link)}
                            />
                        </motion.div>

                        {/* Sidebar (Pro Tip Slider) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none" />

                            <div className="relative z-10">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentTipIndex}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-white/20">
                                            <span>{tipCards[currentTipIndex].badge}</span> {tipCards[currentTipIndex].title}
                                        </div>

                                        <h3 className="font-bold text-xl mb-3 leading-snug">{tipCards[currentTipIndex].heading}</h3>
                                        <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                                            {tipCards[currentTipIndex].description}
                                        </p>

                                        {(() => {
                                            const ButtonIcon = tipCards[currentTipIndex].buttonIcon
                                            return tipCards[currentTipIndex].isExternal ? (
                                                <a
                                                    href={tipCards[currentTipIndex].buttonLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full bg-white text-blue-600 px-4 py-3 rounded-xl text-sm font-bold shadow-sm hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    {tipCards[currentTipIndex].buttonText}
                                                    <ButtonIcon size={16} />
                                                </a>
                                            ) : (
                                                <Link
                                                    to={tipCards[currentTipIndex].buttonLink}
                                                    className="w-full bg-white text-blue-600 px-4 py-3 rounded-xl text-sm font-bold shadow-sm hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    {tipCards[currentTipIndex].buttonText}
                                                    <ButtonIcon size={16} />
                                                </Link>
                                            )
                                        })()}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation Dots */}
                                <div className="flex gap-2 justify-center mt-6">
                                    {tipCards.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentTipIndex(index)}
                                            className={`h-2 rounded-full transition-all ${index === currentTipIndex
                                                ? 'w-8 bg-white'
                                                : 'w-2 bg-white/40 hover:bg-white/60'
                                                }`}
                                            aria-label={`Go to tip ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </div>
    )
}
