import { useState, useEffect } from 'react'
import { X, Save, Loader2, Link as LinkIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function EditLinkModal({ isOpen, onClose, link, onSuccess }) {
    const { api } = useAuth()
    const [originalUrl, setOriginalUrl] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (link) {
            setOriginalUrl(link.original_url)
            setIsActive(link.is_active)
        }
    }, [link])

    if (!isOpen || !link) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await api.put(`/urls/${link.short_code}`, {
                original_url: originalUrl,
                is_active: isActive
            })
            onSuccess()
            onClose()
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to update link")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Link</h3>
                    <p className="text-sm text-gray-500">Update destination or status</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target URL</label>
                        <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="url"
                                required
                                value={originalUrl}
                                onChange={e => setOriginalUrl(e.target.value)}
                                className="input-field pl-9"
                                placeholder="https://example.com"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-zinc-700/50">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Link Active</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={e => setIsActive(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-200 dark:border-zinc-600 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn-primary flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
