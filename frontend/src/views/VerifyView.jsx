import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function VerifyView() {
    const { token } = useParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState('verifying') // verifying, success, error
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!token) return

        const verify = async () => {
            try {
                const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
                await axios.get(`${API_BASE}/auth/verify/${token}`)

                setStatus('success')
                setTimeout(() => {
                    navigate('/login?message=Email verified! Please sign in.')
                }, 2000)
            } catch (err) {
                console.error(err)
                setStatus('error')
                setError(err.response?.data?.detail || "Verification failed. Link might be expired.")
            }
        }

        verify()
    }, [token, navigate])

    return (
        <div className="main-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="card" style={{ padding: '40px', maxWidth: '400px', textAlign: 'center' }}>
                {status === 'verifying' && (
                    <>
                        <div className="loading-spinner" style={{ margin: '0 auto 20px' }}></div>
                        <h3>Verifying Email...</h3>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <h3 style={{ color: 'var(--success-color)' }}>Verified!</h3>
                        <p>Your email has been successfully verified.</p>
                        <p style={{ fontSize: '0.9em', opacity: 0.7 }}>Redirecting to login...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h3 style={{ color: 'var(--danger-color)' }}>Verification Failed</h3>
                        <p className="error-msg">{error}</p>
                        <button onClick={() => navigate('/login')} style={{ marginTop: '20px' }}>
                            Back to Login
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
