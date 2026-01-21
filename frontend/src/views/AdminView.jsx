import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// ... Utils ...
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-btn">Cancel</button>
                    <button onClick={onConfirm} className="delete-btn">Delete</button>
                </div>
            </div>
        </div>
    )
}

const TruncatedLink = ({ url }) => (
    <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={url}>
        <a href={url} target="_blank" rel="noopener noreferrer" className="link-text">
            {url}
        </a>
    </div>
)

const AnalyticsModal = ({ isOpen, onClose }) => {
    const [range, setRange] = useState('7d')
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            fetch(`${API_BASE}/admin/analytics/overview?range=${range}`)
                .then(res => res.json())
                .then(setData)
                .catch(console.error)
                .finally(() => setLoading(false))
        }
    }, [isOpen, range])

    // Keydown ESC
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Analytics Overview</h3>
                    <button onClick={onClose} className="close-icon-btn">✕</button>
                </div>

                <div className="range-toggles" style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
                    {['7d', '14d', '30d'].map(r => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`toggle-btn ${range === r ? 'active' : ''}`}
                            style={{
                                background: range === r ? 'var(--accent-color)' : 'rgba(120,120,128,0.2)',
                                color: range === r ? 'white' : 'var(--text-primary)',
                                width: 'auto', padding: '6px 12px', fontSize: '13px'
                            }}
                        >
                            {r.toUpperCase()}
                        </button>
                    ))}
                </div>

                {loading ? <div className="loading-spinner">Loading data...</div> : (
                    data ? (
                        <div className="analytics-grid">
                            {/* Chart */}
                            <div className="chart-section" style={{ height: 250, marginBottom: 30 }}>
                                <h4 style={{ marginBottom: 10, marginTop: 0 }}>Clicks Over Time</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.chart_data}>
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 10 }}
                                            tickFormatter={val => val.slice(5)} // MM-DD
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        />
                                        <Bar dataKey="clicks" radius={[4, 4, 0, 0]}>
                                            {data.chart_data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill="var(--accent-color)" />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="stats-breakdown" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                {/* Top Links */}
                                <div>
                                    <h4>Top Links</h4>
                                    <ul className="simple-list">
                                        {data.top_urls.map(u => (
                                            <li key={u.id}>
                                                <span className="code">{u.short_code}</span>
                                                <span className="count">{u.clicks}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Referrers */}
                                <div>
                                    <h4>Top Referrers</h4>
                                    <ul className="simple-list">
                                        {data.top_referrers.map((r, i) => (
                                            <li key={i}>
                                                <span>{r.name}</span>
                                                <span className="count">{r.value}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div style={{ marginTop: 20 }}>
                                <h4>Top Devices / User Agents</h4>
                                <ul className="simple-list">
                                    {data.top_devices.map((d, i) => (
                                        <li key={i} title={d.name}>
                                            <span className="truncate" style={{ maxWidth: 250 }}>{d.name}</span>
                                            <span className="count">{d.value}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        </div>
                    ) : <p>No data available.</p>
                )}
            </div>
        </div>
    )
}

const AllLinksModal = ({ isOpen, onClose, onDelete }) => {
    const [links, setLinks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            fetch(`${API_BASE}/admin/urls`)
                .then(res => res.json())
                .then(data => {
                    setLinks(data)
                    setLoading(false)
                })
                .catch(err => setLoading(false))
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>All Short Links</h3>
                    <button onClick={onClose} className="close-icon-btn">✕</button>
                </div>

                {loading ? <p>Loading...</p> : (
                    links.length === 0 ? (
                        <div className="empty-state">
                            <p>No links found.</p>
                            <button onClick={onClose}>Create one</button>
                        </div>
                    ) : (
                        <div className="table-wrapper table-responsive">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Original URL</th>
                                        <th>Clicks</th>
                                        <th>Created</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {links.map(link => (
                                        <tr key={link.id}>
                                            <td className="code-cell">{link.short_code}</td>
                                            <td><TruncatedLink url={link.original_url} /></td>
                                            <td>{link.clicks}</td>
                                            <td>{new Date(link.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    className="action-delete"
                                                    onClick={() => onDelete(link.short_code)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}
            </div>
        </div>
    )
}

const Toast = ({ message }) => (
    <div className="toast-notification">{message}</div>
)

export default function AdminView() {
    const [stats, setStats] = useState(null)

    // Modal States
    const [showAllLinks, setShowAllLinks] = useState(false)
    const [showAnalytics, setShowAnalytics] = useState(false)

    const [showConfirm, setShowConfirm] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [toast, setToast] = useState(null)

    const fetchStats = () => {
        fetch(`${API_BASE}/admin/stats`)
            .then(res => res.json())
            .then(setStats)
            .catch(console.error)
    }

    useEffect(() => {
        fetchStats()
        const interval = setInterval(fetchStats, 3000)
        return () => clearInterval(interval)
    }, [])

    const handleDeleteClick = (shortCode) => {
        setDeleteTarget(shortCode)
        setShowConfirm(true)
    }

    const confirmDelete = async () => {
        try {
            await fetch(`${API_BASE}/admin/urls/${deleteTarget}`, { method: 'DELETE' })
            setShowConfirm(false)
            setToast("Short link deleted successfully")
            setTimeout(() => setToast(null), 3000)
            fetchStats()
            setShowAllLinks(false)
        } catch (err) {
            console.error(err)
        }
    }

    if (!stats) return <div className="admin-container">Loading...</div>

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 20px', boxSizing: 'border-box' }}>
            <div className="admin-container" style={{ width: '100%', maxWidth: '800px', padding: '20px 0' }}>
                <div className="admin-header">
                    <h1>Dashboard</h1>
                    <button className="back-btn" onClick={() => window.location.href = '/'}>Back to Home</button>
                </div>

                <div className="stats-grid">
                    <div
                        className="stat-card clickable"
                        role="button"
                        tabIndex={0}
                        onClick={() => setShowAnalytics(true)}
                        onKeyDown={(e) => e.key === 'Enter' && setShowAnalytics(true)}
                    >
                        <h3>Total Clicks</h3>
                        <p className="stat-number">{stats.total_clicks}</p>
                        <span className="card-hint">Analytics →</span>
                    </div>
                    <div
                        className="stat-card clickable"
                        onClick={() => setShowAllLinks(true)}
                    >
                        <h3>Active Links</h3>
                        <p className="stat-number">{stats.total_urls}</p>
                        <span className="card-hint">View All →</span>
                    </div>
                </div>

                <div className="section">
                    <h2>Top Performing Links</h2>
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Short Code</th>
                                    <th>Original URL</th>
                                    <th>Clicks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.top_urls?.map(url => (
                                    <tr key={url.id}>
                                        <td className="code-cell">{url.short_code}</td>
                                        <td><TruncatedLink url={url.original_url} /></td>
                                        <td>{url.clicks}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="section">
                    <h2>Recent Activity</h2>
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Time</th>
                                    <th>Referrer</th>
                                    <th>User Agent</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recent_activity?.map(event => (
                                    <tr key={event.id}>
                                        <td>{new Date(event.timestamp).toLocaleString()}</td>
                                        <td>{event.referrer || 'Direct'}</td>
                                        <td>
                                            <div className="truncate" style={{ maxWidth: '150px' }} title={event.user_agent}>
                                                {event.user_agent}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modals */}
                <AllLinksModal
                    isOpen={showAllLinks}
                    onClose={() => setShowAllLinks(false)}
                    onDelete={handleDeleteClick}
                />

                <AnalyticsModal
                    isOpen={showAnalytics}
                    onClose={() => setShowAnalytics(false)}
                />

                <ConfirmModal
                    isOpen={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    onConfirm={confirmDelete}
                    title="Delete Short Link"
                    message="Are you sure you want to delete this link? This action cannot be undone."
                />

                {toast && <Toast message={toast} />}
            </div>
        </div>
    )
}
