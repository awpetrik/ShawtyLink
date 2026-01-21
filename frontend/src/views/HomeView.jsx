import { useState, useEffect } from 'react'

// Components
const Toast = ({ message, onClose }) => (
    <div className="toast-notification">
        {message}
    </div>
)

const ThemeToggle = ({ theme, toggleTheme }) => (
    <button className="theme-toggle" onClick={toggleTheme} title="Toggle Theme">
        {theme === 'light' ? '🌙' : '☀️'}
    </button>
)

export default function HomeView() {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

    const [url, setUrl] = useState('')
    const [customAlias, setCustomAlias] = useState('')
    const [aliasAvailable, setAliasAvailable] = useState(null)

    // Advanced Options
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [password, setPassword] = useState('')
    const [expiresAt, setExpiresAt] = useState('')
    const [maxClicks, setMaxClicks] = useState('')

    const [shortUrl, setShortUrl] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [toast, setToast] = useState(null)
    const [theme, setTheme] = useState('dark')

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }

    useEffect(() => {
        if (!customAlias) {
            setAliasAvailable(null)
            return
        }
        const checkDelay = setTimeout(() => {
            fetch(`${API_BASE}/check/${customAlias}`)
                .then(res => res.json())
                .then(data => setAliasAvailable(data.available))
                .catch(() => setAliasAvailable(null))
        }, 500)
        return () => clearTimeout(checkDelay)
    }, [customAlias])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!url) return
        if (customAlias && aliasAvailable === false) {
            setError("Custom alias is already taken.")
            return
        }

        setLoading(true)
        setError(null)
        setShortUrl(null)

        try {
            const payload = {
                original_url: url,
                custom_alias: customAlias || null,
                password: password || null,
                expires_at: expiresAt || null,
                max_clicks: maxClicks ? parseInt(maxClicks) : null
            }


            const response = await fetch(`${API_BASE}/shorten`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errData = await response.json()
                throw new Error(errData.detail || 'Failed to shorten URL')
            }

            const data = await response.json()
            const fullShortUrl = `${window.location.origin}/${data.short_code}`
            setShortUrl(fullShortUrl)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (shortUrl) {
            navigator.clipboard.writeText(shortUrl)
            setToast("Copied to clipboard!")
            setTimeout(() => setToast(null), 3000)
        }
    }

    return (
        <div style={{ width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Top Bar Actions */}
            <div className="top-bar" style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: '20px 40px',
                gap: '12px',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                <button
                    className="icon-btn"
                    onClick={() => window.location.href = '/admin'}
                    title="Dashboard"
                >
                    📊
                </button>
            </div>

            {/* Main Center Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                padding: '20px',
                boxSizing: 'border-box'
            }}>
                <div className="container" style={{ margin: 0 }}>
                    <h1>Shawty Link</h1>
                    <p className="subtitle">Simplify your long ass URL.</p>

                    <form onSubmit={handleSubmit} className="input-group">
                        <input
                            type="url"
                            placeholder="Paste your long URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />

                        <div className="alias-input-wrapper">
                            <input
                                type="text"
                                placeholder="Custom alias (optional)"
                                value={customAlias}
                                onChange={(e) => setCustomAlias(e.target.value)}
                                pattern="[a-zA-Z0-9-_]+"
                                title="Alphanumeric, hyphens, underscores"
                            />
                            {customAlias && (
                                <span className={`alias-status ${aliasAvailable ? 'available' : 'taken'}`}>
                                    {aliasAvailable === null ? '...' : (aliasAvailable ? '✓' : '✗')}
                                </span>
                            )}
                        </div>

                        <button
                            type="button"
                            className="text-btn"
                            onClick={() => setShowAdvanced(!showAdvanced)}
                        >
                            {showAdvanced ? 'Hide Options' : 'More Options'}
                        </button>

                        {showAdvanced && (
                            <div className="advanced-options">
                                <input
                                    type="password"
                                    placeholder="Password protection (optional)"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                                <div className="row">
                                    <input
                                        type="datetime-local"
                                        title="Expiry Date"
                                        value={expiresAt}
                                        onChange={e => setExpiresAt(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max clicks"
                                        value={maxClicks}
                                        onChange={e => setMaxClicks(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={loading}>
                            {loading ? 'Shortening...' : 'Shorten URL'}
                        </button>
                    </form>

                    {error && <div className="error-msg">{error}</div>}

                    {shortUrl && (
                        <div className="result-card">
                            <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="short-url">
                                {shortUrl}
                            </a>
                            <button onClick={copyToClipboard} className="copy-btn">
                                Copy
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {toast && <Toast message={toast} onClose={() => setToast(null)} />}
        </div>
    )
}
