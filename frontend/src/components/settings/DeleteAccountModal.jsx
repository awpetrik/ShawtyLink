import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Trash2, Loader2, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

export default function DeleteAccountModal({ isOpen, onClose }) {
    const { api, logout } = useAuth()
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleDelete = async (e) => {
        e.preventDefault()
        if (!password) return

        setLoading(true)
        setError(null)

        try {
            await api.delete('/users/me', {
                data: { password } // Send payload in data for DELETE
            })
            // Success
            onClose()
            logout() // Logout and redirect
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to delete account")
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl border border-red-100 dark:border-red-900/30 pointer-events-auto overflow-hidden"
                        >
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-800 bg-red-50/50 dark:bg-red-900/10 flex items-center gap-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600 dark:text-red-400 shrink-0">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Delete Account</h2>
                                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">This action cannot be undone.</p>
                                </div>
                            </div>

                            <form onSubmit={handleDelete} className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                        Are you sure you want to permanently delete your account? All your links, analytics data, and personal information will be wiped immediately.
                                    </p>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Confirm Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="password"
                                                required
                                                placeholder="Enter your password to confirm"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="input-field pl-10 border-red-200 focus:border-red-500 focus:ring-red-500/20"
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                                        <AlertTriangle size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={loading}
                                        className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !password}
                                        className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                        {loading ? 'Deleting...' : 'Delete Forever'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
