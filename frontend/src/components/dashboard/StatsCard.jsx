import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import clsx from 'clsx'

function Counter({ value }) {
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) => Math.floor(current).toLocaleString());

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return <motion.span>{display}</motion.span>;
}

// Mock data for sparkline
const mockData = [
    { v: 10 }, { v: 15 }, { v: 8 }, { v: 12 }, { v: 20 }, { v: 18 }, { v: 24 }
]

export default function StatsCard({ title, value, change, icon: Icon, delay = 0, color = "blue" }) {
    const isPositive = change > 0
    const isNeutral = change === 0 || change === undefined

    const colorStyles = {
        blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
        green: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
        purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20",
        orange: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20",
    }

    const strokeColors = {
        blue: "#2563eb",
        green: "#16a34a",
        purple: "#9333ea",
        orange: "#ea580c",
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-gray-100 dark:border-zinc-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all relative overflow-hidden"
        >
            <div className="flex justify-between items-start mb-2 relative z-10">
                <div className={clsx("p-2 rounded-xl transition-colors", colorStyles[color])}>
                    <Icon size={20} />
                </div>
                {change !== undefined && (
                    <div className={clsx(
                        "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                        isPositive ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                            isNeutral ? "bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400" :
                                "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    )}>
                        {isPositive ? <ArrowUpRight size={12} /> : isNeutral ? <Minus size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
                <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    <Counter value={value} />
                </p>

                <p className="text-xs text-gray-400 mt-1">vs last week</p>
            </div>

            {/* Sparkline Background */}
            <div className="absolute bottom-0 right-0 w-32 h-16 opacity-10 group-hover:opacity-20 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockData}>
                        <Line
                            type="monotone"
                            dataKey="v"
                            stroke={strokeColors[color]}
                            strokeWidth={3}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}
