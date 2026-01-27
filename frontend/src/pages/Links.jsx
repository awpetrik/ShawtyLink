import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Search, Filter, MoreHorizontal, Link as LinkIcon, QrCode, Trash2, Edit2, ExternalLink, Copy, Check, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import CreateLinkModal from '../components/links/CreateLinkModal'
import EditLinkModal from '../components/links/EditLinkModal'
import QRModal from '../components/links/QRModal'
import clsx from 'clsx'

import { useToast } from '../context/ToastContext'

export default function Links() {
    const { api } = useAuth()
    const { addToast } = useToast()
    const [links, setLinks] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [copiedId, setCopiedId] = useState(null)

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [editLink, setEditLink] = useState(null)
    const [qrLink, setQrLink] = useState(null)

    // Deletion
    const [deleteLoading, setDeleteLoading] = useState(null)

    const fetchLinks = async () => {
        setLoading(true)
        try {
            // New Endpoint!
            const res = await api.get('/urls?limit=100')
            setLinks(res.data)
        } catch (err) {
            console.error("Failed to fetch links", err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLinks()
    }, [api])

    const handleCopy = (shortCode) => {
        const url = `${window.location.origin}/${shortCode}`
        navigator.clipboard.writeText(url)
        setCopiedId(shortCode)
        addToast("Link copied to clipboard!")
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleDelete = async (shortCode) => {
        if (!confirm("Are you sure you want to delete this link? This action cannot be undone.")) return

        setDeleteLoading(shortCode)
        try {
            await api.delete(`/urls/${shortCode}`)
            setLinks(links.filter(l => l.short_code !== shortCode))
        } catch (err) {
            alert("Failed to delete link")
        } finally {
            setDeleteLoading(null)
        }
    }

    const filteredLinks = links.filter(link =>
        link.short_code.toLowerCase().includes(search.toLowerCase()) ||
        link.original_url.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <CreateLinkModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSuccess={fetchLinks} />
            <EditLinkModal isOpen={!!editLink} onClose={() => setEditLink(null)} link={editLink} onSuccess={fetchLinks} />
            <QRModal isOpen={!!qrLink} onClose={() => setQrLink(null)} link={qrLink} />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Links</h1>
                    <p className="text-gray-500">Manage and track your shortened URLs.</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <LinkIcon size={18} />
                    New Link
                </button>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-gray-200 dark:border-zinc-700 flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by short code or URL..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
                <div className="text-sm text-gray-500 self-center hidden sm:block">
                    Showing {filteredLinks.length} links
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-gray-200 dark:border-zinc-700 overflow-hidden shadow-sm">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-200 dark:border-zinc-700">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Short Link</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Original URL</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Clicks</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-700">
                            {loading && links.length === 0 ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-gray-200 rounded w-8 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredLinks.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        {search ? "No links match your search" : "No links found. Create your first link!"}
                                    </td>
                                </tr>
                            ) : (
                                filteredLinks.map((link) => (
                                    <tr key={link.id} className="group hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={clsx("font-medium", link.is_active ? "text-blue-600 dark:text-blue-400" : "text-gray-400 line-through")}>
                                                    /{link.short_code}
                                                </span>
                                                <button
                                                    onClick={() => handleCopy(link.short_code)}
                                                    className="p-1 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded transition-colors"
                                                    title="Copy Link"
                                                >
                                                    {copiedId === link.short_code ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 max-w-xs">
                                                <img
                                                    src={`https://www.google.com/s2/favicons?domain=${new URL(link.original_url).hostname}`}
                                                    alt=""
                                                    className="w-4 h-4 opacity-70"
                                                    onError={(e) => { e.target.style.display = 'none' }}
                                                />
                                                <a
                                                    href={link.original_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="truncate text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:underline"
                                                >
                                                    {link.original_url}
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                                {link.clicks}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-gray-500">
                                            {new Date(link.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditLink(link)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setQrLink(link)}
                                                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    title="QR Code"
                                                >
                                                    <QrCode size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(link.short_code)}
                                                    disabled={deleteLoading === link.short_code}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    {deleteLoading === link.short_code ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden">
                    {loading && links.length === 0 ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="p-4 border-b border-gray-100 dark:border-zinc-700 animate-pulse">
                                <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/3 mb-2"></div>
                                <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-2/3"></div>
                            </div>
                        ))
                    ) : filteredLinks.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            {search ? "No links match your search" : "No links found. Create your first link!"}
                        </div>
                    ) : (
                        filteredLinks.map((link) => (
                            <div key={link.id} className="p-4 border-b border-gray-100 dark:border-zinc-700 last:border-0 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className={clsx("font-medium text-lg", link.is_active ? "text-blue-600 dark:text-blue-400" : "text-gray-400 line-through")}>
                                            /{link.short_code}
                                        </span>
                                        <button
                                            onClick={() => handleCopy(link.short_code)}
                                            className="p-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-500 rounded-lg hover:text-blue-600 transition-colors"
                                        >
                                            {copiedId === link.short_code ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setEditLink(link)}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => setQrLink(link)}
                                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                                        >
                                            <QrCode size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(link.short_code)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            {deleteLoading === link.short_code ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(link.original_url)
                                        setCopiedId(`orig-${link.id}`)
                                        addToast("Original URL copied!")
                                        setTimeout(() => setCopiedId(null), 2000)
                                    }}
                                    className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3 bg-white dark:bg-zinc-800/80 border border-gray-100 dark:border-zinc-700/50 px-3 py-2 rounded-full w-full shadow-sm cursor-pointer hover:border-blue-200 dark:hover:border-blue-800 transition-colors text-left"
                                >
                                    {copiedId === `orig-${link.id}` ? (
                                        <Check size={14} className="text-green-500 shrink-0" />
                                    ) : (
                                        <img
                                            src={`https://www.google.com/s2/favicons?domain=${new URL(link.original_url).hostname}`}
                                            alt=""
                                            className="w-3.5 h-3.5 opacity-70 shrink-0"
                                            onError={(e) => { e.target.style.display = 'none' }}
                                        />
                                    )}
                                    <span className="truncate flex-1 font-mono">
                                        {copiedId === `orig-${link.id}` ? "Copied to clipboard!" : link.original_url}
                                    </span>
                                </button>

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                                        <ExternalLink size={12} />
                                        {link.clicks} clicks
                                    </span>
                                    <span>
                                        {new Date(link.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
