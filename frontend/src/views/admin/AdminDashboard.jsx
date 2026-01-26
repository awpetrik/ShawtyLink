import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, Link as LinkIcon, MousePointerClick, Activity } from 'lucide-react';
import StatsCard from '../../components/dashboard/StatsCard';

const AdminDashboard = () => {
    const { api, user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        total_users: 0,
        total_urls: 0,
        total_clicks: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [api]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const firstName = user?.full_name?.split(' ')[0] || 'Admin';

    const handleDownloadReport = async () => {
        try {
            const response = await api.get('/admin/reports/csv', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `shawty_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download report", error);
            alert("Failed to download report");
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="h-10 w-64 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-40 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {getGreeting()}, <span className="text-blue-600 dark:text-blue-400 capitalize">{firstName}</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Here's what's happening across the platform today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDownloadReport}
                        className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                    >
                        <Activity size={16} />
                        Download Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatsCard
                    title="Total Users"
                    value={stats.total_users}
                    icon={Users}
                    color="blue"
                    delay={0}
                    change={0}
                    onClick={() => navigate('/admin/users')}
                />
                <StatsCard
                    title="Total Links"
                    value={stats.total_urls}
                    icon={LinkIcon}
                    color="purple"
                    delay={0.1}
                    change={0}
                    onClick={() => alert("Global Link Management is coming soon! For now, use the CSV Report to view all links.")}
                />
                <StatsCard
                    title="Total Clicks"
                    value={stats.total_clicks}
                    icon={MousePointerClick}
                    color="orange"
                    delay={0.2}
                    change={0}
                    onClick={() => alert("Global Click Analytics is coming soon!")}
                />
            </div>

            {/* Placeholder for Recent Activity Chart or Table */}
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-8 border border-gray-100 dark:border-zinc-700 shadow-sm min-h-[400px] flex items-center justify-center text-gray-500 flex-col">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4">System Activity</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mt-2">
                    Advanced analytics chart will be available in the next update.
                </p>
            </div>
        </div>
    );
};

export default AdminDashboard;
