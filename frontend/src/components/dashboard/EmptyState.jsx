import { motion } from 'framer-motion'
import { Link2, BarChart3, QrCode } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function EmptyState({ onCreateClick }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-zinc-800 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-700"
        >
            <div className="w-20 h-20 mb-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20 rotate-3">
                <Link2 className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">
                Ready to shorten your first URL?
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-center text-base leading-relaxed">
                Create short, memorable links that you can track and manage in one place.
                It takes less than 5 seconds!
            </p>

            <div className="flex flex-col items-center gap-4 w-full">
                <button
                    onClick={onCreateClick}
                    className="btn-primary py-4 px-8 rounded-2xl text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 w-full sm:w-auto text-center"
                >
                    + Create Your First Link
                </button>


            </div>

            {/* Quick Tips */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl w-full">
                <div className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-full flex items-center justify-center mb-3">
                        <span className="text-xl">📝</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">Custom Aliases</h3>
                    <p className="text-xs text-gray-500">Brand your links cleanly</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mb-3">
                        <BarChart3 size={20} />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">Analytics</h3>
                    <p className="text-xs text-gray-500">Track every click</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors">
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-full flex items-center justify-center mb-3">
                        <QrCode size={20} />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">QR Codes</h3>
                    <p className="text-xs text-gray-500">Share anywhere</p>
                </div>
            </div>
        </motion.div>
    )
}
