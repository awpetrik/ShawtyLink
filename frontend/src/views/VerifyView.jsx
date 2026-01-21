import { useState } from 'react'

export default function VerifyView({ shortCode }) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

    const handleUnlock = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('http://localhost:8000/unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ short_code: shortCode, password })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.detail || 'Unlock failed')
            }

            // Redirect to original
            window.location.href = data.original_url
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="container">
            <h1>Protected Link</h1>
            <p className="subtitle">This link is password protected.</p>

            <form onSubmit={handleUnlock} className="input-group">
                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Unlock</button>
            </form>

            {error && <div className="error-msg">{error}</div>}
        </div>
    )
}
