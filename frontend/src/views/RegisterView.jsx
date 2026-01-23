import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Link2, Mail, Lock, Loader2, AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react'

export default function RegisterView() {
    const { register } = useAuth()
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters")
            setLoading(false)
            return
        }

        const res = await register(email, password)

        if (res.success) {
            if (res.needsVerify) {
                navigate(`/verify/pending?email=${encodeURIComponent(email)}`)
            } else {
                navigate('/login?registered=true')
            }
        } else {
            setError(res.error)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-zinc-900">
            <Link to="/" className="mb-8 flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                    <Link2 size={24} className="rotate-45" />
                </div>
                <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">Shawty Link</span>
            </Link>

            <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-3xl border border-gray-100 dark:border-zinc-700 shadow-xl shadow-gray-200/50 dark:shadow-black/20 p-8 sm:p-10 transition-all">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Create an account</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Start shortening your links properly</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 flex items-center gap-3 text-sm text-red-700 dark:text-red-400">
                        <AlertCircle size={18} className="shrink-0" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="input-field pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="at least 8 characters"
                                minLength={8}
                                className="input-field pl-10"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="repeat password"
                                className="input-field pl-10"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    © {new Date().getFullYear()} Certified Lunatics
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-600 font-medium tracking-wide uppercase mt-1">
                    A Part of Rivaldi's Network
                </p>
            </div>
        </div>
    )
}
