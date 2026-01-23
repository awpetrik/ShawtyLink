import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, AUTH_STATUS } from '../context/AuthContext'

// Loading Component
const FullScreenLoader = () => (
    <div className="main-layout">
        <div className="content-wrapper" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh'
        }}>
            <div className="loading-spinner">Initializing Session...</div>
        </div>
    </div>
)

/**
 * Validates 'next' parameter to prevent open redirects.
 * Must start with '/' and not contain protocol.
 */
const getValidNextPath = (search) => {
    const params = new URLSearchParams(search)
    const next = params.get('next')
    if (next && next.startsWith('/') && !next.includes('//')) {
        return next
    }
    return '/dashboard'
}

export const ProtectedRoute = ({ requireAdmin = false }) => {
    const { status, user } = useAuth()
    const location = useLocation()

    // 1. UNKNOWN -> Show Loader (NEVER REDIRECT)
    if (status === AUTH_STATUS.UNKNOWN) {
        return <FullScreenLoader />
    }

    // 2. UNAUTHENTICATED -> Redirect to Login
    if (status === AUTH_STATUS.UNAUTHENTICATED) {
        return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
    }

    // 3. AUTHENTICATED -> Check Admin Requirement
    if (requireAdmin && !user?.is_superuser) {
        return <Navigate to="/dashboard" replace />
    }

    // 4. Access Granted
    return <Outlet />
}

export const PublicOnlyRoute = () => {
    const { status } = useAuth()
    const location = useLocation()

    // 1. UNKNOWN -> Show Loader (NEVER REDIRECT)
    if (status === AUTH_STATUS.UNKNOWN) {
        return <FullScreenLoader />
    }

    // 2. AUTHENTICATED -> Redirect to Dashboard (or next param)
    if (status === AUTH_STATUS.AUTHENTICATED) {
        const nextPath = getValidNextPath(location.search)
        return <Navigate to={nextPath} replace />
    }

    // 3. UNAUTHENTICATED -> Allow access (Login/Register pages)
    return <Outlet />
}
