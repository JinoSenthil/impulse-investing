'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ShieldCheck, Zap, BarChart3, Bell } from 'lucide-react'
import { motion } from 'framer-motion'
import { IntroductionData } from '@/types'
import ApiService, { parseArrayResponse } from '@/services/ApiService'
import Link from 'next/link';
import { useTheme } from '@/components/providers/ThemeProvider'
import { getFullImageUrl } from '@/lib/utils'

export default function Introduction() {
    const { theme } = useTheme()
    const [introData, setIntroData] = useState<IntroductionData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchIntroData = async () => {
            try {
                const data = await ApiService.getIntroductionData()
                const list = parseArrayResponse<IntroductionData>(data)
                const activeData = list.find(item => item.activeStatus)
                setIntroData(activeData || null)
            } catch (err) {
                console.error('Failed to fetch introduction data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchIntroData()
    }, [])

    // Basic features list
    const features = [
        { icon: <BarChart3 className="w-5 h-5" />, text: introData?.point1 },
        { icon: <ShieldCheck className="w-5 h-5" />, text: introData?.point2 },
        { icon: <Zap className="w-5 h-5" />, text: introData?.point3 },
        { icon: <Bell className="w-5 h-5" />, text: introData?.point4 },
    ]

    if (loading) {
        return (
            <section id="introduction" className="py-20 px-6 bg-bg-primary">
                <div className="w-[90%] max-w-[1800px] mx-auto text-center">
                    <div className={`${theme === 'light' ? 'text-accent-teal' : 'text-accent-gold'} animate-pulse font-cinzel text-xl font-bold`}>
                        Loading Introduction...
                    </div>
                </div>
            </section>
        )
    }

    if (!introData) return null

    return (
        <section id="introduction" className="py-20 px-6 relative overflow-hidden bg-bg-primary">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-accent-gold/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-[90%] max-w-[1800px] mx-auto px-6 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="font-cinzel text-[3rem] font-bold uppercase tracking-[3px] text-accent-teal select-none drop-shadow-sm">
                        Introduction
                    </h2>
                    <div className="relative mt-2">
                        <div className="h-[1.5px] w-12 bg-accent-teal mx-auto" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                    {/* Left Side: Video/Image Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative group"
                    >
                        <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border-2 border-border bg-bg-card shadow-2xl group-hover:border-accent-gold/50 transition-all duration-500">
                            <Image
                                src={getFullImageUrl(introData.imageUrl) || "/intro.jpg"}
                                alt="IMPULSE Trading Introduction"
                                fill
                                className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent opacity-60" />


                            {/* Floating Label */}
                            <div className="absolute bottom-6 left-6 right-6 p-6 bg-bg-card/90 backdrop-blur-xl border border-border rounded-2xl flex items-center justify-between shadow-lg">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-accent-gold mb-1">Live Performance</p>
                                    <p className="text-sm font-bold text-text-primary">{introData.title}</p>
                                </div>
                                <div className="px-3 py-1 bg-accent-green/20 text-accent-green rounded-full text-[10px] font-black uppercase tracking-widest">Live</div>
                            </div>
                        </div>

                        {/* Decorative Rings */}
                        <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-accent-gold/20 rounded-full -z-10 animate-pulse" />
                        <div className="absolute -bottom-8 -right-8 w-40 h-40 border-2 border-accent-gold/10 rounded-full -z-10" />
                    </motion.div>

                    {/* Right Side: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-gold/10 border border-accent-gold/20 rounded-full mb-6">
                                <Zap className="w-4 h-4 text-accent-gold" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-accent-gold">Featured Indicator</span>
                            </div>
                            <h3 className="font-cinzel text-3xl md:text-5xl font-black mb-4 leading-tight text-text-primary">
                                {introData.title.split(' ').slice(0, -1).join(' ')} <span className="text-accent-gold">{introData.title.split(' ').slice(-1)}</span>
                            </h3>
                            <p className="text-xl font-bold text-text-primary/90">
                                {introData.subTitle}
                            </p>
                        </div>

                        <p className="text-text-secondary leading-relaxed text-lg">
                            {introData.shortDescription}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-bg-card border border-border rounded-2xl hover:border-accent-gold/30 transition-colors group/item">
                                    <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center text-accent-gold group-hover/item:bg-accent-gold group-hover/item:text-bg-primary transition-all shadow-lg">
                                        {feature.icon}
                                    </div>
                                    <span className="text-base font-bold text-text-secondary group-hover/item:text-text-primary transition-colors">{feature.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8">
                            <Link
                                href="#demo"
                                className="
                                inline-flex p-12  group relative items-center justify-center gap-3
                                bg-accent-gold text-bg-primary
                                py-5 rounded-2xl font-black text-base uppercase tracking-[0.2em]
                                 shadow-xl shadow-accent-gold/20
                                transition-all duration-300 ease-out
                                hover:shadow-2xl hover:shadow-accent-gold/40
                                hover:-translate-y-0.5
                                hover:bg-accent-gold/90
                                active:scale-[0.98] "
                            >
                                {introData.button} <Zap size={18} fill="currentColor" />
                            </Link>
                        </div>

                    </motion.div>
                </div>
            </div>
        </section>
    )
}
