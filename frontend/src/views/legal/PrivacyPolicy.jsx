import Navbar from '../../components/layout/Navbar'
import { Shield, Lock, Eye } from 'lucide-react'

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-white dark:bg-black selection:bg-blue-500/30">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <header className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                        <Shield size={14} />
                        <span>Last updated: January 29, 2026</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400">
                        We care about your data. Here's how we protect it.
                    </p>
                </header>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
                    <section>
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            <Eye className="text-blue-500" />
                            1. Information We Collect
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            We collect minimal information to provide our URL shortening service:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mt-4">
                            <li><strong>Account Data:</strong> Email address and hashed password when you register.</li>
                            <li><strong>Usage Data:</strong> Information about links you create and their performance stats.</li>
                            <li><strong>Analytics Data:</strong> IP addresses and User-Agent strings of visitors to providing analytics (country, device, etc.).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            <Lock className="text-green-500" />
                            2. How We Use Your Data
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            We use your data solely for:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mt-4">
                            <li>Providing and maintaining the Service.</li>
                            <li>Monitoring usage/analytics (e.g., click counts, location stats).</li>
                            <li>Detecting and preventing abuse (spam/phishing).</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            3. Data Sharing
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            We do <strong>not</strong> sell your personal data. We may share data only with:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mt-4">
                            <li><strong>Service Providers:</strong> Cloud hosting (e.g., Google Cloud, AWS) to run infrastructure.</li>
                            <li><strong>Legal Authorities:</strong> If required by law or to protect against illegal activities.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            4. Your Rights
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            You have the right to access, correct, or delete your account at any time via the Settings dashboard.
                        </p>
                    </section>
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
