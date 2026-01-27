import { createContext, useContext, useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, X, AlertCircle, Info } from 'lucide-react'
import clsx from 'clsx'

const ToastContext = createContext(null)

export function useToast() {
    return useContext(ToastContext)
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'success', duration = 2000) => {
        const id = Math.random().toString(36).substring(7)
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => removeToast(id), duration)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 left-0 md:left-auto md:right-4 z-[100] flex flex-col gap-2 pointer-events-none w-full md:w-auto items-center md:items-end px-4 md:px-0">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}

function Toast({ message, type, onClose }) {
    const icons = {
        success: <Check size={18} />,
        error: <AlertCircle size={18} />,
        info: <Info size={18} />
    }

    const styles = {
        success: "bg-white dark:bg-zinc-900 border-green-500/20 text-green-600 dark:text-green-400",
        error: "bg-white dark:bg-zinc-900 border-red-500/20 text-red-600 dark:text-red-400",
        info: "bg-white dark:bg-zinc-900 border-blue-500/20 text-blue-600 dark:text-blue-400"
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={clsx(
                "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg shadow-black/5 min-w-[300px] max-w-md backdrop-blur-md",
                styles[type] || styles.info
            )}
        >
            <div className={clsx("p-1.5 rounded-full shrink-0",
                type === 'success' ? "bg-green-50 dark:bg-green-900/20" :
                    type === 'error' ? "bg-red-50 dark:bg-red-900/20" :
                        "bg-blue-50 dark:bg-blue-900/20"
            )}>
                {icons[type] || icons.info}
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 flex-1">{message}</p>
            <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-gray-500 transition-colors"
            >
                <X size={14} />
            </button>
        </motion.div>
    )
}
