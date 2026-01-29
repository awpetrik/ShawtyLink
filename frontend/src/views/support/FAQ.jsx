import Navbar from '../../components/layout/Navbar'
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

const faqs = [
    {
        question: "Is ShawtyLink free?",
        answer: "Yes! Creating an account and shortening links is 100% free. We plan to introduce premium features for power users in the future."
    },
    {
        question: "Do my links expire?",
        answer: "By default, your links do not expire. However, you can set a custom expiration date or click limit if you want them to be temporary."
    },
    {
        question: "Can I customize my short URL?",
        answer: "Absolutely. Once signed in, you can choose a custom alias (e.g., 'my-brand') instead of a random string."
    },
    {
        question: "How do I see analytics?",
        answer: "Go to your Dashboard. We provide real-time stats including total clicks, referrer sources, device types, and visitor locations."
    },
    {
        question: "Is it secure?",
        answer: "Yes. We use industry-standard HTTPS encryption. We also offer password protection for your sensitive links."
    }
]

function AccordionItem({ item, isOpen, onClick }) {
    return (
        <div className="border border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900/50">
            <button
                onClick={onClick}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
                <span className="font-semibold text-gray-900 dark:text-white">{item.question}</span>
                {isOpen ? <ChevronUp className="text-blue-500" /> : <ChevronDown className="text-gray-400" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="px-6 pb-4 pt-0 text-gray-600 dark:text-gray-400 leading-relaxed">
                            {item.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(0)

    return (
        <div className="min-h-screen bg-white dark:bg-black selection:bg-blue-500/30">
            <Navbar />

            <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium mb-4">
                        <HelpCircle size={14} />
                        <span>Support Center</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400">
                        Everything you need to know about ShawtyLink.
                    </p>
                </header>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <AccordionItem
                            key={idx}
                            item={faq}
                            isOpen={idx === openIndex}
                            onClick={() => setOpenIndex(idx === openIndex ? -1 : idx)}
                        />
                    ))}
                </div>
            </main>

            <footer className="py-12 border-t border-gray-100 dark:border-zinc-900 text-center">
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                    © {new Date().getFullYear()} Certified Lunatics. All rights reserved.
                </p>
            </footer>
        </div>
    )
}
