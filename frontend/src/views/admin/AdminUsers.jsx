import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, MoreVertical, CheckCircle, XCircle, Shield, ShieldOff, User, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { AddUserModal, EditUserModal, DeleteUserModal } from '../../components/admin/UserModals';

const AdminUsers = () => {
    const { api } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Interaction State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [api]);

    const handleCreateUser = async (userData) => {
        setActionLoading(true);
        try {
            await api.post('/admin/users', userData);
            await fetchUsers();
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Failed to create user", error);
            alert("Failed to create user: " + (error.response?.data?.detail || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleUpdateUser = async (userId, updateData) => {
        setActionLoading(true);
        try {
            await api.patch(`/admin/users/${userId}`, updateData);
            await fetchUsers();
            setEditingUser(null);
        } catch (error) {
            console.error("Failed to update user", error);
            alert("Failed to update user: " + (error.response?.data?.detail || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        setActionLoading(true);
        try {
            await api.delete(`/admin/users/${userId}`);
            await fetchUsers();
            setDeletingUser(null);
        } catch (error) {
            console.error("Failed to delete user", error);
            alert("Failed to delete user: " + (error.response?.data?.detail || error.message));
        } finally {
            setActionLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) return (
        <div className="space-y-6">
            <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            <div className="h-96 bg-gray-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
        </div>
    );

    return (
        <div className="space-y-6">
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleCreateUser}
                isLoading={actionLoading}
            />

            <EditUserModal
                isOpen={!!editingUser}
                onClose={() => setEditingUser(null)}
                user={editingUser}
                onSubmit={handleUpdateUser}
                isLoading={actionLoading}
            />

            <DeleteUserModal
                isOpen={!!deletingUser}
                onClose={() => setDeletingUser(null)}
                user={deletingUser}
                onSubmit={handleDeleteUser}
                isLoading={actionLoading}
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">User Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">View and manage all registered users.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 w-full md:w-64 shadow-sm transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors shadow-sm shadow-blue-500/20"
                    >
                        <UserPlus size={18} />
                        <span className="hidden sm:inline">Add User</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-3xl overflow-hidden shadow-sm">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-zinc-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-zinc-700">
                                <th className="p-6">User</th>
                                <th className="p-6">Status</th>
                                <th className="p-6">Role</th>
                                <th className="p-6">Joined</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-700/50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-zinc-700/20 transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
                                                {user.email[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white">{user.full_name || 'No Name'}</div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        {user.is_active ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/20">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        {user.is_superuser ? (
                                            <span className="inline-flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium text-sm">
                                                <Shield className="w-4 h-4 fill-purple-100 dark:fill-purple-900/40" /> Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                                                <User className="w-4 h-4" /> User
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-6 text-gray-500 dark:text-gray-400 text-sm">
                                        {formatDate(user.created_at)}
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => setEditingUser(user)}
                                                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingUser(user)}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4 p-4">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="bg-gray-50 dark:bg-zinc-900/50 rounded-xl p-4 border border-gray-100 dark:border-zinc-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-500/20">
                                        {user.email[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">{user.full_name || 'No Name'}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setEditingUser(user)}
                                        className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors border border-transparent hover:border-gray-200 dark:hover:border-zinc-600"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeletingUser(user)}
                                        className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-zinc-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-200 dark:border-zinc-700 pt-4">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Status</p>
                                    {user.is_active ? (
                                        <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-red-600 dark:text-red-400 font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Inactive
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Role</p>
                                    {user.is_superuser ? (
                                        <span className="inline-flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium">
                                            <Shield className="w-3 h-3" /> Admin
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium">
                                            <User className="w-3 h-3" /> User
                                        </span>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Joined</p>
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {formatDate(user.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-gray-400">
                        <div className="mb-4 bg-gray-50 dark:bg-zinc-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <Search className="w-8 h-8 opacity-50" />
                        </div>
                        <h3 className="text-gray-900 dark:text-white font-medium mb-1">No users found</h3>
                        <p className="text-sm">We couldn't find any users matching "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;
