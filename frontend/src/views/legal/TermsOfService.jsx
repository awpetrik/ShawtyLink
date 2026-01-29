import Navbar from '../../components/layout/Navbar'
import { FileText, AlertTriangle, Ban } from 'lucide-react'

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-white dark:bg-black selection:bg-blue-500/30">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <header className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium mb-4">
                        <FileText size={14} />
                        <span>Last updated: January 29, 2026</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
                    <p className="text-xl text-gray-500 dark:text-gray-400">
                        Rules of the game. Please read carefully.
                    </p>
                </header>

                <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            1. Acceptance of Terms
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            By accessing or using ShawtyLink, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            <Ban className="text-red-500" />
                            2. Prohibited Uses
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            You agree not to use the Service to shorten links that:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-300 mt-4">
                            <li>Redirect to phishing, malware, or scam sites.</li>
                            <li>Contains illegal content, hate speech, or harassment.</li>
                            <li>Infringes on intellectual property rights.</li>
                        </ul>
                        <p className="mt-4 font-semibold text-red-500">
                            We reserve the right to delete any link and ban any user found violating these rules without notice.
                        </p>
                    </section>

                    <section>
                        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            <AlertTriangle className="text-yellow-500" />
                            3. Disclaimer
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the service will be uninterrupted or error-free.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            4. Termination
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
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
