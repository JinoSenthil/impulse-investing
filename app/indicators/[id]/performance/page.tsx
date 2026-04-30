'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Navigation from '@/components/ui/Navigation'
import Footer from '@/components/ui/Footer'
import { Indicator, IndicatorPerformance } from '@/types'
import {
    ChevronLeft,
    Calendar,
    TrendingUp,
    Image as ImageIcon,
    Loader2,
    AlertCircle,
    Play,
} from 'lucide-react'
import ApiService from '@/services/ApiService'
import GlobalLoading from '@/components/ui/GlobalLoading'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getFullImageUrl } from '@/lib/utils'
import Pagination from '@/components/ui/Pagination'

// Auto-scroll Media Carousel Component (supports both images and videos)
const AutoScrollMedia = ({ mediaUrls, title }: { mediaUrls: string[], title: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isVideoPlaying, setIsVideoPlaying] = useState(false)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    
    const mediaArray = Array.isArray(mediaUrls) ? mediaUrls : (mediaUrls ? [mediaUrls] : [])
    const hasMultipleMedia = mediaArray.length > 1

    const getMediaType = (url: string): 'image' | 'video' => {
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi']
        const lowerUrl = url.toLowerCase()
        return videoExtensions.some(ext => lowerUrl.includes(ext)) ? 'video' : 'image'
    }

    const nextMedia = useCallback(() => {
        if (!isVideoPlaying) {
            setCurrentIndex((prev) => (prev + 1) % mediaArray.length)
        }
    }, [mediaArray.length, isVideoPlaying])

    // Auto-scroll functionality
    useEffect(() => {
        if (hasMultipleMedia && !isVideoPlaying) {
            intervalRef.current = setInterval(nextMedia, 3000)
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [hasMultipleMedia, nextMedia, isVideoPlaying])

    const handleVideoPlay = () => {
        setIsVideoPlaying(true)
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }
    }

    const handleVideoEnded = () => {
        setIsVideoPlaying(false)
        setCurrentIndex((prev) => (prev + 1) % mediaArray.length)
    }

    const handleVideoPause = () => {
        setIsVideoPlaying(false)
    }

    const currentMedia = mediaArray[currentIndex] || ''
    const mediaType = getMediaType(currentMedia)

    if (!currentMedia) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-bg-secondary">
                <ImageIcon className="w-12 h-12 text-text-secondary" />
            </div>
        )
    }

    return (
        <div className="relative w-full h-full">
            {mediaType === 'video' ? (
                <>
                    <video
                        ref={videoRef}
                        src={getFullImageUrl(currentMedia)}
                        className="w-full h-full object-cover"
                        onPlay={handleVideoPlay}
                        onPause={handleVideoPause}
                        onEnded={handleVideoEnded}
                        controls
                        preload="metadata"
                        playsInline
                    >
                        Your browser does not support the video tag.
                    </video>
                    {/* Video play icon overlay - only show when video is not playing */}
                    {!isVideoPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <Play className="w-7 h-7 text-white ml-0.5" />
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <Image
                    src={getFullImageUrl(currentMedia)}
                    alt={`${title} - media ${currentIndex + 1}`}
                    fill
                    className="object-cover transition-opacity duration-500"
                    unoptimized
                />
            )}
            
            {/* Progress dots for multiple media */}
            {hasMultipleMedia && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
                    {mediaArray.map((_, idx) => (
                        <button
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === currentIndex 
                                    ? 'w-6 bg-accent-gold' 
                                    : 'w-1.5 bg-white/60 hover:bg-white/80'
                            }`}
                            onClick={() => {
                                if (mediaType === 'video' && videoRef.current) {
                                    videoRef.current.pause()
                                }
                                setCurrentIndex(idx)
                                setIsVideoPlaying(false)
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default function IndicatorPerformancePage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [indicator, setIndicator] = useState<Indicator | null>(null)
    const [performances, setPerformances] = useState<IndicatorPerformance[]>([])
    const [filteredPerformances, setFilteredPerformances] = useState<IndicatorPerformance[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchDate, setSearchDate] = useState('')

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 9 // Show 6 items per page (2 rows of 3 cards)

    // Date range state - default to today
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')

    // Helper function to get media array (handles both string and array)
    const getMediaArray = (performance: IndicatorPerformance): string[] => {
        if (!performance.imageUrl) return []
        if (Array.isArray(performance.imageUrl)) return performance.imageUrl
        return [performance.imageUrl]
    }

    // Find the most recently added performance
    const getMostRecentPerformance = (performancesList: IndicatorPerformance[]): IndicatorPerformance | null => {
        if (performancesList.length === 0) return null
        // Sort by performanceDate (newest first) and return the first one
        return [...performancesList].sort((a, b) => 
            new Date(b.performanceDate).getTime() - new Date(a.performanceDate).getTime()
        )[0]
    }

    // Initialize dates on mount
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]
        setFromDate(today)
        setToDate(today)
        setSearchDate(today)
    }, [])

    // Fetch indicator data
    useEffect(() => {
        const fetchIndicator = async () => {
            try {
                if (!id) return
                const data = await ApiService.getIndicatorById(Number(id))
                setIndicator(data)
            } catch (err) {
                console.error('Error fetching indicator:', err)
                setError('Failed to fetch indicator details')
            }
        }
        fetchIndicator()
    }, [id])

    // Fetch performance data when dates change
    useEffect(() => {
        if (!id || !fromDate || !toDate) return

        const fetchPerformances = async () => {
            try {
                setLoading(true)
                setError(null)

                const data = await ApiService.getIndicatorPerformanceByDate(
                    Number(id),
                    fromDate,
                    toDate
                )

                setPerformances(data || [])
                setFilteredPerformances(data || [])
                setCurrentPage(1) // Reset to first page when filter changes
            } catch (err) {
                console.error('Error fetching performance data:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch performance data')
                setPerformances([])
                setFilteredPerformances([])
            } finally {
                setLoading(false)
            }
        }

        fetchPerformances()
    }, [id, fromDate, toDate])

    // Filter by search date
    useEffect(() => {
        if (!searchDate) {
            setFilteredPerformances(performances)
        } else {
            const filtered = performances.filter(perf => {
                const perfDate = new Date(perf.performanceDate).toISOString().split('T')[0]
                return perfDate === searchDate
            })
            setFilteredPerformances(filtered)
        }
        setCurrentPage(1) // Reset to first page when search filter changes
    }, [searchDate, performances])

    // Pagination logic
    const totalPages = Math.ceil(filteredPerformances.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentPerformances = filteredPerformances.slice(startIndex, endIndex)

    // const isToday = (date: string): boolean => {
    //     const today = new Date().toISOString().split('T')[0]
    //     const perfDate = new Date(date).toISOString().split('T')[0]
    //     return today === perfDate
    // }

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        // Scroll to top of the cards section
        const cardsSection = document.getElementById('performances-grid')
        if (cardsSection) {
            cardsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    if (loading && !indicator) {
        return <GlobalLoading />
    }

    if (error && !indicator) {
        return (
            <div className="min-h-screen bg-bg-primary text-text-primary">
                <Navigation />
                <div className="pt-32 pb-24 px-6 max-w-5xl mx-auto text-center">
                    <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl mb-8">
                        <h1 className="text-2xl font-bold text-red-400 mb-4">Oops! Something went wrong</h1>
                        <p className="text-text-secondary">{error}</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-xl transition"
                    >
                        Go Back
                    </button>
                </div>
                <Footer />
            </div>
        )
    }

    const mostRecent = getMostRecentPerformance(filteredPerformances)

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary">
            <Navigation />

            <main className="pt-28 pb-16 px-4 md:px-8 w-[90%] max-w-[1400px] mx-auto">
                {/* Back Button */}
                <Link
                    href={`/indicators/${id}`}
                    className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-gold transition mb-8 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Back to Details</span>
                </Link>

                {/* Header with title */}
                <div className="mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        Performance History
                    </h1>
                    <p className="text-text-secondary text-lg">
                        Track the performance updates for {indicator?.title || 'this indicator'}
                    </p>
                </div>

                {/* Performance Section */}
                <div>
                    {/* Filter Controls */}
                    <div className="mb-10 p-2 bg-bg-card/30 rounded-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
                            <div>
                                <label className="block text-sm font-semibold text-text-secondary mb-2">
                                    From Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                                    <input
                                        type="date"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                        className="w-full bg-white/5 border border-border/50 rounded-xl py-3 pl-10 pr-4 text-white focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-text-secondary mb-2">
                                    To Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                                    <input
                                        type="date"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                        className="w-full bg-white/5 border border-border/50 rounded-xl py-3 pl-10 pr-4 text-white focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 text-accent-gold animate-spin mb-3" />
                            <p className="text-text-secondary">Loading performance data...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-6 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* No Data State */}
                    {!loading && filteredPerformances.length === 0 && !error && (
                        <div className="text-center py-16 bg-white/5 border border-border/50 rounded-2xl">
                            <AlertCircle className="w-12 h-12 text-text-secondary/40 mx-auto mb-4" />
                            <p className="text-text-secondary text-lg">
                                No performance data available for the selected date range.
                            </p>
                        </div>
                    )}

                    {/* Cards Grid - 3 columns for all performances including latest */}
                    {!loading && filteredPerformances.length > 0 && (
                        <div>
                            <div id="performances-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentPerformances.map((performance, index) => {
                                    const isLatest = performance.id === mostRecent?.id
                                    const mediaArray = getMediaArray(performance)
                                    
                                    return (
                                        <motion.div
                                            key={performance.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className={`group flex flex-col h-full overflow-hidden rounded-2xl transition-all duration-300 ${
                                                isLatest
                                                    ? 'bg-gradient-to-br from-accent-gold/20 to-accent-gold/5 border-2 border-accent-gold/40 shadow-lg shadow-accent-gold/20'
                                                    : 'bg-bg-card border border-border/50 hover:border-accent-gold/30 hover:shadow-xl'
                                            }`}
                                        >
                                            {/* Media Section - Top of card, increased height */}
                                            <div className="relative w-full aspect-[4/3] overflow-hidden bg-bg-secondary flex-shrink-0">
                                                {mediaArray.length > 0 ? (
                                                    <AutoScrollMedia 
                                                        mediaUrls={mediaArray} 
                                                        title={`Performance - ${new Date(performance.performanceDate).toLocaleDateString()}`}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-bg-secondary">
                                                        <ImageIcon className="w-12 h-12 text-text-secondary" />
                                                    </div>
                                                )}
                                                {/* Gradient overlay for better text readability if needed */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                                            </div>

                                            {/* Content Section - Below media */}
                                            <div className={`flex-1 flex flex-col p-5 ${isLatest ? 'bg-gradient-to-b from-accent-gold/10 to-transparent' : ''}`}>
                                                {/* Date Header with Trending Up icon and Latest text in same row */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className={`w-4 h-4 flex-shrink-0 ${isLatest ? 'text-accent-gold' : 'text-text-secondary'}`} />
                                                        <span className={`text-sm font-semibold ${isLatest ? 'text-accent-gold' : 'text-text-secondary'}`}>
                                                            {new Date(performance.performanceDate).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    {isLatest && (
                                                        <div className="flex items-center gap-1.5 bg-accent-gold/15 px-2.5 py-1 rounded-full">
                                                            <TrendingUp className="w-3.5 h-3.5 text-accent-gold" />
                                                            <span className="text-xs font-bold text-accent-gold">Latest</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Performance Description - Below date */}
                                                <p className={`text-sm leading-relaxed mb-4 line-clamp-4 ${isLatest ? 'text-white font-medium' : 'text-text-secondary'}`}>
                                                    {performance.todayPerformance}
                                                </p>

                                                {/* Status Badge - Bottom of card */}
                                                <div className="flex items-center gap-2 pt-3 mt-auto border-t border-white/10">
                                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${performance.activeStatus ? 'bg-accent-green' : 'bg-red-400'}`} />
                                                    <span className={`text-xs font-semibold ${performance.activeStatus ? 'text-accent-green' : 'text-red-400'}`}>
                                                        {performance.activeStatus ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>

                            {/* Pagination Component */}
                            {totalPages > 1 && (
                                <div className="mt-10">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}

                            {/* Items count info */}
                            <div className="text-center mt-4 text-sm text-text-secondary">
                                Showing {startIndex + 1} - {Math.min(endIndex, filteredPerformances.length)} of {filteredPerformances.length} entries
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}