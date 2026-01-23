import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards'
import Layout from './components/layout/Layout'

import HomeView from './views/HomeView' // We'll mock this to Home.jsx later
import VerifyView from './views/VerifyView'
import LoginView from './views/LoginView'
import RegisterView from './views/RegisterView'

// NEW Pages
import Dashboard from './pages/Dashboard'
import Links from './pages/Links'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import AdminView from './views/AdminView' // Keeping for legacy reference if needed, or map to Analytics
import NotFoundView from './views/NotFoundView'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes with Layout if desired, or standalone */}
            <Route path="/" element={<HomeView />} />

            {/* Auth Pages */}
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginView />} />
              <Route path="/register" element={<RegisterView />} />
              <Route path="/verify/:token" element={<VerifyView />} />
            </Route>

            {/* Protected App Routes wrapped in Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/links" element={<Links />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
