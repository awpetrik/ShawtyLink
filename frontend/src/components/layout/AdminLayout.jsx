import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet, Link } from 'react-router-dom';
import Navbar from './Navbar';

const AdminLayout = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">Loading...</div>;
    }

    if (!user || !user.is_superuser) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-500/30">
            <Navbar /> {/* Reuse existing Navbar or create specific one */}
            <div className="flex pt-16">
                {/* Admin Sidebar */}
                <aside className="w-64 hidden lg:block border-r border-gray-200 dark:border-zinc-800 min-h-[calc(100vh-64px)] p-6 bg-white dark:bg-zinc-900/50 backdrop-blur-sm fixed top-16 bottom-0 overflow-y-auto">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent px-2">Admin Panel</h2>
                    </div>
                    <nav className="space-y-2">
                        <Link to="/admin" className="block px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white font-medium">
                            Dashboard
                        </Link>
                        <Link to="/admin/users" className="block px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-white font-medium">
                            User Management
                        </Link>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-12 lg:ml-64">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
