import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, Loader2, ShieldAlert, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'

export default function UnlockLinkView() {
    const { shortCode } = useParams()
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Using raw axios instead of useAuth because this is a public page
    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    })

    const handleUnlock = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await api.post(`/unlock/${shortCode}`, { password })
            // Success - Redirect
            window.location.href = res.data.original_url
        } catch (err) {
            setError(err.response?.data?.detail || "Incorrect password")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-8 text-center">
                    <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock size={32} />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Link Protected
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        This link is password protected. Please enter the password to continue.
                    </p>

                    <form onSubmit={handleUnlock} className="space-y-4">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter password"
                                className="w-full px-4 py-3 pr-12 rounded-xl bg-white dark:bg-zinc-800 border-2 border-gray-300 dark:border-zinc-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all text-center text-lg tracking-widest text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center justify-center gap-2"
                            >
                                <ShieldAlert size={16} />
                                {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <div className="flex items-center gap-2">Unlock Link <ArrowRight size={18} /></div>}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-zinc-800">
                        <p className="text-xs text-gray-400">
                            Protected by ShawtyLink Security
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
