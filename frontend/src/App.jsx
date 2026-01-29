import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ProtectedRoute, PublicOnlyRoute } from './components/RouteGuards'
import Layout from './components/layout/Layout'

import HomeView from './views/HomeView' // We'll mock this to Home.jsx later
import VerifyView from './views/VerifyView'
import LoginView from './views/LoginView'
import RegisterView from './views/RegisterView'
import ForgotPasswordView from './views/ForgotPasswordView'
import ResetPasswordView from './views/ResetPasswordView'
import UnlockLinkView from './views/UnlockLinkView'
import PrivacyPolicy from './views/legal/PrivacyPolicy'
import TermsOfService from './views/legal/TermsOfService'
import FAQ from './views/support/FAQ'
import About from './views/about/About'

// NEW Pages
import Dashboard from './pages/Dashboard'
import Links from './pages/Links'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
// Admin Components
import AdminLayout from './components/layout/AdminLayout'
import AdminDashboard from './views/admin/AdminDashboard'
import AdminUsers from './views/admin/AdminUsers'
import AdminView from './views/AdminView' // Keeping for legacy reference if needed, or map to Analytics
import NotFoundView from './views/NotFoundView'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes with Layout if desired, or standalone */}
              <Route path="/" element={<HomeView />} />
              <Route path="/unlock/:shortCode" element={<UnlockLinkView />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/about" element={<About />} />

              {/* Auth Pages */}
              <Route element={<PublicOnlyRoute />}>
                <Route path="/login" element={<LoginView />} />
                <Route path="/register" element={<RegisterView />} />
                <Route path="/verify/:token" element={<VerifyView />} />
                <Route path="/forgot-password" element={<ForgotPasswordView />} />
                <Route path="/reset-password" element={<ResetPasswordView />} />
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

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>

              <Route path="*" element={<NotFoundView />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
