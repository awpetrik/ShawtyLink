import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Link2, Mail, ArrowRight, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ForgotPasswordView() {
    const { api } = useAuth()
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('idle') // idle, loading, success, error
    const [message, setMessage] = useState('')
    const [showDevNote, setShowDevNote] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setStatus('loading')
        setMessage('')

        try {
            const res = await api.post('/auth/forgot-password', { email })
            // Check if backend reported SMTP as not configured
            if (res.data?.smtp_configured === false) {
                setShowDevNote(true)
            } else {
                setShowDevNote(false)
            }
            setStatus('success')
        } catch (err) {
            setStatus('error')
            setMessage(err.response?.data?.detail || "Something went wrong. Please try again.")
        }
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
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Forgot Password?</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Enter your email and we'll send you a reset link.
                    </p>
                </div>

                {status === 'success' ? (
                    <div className="text-center space-y-6 animate-fade-in">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 mx-auto">
                            <CheckCircle2 size={32} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Check your email</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                We've sent a password reset link to <span className="font-medium text-gray-800 dark:text-gray-200">{email}</span>.
                            </p>
                        </div>

                        {showDevNote && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-xs text-blue-600 dark:text-blue-400 text-left">
                                <strong>Note for Dev:</strong> Since SMTP isn't configured, check the <code>docker logs backend</code> to find the reset token link.
                            </div>
                        )}

                        <Link to="/login" className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2">
                            <ArrowLeft size={18} />
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {status === 'error' && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {message}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="input-field pl-10"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
                        >
                            {status === 'loading' && <Loader2 size={18} className="animate-spin" />}
                            {status === 'loading' ? 'Sending Link...' : 'Send Reset Link'}
                            {!status === 'loading' && <ArrowRight size={18} />}
                        </button>
                    </form>
                )}

                {status !== 'success' && (
                    <div className="mt-8 text-center">
                        <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center gap-2">
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
