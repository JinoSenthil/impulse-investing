'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, X, Youtube, Zap } from 'lucide-react'
import ApiService from '@/services/ApiService'
import { YouTubePublish } from '@/types'
import Image from 'next/image'
import { useTheme } from '@/components/providers/ThemeProvider'

export default function YouTubeVideos() {
    const { theme } = useTheme()
    const [videos, setVideos] = useState<YouTubePublish[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null)

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const data = await ApiService.getAllYouTubeVideos()
                // Sort by created date descending if possible, or just use as is
                setVideos(data || [])
            } catch (err) {
                console.error('Failed to fetch YouTube videos:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchVideos()
    }, [])

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/
        const match = url.match(regExp)
        return (match && match[2].length === 11) ? match[2] : null
    }

    const openVideo = (url: string) => {
        const id = getYoutubeId(url)
        if (id) {
            setSelectedVideo(id)
        }
    }

    if (loading) {
        return (
            <section className="py-20 bg-bg-primary">
                <div className="w-[90%] max-w-[1800px] mx-auto text-center">
                    <div className={`${theme === 'light' ? 'text-accent-teal' : 'text-accent-gold'} animate-pulse font-cinzel text-xl font-bold`}>
                        Loading Market Insights...
                    </div>
                </div>
            </section>
        )
    }

    if (videos.length === 0) return null

    return (
        <section id="youtube" className="py-24 relative overflow-hidden bg-bg-primary">
            {/* Background Glow */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[600px] h-[600px] bg-accent-gold/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="w-[90%] max-w-[1800px] mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/10 border border-accent-gold/20 rounded-full mb-6">
                        <Youtube className="w-5 h-5 text-red-500" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-accent-gold">Market Channel</span>
                    </div>
                    <h2 className="font-cinzel text-[2.5rem] md:text-[3.5rem] font-bold uppercase tracking-[4px] text-text-primary mb-4 leading-tight">
                        Trading <span className="text-accent-gold">Insights</span>
                    </h2>
                    <div className="h-1 w-20 bg-accent-gold mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {videos.map((video) => {
                        const videoId = getYoutubeId(video.videoUrl)
                        if (!videoId) return null

                        return (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                viewport={{ once: true }}
                                className="group"
                            >
                                <div
                                    onClick={() => openVideo(video.videoUrl)}
                                    className="relative aspect-video md:aspect-[16/9] lg:aspect-video rounded-3xl overflow-hidden border-2 border-border bg-bg-card shadow-2xl cursor-pointer group-hover:border-accent-gold transition-all duration-500"
                                >
                                    <Image
                                        src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                        alt="Thumbnail"
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />

                                    {/* Play Button Overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-full bg-accent-gold/90 flex items-center justify-center text-bg-primary shadow-xl scale-90 group-hover:scale-100 transition-transform duration-500">
                                            <Play size={32} fill="currentColor" />
                                        </div>
                                    </div>

                                    {/* Video Type Tag */}
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest text-white">
                                        {video.videoType}
                                    </div>

                                    {/* Type icon bottom left */}
                                    <div className="absolute bottom-4 left-4 text-white flex items-center gap-2 drop-shadow-md">
                                        <Zap size={14} fill="currentColor" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">IMPULSE EXCLUSIVE</span>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>

            {/* Video Modal Overlay */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-6"
                        onClick={() => setSelectedVideo(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(212,175,55,0.2)] border-2 border-accent-gold/30"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="absolute -top-12 right-0 md:-right-12 text-white/50 hover:text-accent-gold transition-colors p-2"
                            >
                                <X size={40} />
                            </button>
                            <iframe
                                src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}
