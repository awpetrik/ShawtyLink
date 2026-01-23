import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Link2, BarChart2, Settings, LogOut, Menu, X, LayoutDashboard } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

export default function Navbar() {
    const { user, logout } = useAuth()
    const location = useLocation()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 0)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Links', path: '/links', icon: Link2 },
        { name: 'Analytics', path: '/analytics', icon: BarChart2 },
        { name: 'Settings', path: '/settings', icon: Settings },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <nav className={clsx(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
            isScrolled ? "bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800" : "bg-transparent"
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                            <Link2 size={20} className="rotate-45" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Shawty Link</span>
                    </Link>

                    {/* Desktop Navigation */}
                    {user && (
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={clsx(
                                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                                        isActive(item.path)
                                            ? "bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400"
                                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    )}
                                >
                                    <item.icon size={16} />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <button
                                    onClick={logout}
                                    className="hidden md:flex p-2 text-gray-500 hover:text-red-500 transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut size={20} />
                                </button>
                                {/* Mobile Menu Button */}
                                <button
                                    className="md:hidden p-2 text-gray-600"
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                >
                                    {isMobileMenuOpen ? <X /> : <Menu />}
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Sign In</Link>
                                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && user && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
                    >
                        <div className="px-4 py-3 space-y-1">
                            {navLinks.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={clsx(
                                        "block px-3 py-2 rounded-lg text-base font-medium flex items-center gap-3",
                                        isActive(item.path)
                                            ? "bg-gray-100 text-blue-600"
                                            : "text-gray-600 hover:bg-gray-50"
                                    )}
                                >
                                    <item.icon size={18} />
                                    {item.name}
                                </Link>
                            ))}
                            <button
                                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                className="w-full text-left px-3 py-2 text-red-600 font-medium flex items-center gap-3 hover:bg-red-50 rounded-lg mt-2"
                            >
                                <LogOut size={18} />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    )
}
