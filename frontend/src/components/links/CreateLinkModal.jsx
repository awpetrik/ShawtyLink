import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Link2, Settings, Copy, Check, AlertCircle, Loader2, Sparkles, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

export default function CreateLinkModal({ isOpen, onClose }) {
    const { api } = useAuth()
    const [url, setUrl] = useState('')
    const [customAlias, setCustomAlias] = useState('')
    const [password, setPassword] = useState('')
    const [aliasAvailable, setAliasAvailable] = useState(null)
    const [showOptions, setShowOptions] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [result, setResult] = useState(null)
    const [copied, setCopied] = useState(false)

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setUrl('')
            setCustomAlias('')
            setPassword('')
            setAliasAvailable(null)
            setShowOptions(false)
            setResult(null)
            setError(null)
        }
    }, [isOpen])

    // Check alias availability
    useEffect(() => {
        if (!customAlias) {
            setAliasAvailable(null)
            return
        }
        const checkDelay = setTimeout(() => {
            api.get(`/check/${customAlias}`)
                .then(res => setAliasAvailable(res.data.available))
                .catch(() => setAliasAvailable(null))
        }, 500)
        return () => clearTimeout(checkDelay)
    }, [customAlias, api])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!url) return

        if (customAlias && aliasAvailable === false) {
            setError("Custom alias is already taken")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const payload = {
                original_url: url,
                custom_alias: customAlias || null,
                password: password || null
            }

            const res = await api.post('/shorten_auth', payload)
            const shortCode = res.data.short_code
            setResult(`${window.location.origin}/${shortCode}`)
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to create link")
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        if (result) {
            navigator.clipboard.writeText(result)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

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
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 pointer-events-auto overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-800/20">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                        <Link2 size={18} />
                                    </div>
                                    Create New Link
                                </h2>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-gray-500">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto">
                                {!result ? (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Destination URL</label>
                                            <input
                                                type="url"
                                                required
                                                placeholder="https://example.com/long-url"
                                                value={url}
                                                onChange={e => setUrl(e.target.value)}
                                                className="input-field text-lg py-3"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Alias (Optional)</label>
                                                {customAlias && (
                                                    <span className={clsx(
                                                        "text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1",
                                                        aliasAvailable ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                            aliasAvailable === false ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                                                                "bg-gray-100 text-gray-600 dark:bg-gray-800 decoration-gray-400"
                                                    )}>
                                                        {aliasAvailable === null ? <Loader2 size={10} className="animate-spin" /> :
                                                            aliasAvailable ? <Check size={10} /> : <AlertCircle size={10} />}
                                                        {aliasAvailable === null ? "Checking" : aliasAvailable ? "Available" : "Taken"}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="relative flex items-center">
                                                <span className="absolute left-4 text-gray-400 text-sm font-medium">shawty.link/</span>
                                                <input
                                                    type="text"
                                                    placeholder="my-link"
                                                    value={customAlias}
                                                    onChange={e => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                                                    className="input-field pl-24 font-mono text-sm"
                                                    maxLength={20}
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setShowOptions(!showOptions)}
                                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors"
                                            >
                                                <Settings size={16} />
                                                {showOptions ? 'Hide Options' : 'More Options'}
                                            </button>

                                            <AnimatePresence>
                                                {showOptions && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="pt-4 space-y-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                                                    <Lock size={12} /> Password Protection (Optional)
                                                                </label>
                                                                <input
                                                                    type="password"
                                                                    placeholder="Set a password..."
                                                                    value={password}
                                                                    onChange={e => setPassword(e.target.value)}
                                                                    className="input-field py-2 text-sm"
                                                                />
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="space-y-1.5">
                                                                    <label className="text-xs font-medium text-gray-500">Max Clicks</label>
                                                                    <input type="number" placeholder="Unlimited" className="input-field py-2 text-sm" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-xs font-medium text-gray-500">Expiration</label>
                                                                    <input type="date" className="input-field py-2 text-sm" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {error && (
                                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                                                <AlertCircle size={16} />
                                                {error}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="btn-primary w-full py-3 text-lg font-semibold shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                        >
                                            {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                                            {loading ? 'Shortening...' : 'Shorten URL'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center py-4">
                                        <div className="w-16 h-16 bg-gradient-to-tr from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-green-500/30">
                                            <Check size={32} strokeWidth={3} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Link Created!</h3>
                                        <p className="text-gray-500 mb-6">Your new short link is ready to share.</p>

                                        <div className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 flex items-center gap-3 mb-6">
                                            <div className="flex-1 text-left font-mono font-medium text-gray-900 dark:text-white truncate">
                                                {result}
                                            </div>
                                            <button
                                                onClick={handleCopy}
                                                className={clsx(
                                                    "p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium",
                                                    copied ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-white dark:bg-zinc-700 shadow-sm hover:bg-gray-50 text-gray-700 dark:text-gray-200"
                                                )}
                                            >
                                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                                {copied ? "Copied" : "Copy"}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => {
                                                    setResult(null)
                                                    setUrl('')
                                                    onClose()
                                                    window.location.reload()
                                                }}
                                                className="py-2.5 px-4 rounded-xl border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors font-medium"
                                            >
                                                Close
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setResult(null)
                                                    setUrl('')
                                                }}
                                                className="py-2.5 px-4 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/20"
                                            >
                                                Create Another
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
