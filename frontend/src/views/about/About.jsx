import Navbar from '../../components/layout/Navbar'
import { Github, Instagram, Linkedin, Code2, Heart, Coffee, AtSign, Music2, Terminal } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function About() {
    // Typing Effect Logic
    const phrases = [
        "I build modern web experiences.",
        "I scale ideas into real systems.",
        "I obsess over UI details.",
        "I ship with vibe and taste.",
        "I love messing with servers, networks, and self-hosted tools."
    ]
    const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
    const [displayText, setDisplayText] = useState("")
    const [isDeleting, setIsDeleting] = useState(false)
    const [typingSpeed, setTypingSpeed] = useState(100)

    useEffect(() => {
        const handleTyping = () => {
            const currentPhrase = phrases[currentPhraseIndex]

            if (isDeleting) {
                setDisplayText(prev => currentPhrase.substring(0, prev.length - 1))
                setTypingSpeed(40)
            } else {
                setDisplayText(prev => currentPhrase.substring(0, prev.length + 1))
                setTypingSpeed(100)
            }

            if (!isDeleting && displayText === currentPhrase) {
                setTimeout(() => setIsDeleting(true), 2000)
            } else if (isDeleting && displayText === "") {
                setIsDeleting(false)
                setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
            }
        }

        const timer = setTimeout(handleTyping, typingSpeed)
        return () => clearTimeout(timer)
    }, [displayText, isDeleting, currentPhraseIndex, typingSpeed, phrases])

    return (
        <div className="min-h-screen bg-white dark:bg-black selection:bg-blue-500/30">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                {/* Hero Profile */}
                <div className="flex flex-col md:flex-row items-center gap-12 mb-20">
                    <div className="w-48 h-48 relative shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
                        <img
                            src="https://avatars.githubusercontent.com/u/62336134?v=4"
                            alt="Rivaldi"
                            className="relative w-full h-full rounded-full border-4 border-white dark:border-black shadow-2xl object-cover"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-white dark:bg-zinc-800 p-2 rounded-full shadow-lg border border-gray-100 dark:border-zinc-700">
                            <Code2 className="text-blue-500 w-6 h-6" />
                        </div>
                    </div>

                    <div className="text-center md:text-left space-y-6">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                                <span>Certified Lunatics</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                                Hi, I'm Rivaldi.
                            </h1>
                            <div className="h-8 mb-4 flex items-center justify-center md:justify-start">
                                <span className="text-lg md:text-xl font-medium text-orange-500">
                                    {displayText}
                                    <span className="animate-pulse text-orange-500 ml-1">|</span>
                                </span>
                            </div>

                            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-lg">
                                I’m driven by curiosity. I love messing with homelabs and turning random ideas into real projects like ShawtyLink. I’m just as into design and film as I am into code, so I care about how things look and feel, not just whether they work. And yeah, music absolutely runs the session. Once a track hits, I’m locked in and basically building on autopilot.
                            </p>
                        </div>

                        <div className="flex justify-center md:justify-start gap-4">
                            <SocialLink href="https://github.com/awpetrik" icon={Github} label="GitHub" />
                            <SocialLink href="https://instagram.com/certified.lunatics" icon={Instagram} label="Instagram" />
                            <SocialLink href="https://www.threads.net/@certified.lunatics" icon={AtSign} label="Threads" />
                            <SocialLink href="https://tiktok.com/@certified.lunatics" icon={Music2} label="TikTok" />
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Coffee className="text-orange-500" />
                            My Philosophy
                        </h2>
                        <div className="prose dark:prose-invert text-gray-600 dark:text-gray-400 leading-relaxed">
                            <p>
                                I believe software should not just "work"—it should feel alive.
                                When building ShawtyLink, my goal wasn't just to make another URL shortener.
                                It was to demonstrate that even simple tools can be beautiful, performant, and delightful to use.
                            </p>
                            <p>
                                Every pixel, animation, and line of code in this project was crafted with obsessive attention to detail.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Heart className="text-red-500" />
                            Support The Project
                        </h2>
                        <div className="bg-gray-50 dark:bg-zinc-900/50 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800">
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                ShawtyLink is Open Source and free to use. If you like my work, consider following me on GitHub or buying me a coffee!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a
                                    href="https://saweria.co/CertifiedLunatics"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 inline-flex items-center justify-center py-3 px-6 rounded-xl bg-[#faae2b] text-white font-bold hover:shadow-lg hover:shadow-orange-500/25 transition-all"
                                >
                                    <Coffee className="w-5 h-5 mr-2" />
                                    Donate (Saweria)
                                </a>
                                <a
                                    href="https://github.com/awpetrik"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 inline-flex items-center justify-center py-3 px-6 rounded-xl bg-gray-900 dark:bg-zinc-800 text-white border border-gray-200 dark:border-zinc-600 font-bold hover:bg-gray-800 dark:hover:bg-zinc-700 transition-all"
                                >
                                    <Github className="w-5 h-5 mr-2" />
                                    Follow GitHub
                                </a>
                            </div>
                        </div>
                    </div>
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

function SocialLink({ href, icon: Icon, label }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all hover:-translate-y-1"
            title={label}
        >
            <Icon size={20} />
        </a>
    )
}
