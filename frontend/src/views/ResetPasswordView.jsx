import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Link2, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ResetPasswordView() {
    const { api } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [status, setStatus] = useState('idle') // idle, loading, success, error
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setMessage("Invalid or missing reset token.")
        }
    }, [token])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setStatus('error')
            setMessage("Passwords do not match")
            return
        }

        setStatus('loading')
        setMessage('')

        try {
            await api.post('/auth/reset-password', { token, new_password: password })
            setStatus('success')
            setTimeout(() => {
                navigate('/login?message=Password reset successfully. Please login.')
            }, 2000)
        } catch (err) {
            setStatus('error')
            setMessage(err.response?.data?.detail || "Failed to reset password. Token might be expired.")
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-zinc-900 text-center">
                <div>
                    <h2 className="text-xl font-bold text-red-500 mb-2">Invalid Link</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">This password reset link is invalid or has expired.</p>
                    <Link to="/forgot-password" className="btn-primary px-6 py-2 rounded-lg">Request New Link</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-zinc-900">
            <Link to="/" className="mb-8 flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                    <Link2 size={24} className="rotate-45" />
                </div>
                <span className="font-bold text-2xl tracking-tight text-gray-900 dark:text-white">ShawtyLink</span>
            </Link>

            <div className="w-full max-w-md bg-white dark:bg-zinc-800 rounded-3xl border border-gray-100 dark:border-zinc-700 shadow-xl shadow-gray-200/50 dark:shadow-black/20 p-8 sm:p-10 transition-all">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Set New Password</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Choose a strong password for your account.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 flex items-center gap-3 text-sm text-green-700 dark:text-green-400">
                        <CheckCircle2 size={18} className="shrink-0" />
                        Password updated! Redirecting to login...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {status === 'error' && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {message}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pl-10"
                                    autoFocus
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
                                    placeholder="••••••••"
                                    className="input-field pl-10"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 mt-2"
                        >
                            {status === 'loading' && <Loader2 size={18} className="animate-spin" />}
                            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
