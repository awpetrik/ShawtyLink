import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Link2, ArrowRight, Check, Copy, Sparkles, Shield, BarChart3, Zap } from 'lucide-react'
import { useAuth, AUTH_STATUS } from '../context/AuthContext'
import clsx from 'clsx'
import Particles from '../components/ui/Particles'

export default function HomeView() {
    const { status, api } = useAuth()
    const navigate = useNavigate()
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [copied, setCopied] = useState(false)

    // Redirect to dashboard if logged in
    useEffect(() => {
        if (status === AUTH_STATUS.AUTHENTICATED) {
            navigate('/dashboard', { replace: true })
        }
    }, [status, navigate])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!url) return
        setLoading(true)
        setError(null)
        setResult(null)

        try {
            // Anonymous shorten
            const res = await api.post('/shorten', { original_url: url })
            const shortCode = res.data.short_code
            setResult(`${window.location.origin}/${shortCode}`)
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to shorten link")
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
        <div className="min-h-screen bg-white dark:bg-black selection:bg-blue-500/30 relative overflow-hidden">
            {/* Particles Background */}
            {/* OGL Particles Background */}
            <div className="absolute inset-0 pointer-events-none dark:invert-0 invert opacity-60 dark:opacity-100">
                <Particles
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    particleCount={200}
                    particleSpread={10}
                    speed={0.05}
                    particleColors={['#ffffff', '#ffffff']}
                    moveParticlesOnHover={true}
                    particleHoverFactor={0.5}
                    alphaParticles={false}
                    particleBaseSize={100}
                    sizeRandomness={1}
                    cameraDistance={20}
                    disableRotation={false}
                />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-gray-100 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                            <Link2 size={20} className="rotate-45" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">ShawtyLink</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            Sign In
                        </Link>
                        <Link to="/register" className="btn-primary text-sm px-4 py-2 rounded-full shadow-lg shadow-blue-500/20">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-16 px-6">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                        <Sparkles size={14} />
                        <span>The most powerful URL shortener</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight">
                        Make your links <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">shorter & smarter.</span>
                    </h1>

                    <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Transform long, ugly links into short, memorable ones. Track clicks, analyze data, and manage everything in one dashboard.
                    </p>

                    {/* Shortener Box */}
                    <div className="max-w-2xl mx-auto mt-12 relative">

                        <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-2 pl-4 flex flex-col md:flex-row items-center gap-2">
                            <input
                                type="url"
                                required
                                placeholder="Paste your long link here..."
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder:text-gray-400 h-12 text-lg"
                            />
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full md:w-auto h-12 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                {loading ? 'Shortening...' : 'Shorten Now'}
                                {!loading && <ArrowRight size={18} />}
                            </button>

                        </div>

                        {/* Upsell Helper Text */}
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-3 animate-fade-in">
                            <span className="inline-flex items-center gap-1">
                                <Sparkles size={12} className="text-yellow-500" />
                                <span>Want a custom alias (e.g. <strong>shawty.link/your-brand</strong>)?</span>
                                <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium ml-1">
                                    Create free account
                                </Link>
                            </span>
                        </div>

                        {/* Result */}
                        {result && (
                            <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 flex items-center justify-between text-left animate-fade-in">
                                <div className="truncate pr-4">
                                    <p className="text-xs text-green-800 dark:text-green-300 font-medium mb-1">Success! Your link is ready:</p>
                                    <p className="text-green-700 dark:text-green-400 font-mono font-bold truncate">{result}</p>
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className={clsx(
                                        "px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-bold shrink-0 shadow-md",
                                        copied
                                            ? "bg-green-500 hover:bg-green-600 text-white scale-105"
                                            : "bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-700 ring-1 ring-gray-200 dark:ring-zinc-700"
                                    )}
                                >
                                    {copied ? <Check size={18} className="animate-bounce" /> : <Copy size={18} />}
                                    {copied ? "Copied!" : "Copy Link"}
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-left">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {/* Features Grid */}
                <div className="max-w-7xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-3xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-blue-500/30 transition-colors group">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                            <Zap size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Lightning Fast</h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                            Our global edge network ensures your redirects happen in milliseconds, providing the best experience for your users.
                        </p>
                    </div>
                    <div className="p-8 rounded-3xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-purple-500/30 transition-colors group">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                            <BarChart3 size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Detailed Analytics</h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                            Gain insights into your audience with real-time click tracking, geographic data, and referrers.
                        </p>
                    </div>
                    <div className="p-8 rounded-3xl bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-green-500/30 transition-colors group">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
                            <Shield size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Secure & Reliable</h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                            Enterprise-grade security with HTTPS encryption and spam protection to keep your links safe.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-12 border-t border-gray-100 dark:border-zinc-900 text-center">
                <div className="space-y-2">
                    <p className="text-gray-500 dark:text-gray-500 text-sm">
                        © {new Date().getFullYear()} Certified Lunatics.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-600 font-medium tracking-wide uppercase">
                        A Part of Rivaldi's Network
                    </p>
                </div>
            </footer>
        </div>
    )
}
