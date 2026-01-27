import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
    User, Mail, Lock, Shield, Bell, Moon, Sun, Smartphone,
    Trash2, Download, LogOut, Check, Monitor, LayoutGrid, Globe
} from 'lucide-react'
import clsx from 'clsx'
import DeleteAccountModal from '../components/settings/DeleteAccountModal'

export default function Settings() {
    const { user, api, logout } = useAuth()
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    // Form State
    const [profile, setProfile] = useState({
        full_name: '',
        email: '',
        bio: '',
        // Password change fields
        current_password: '',
        new_password: '',
        confirm_password: ''
    })

    useEffect(() => {
        if (user) {
            setProfile(prev => ({
                ...prev,
                full_name: user.full_name || user.email?.split('@')[0], // Fallback display name
                email: user.email || '',
                bio: user.bio || ''
            }))
        }
    }, [user])

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMsg(null)

        try {
            const payload = {
                full_name: profile.full_name,
                email: profile.email,
                bio: profile.bio
            }

            // Password change logic
            if (profile.new_password) {
                if (profile.new_password !== profile.confirm_password) {
                    throw new Error("New passwords do not match")
                }
                payload.password = profile.new_password
                payload.current_password = profile.current_password
            }

            await api.put('/users/update', payload)
            // Ideally re-fetch user or update context
            window.location.reload() // Simple reload to refresh context
            setMsg({ type: 'success', text: 'Profile updated successfully!' })
        } catch (err) {
            setMsg({ type: 'error', text: err.response?.data?.detail || err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-24">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage your account and preferences</p>
            </div>

            {/* 1. Account & Profile */}
            <section className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <User size={20} />
                    Profile & Account
                </h2>
                <div className="card p-8 space-y-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-sm">
                    {/* Compact Profile Header */}
                    <div className="flex items-center gap-6 pb-8 border-b border-gray-100 dark:border-zinc-800">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-blue-500/20">
                            {profile.email[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.full_name}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
                            <div className="flex gap-4 mt-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                                <span>Free Plan</span>
                                <span>•</span>
                                <span>Member since 2026</span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
                                <input
                                    type="text"
                                    value={profile.full_name}
                                    onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                <input
                                    type="email"
                                    value={profile.email}
                                    onChange={e => setProfile({ ...profile, email: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                            <textarea
                                rows="3"
                                value={profile.bio}
                                onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                className="input-field resize-none"
                                placeholder="Tell us a bit about yourself..."
                            />
                        </div>

                        {/* Password Section */}
                        <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 space-y-6">
                            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                <Lock size={16} /> Change Password
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    value={profile.current_password}
                                    onChange={e => setProfile({ ...profile, current_password: e.target.value })}
                                    className="input-field text-sm"
                                />
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={profile.new_password}
                                    onChange={e => setProfile({ ...profile, new_password: e.target.value })}
                                    className="input-field text-sm"
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm New"
                                    value={profile.confirm_password}
                                    onChange={e => setProfile({ ...profile, confirm_password: e.target.value })}
                                    className="input-field text-sm"
                                />
                            </div>
                        </div>

                        {msg && (
                            <div className={clsx("p-3 rounded-lg text-sm", msg.type === 'error' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600")}>
                                {msg.text}
                            </div>
                        )}

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* 2. Link Preferences (Visual Only / LocalStorage potentially) */}
            <section className="space-y-6 opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Globe size={20} />
                    Link Preferences (Coming Soon)
                </h2>
                <div className="card p-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Domain</label>
                            <select disabled className="input-field bg-gray-50 dark:bg-zinc-800 opacity-60">
                                <option>{window.location.host}</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Expiration</label>
                            <select disabled className="input-field bg-gray-50 dark:bg-zinc-800 opacity-60">
                                <option>Never</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Danger Zone */}
            <section className="space-y-6">
                <h2 className="text-xl font-semibold text-red-600 flex items-center gap-2">
                    <Shield size={20} />
                    Danger Zone
                </h2>
                <div className="card p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-3xl space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Export Data</h3>
                            <p className="text-sm text-gray-500">Download all your links and analytics as JSON.</p>
                        </div>
                        <button className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-700 text-sm font-medium transition-colors flex items-center gap-2">
                            <Download size={16} />
                            Export
                        </button>
                    </div>
                    <div className="border-t border-red-200 dark:border-red-900/30 pt-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-red-600">Delete Account</h3>
                            <p className="text-sm text-gray-500">Permanently remove your account and all data.</p>
                        </div>
                        <button
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-red-500/20"
                        >
                            <Trash2 size={16} />
                            Delete Account
                        </button>
                    </div>
                </div>
            </section>

            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            />
        </div>
    )
}
