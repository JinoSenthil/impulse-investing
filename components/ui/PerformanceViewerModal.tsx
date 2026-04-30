'use client'

import { useState, useEffect } from 'react'
import { IndicatorPerformance } from '@/types'
import {
    X,
    Calendar,
    TrendingUp,
    Image as ImageIcon,
    Loader2,
} from 'lucide-react'
import Image from 'next/image'
import ApiService from '@/services/ApiService'

interface PerformanceViewerModalProps {
    isOpen: boolean
    onClose: () => void
    indicatorId: number
    indicatorTitle: string
}

export default function PerformanceViewerModal({
    isOpen,
    onClose,
    indicatorId,
    indicatorTitle,
}: PerformanceViewerModalProps) {
    const [performances, setPerformances] = useState<IndicatorPerformance[]>([])
    const [selectedPerformance, setSelectedPerformance] = useState<IndicatorPerformance | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // Date range state - default to today
    const [fromDate, setFromDate] = useState('')
    const [toDate, setToDate] = useState('')

    // Initialize dates on mount
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]
        setFromDate(today)
        setToDate(today)
    }, [])

    // Fetch performance data when dates change
    useEffect(() => {
        if (!isOpen || !fromDate || !toDate) return

        const fetchPerformances = async () => {
            try {
                setLoading(true)
                setError(null)
                
                const data = await ApiService.getIndicatorPerformanceByDate(
                    indicatorId,
                    fromDate,
                    toDate
                )
                
                setPerformances(data || [])
                if (data && data.length > 0) {
                    setSelectedPerformance(data[0])
                } else {
                    setSelectedPerformance(null)
                }
            } catch (err) {
                console.error('Error fetching performance data:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch performance data')
            } finally {
                setLoading(false)
            }
        }

        fetchPerformances()
    }, [isOpen, indicatorId, fromDate, toDate])

    if (!isOpen) return null

    // Helper to get full image/video URL
    const getMediaUrl = (url: string | string[] | undefined, index: number = 0): string => {
        if (!url) return '';
        const urlString = Array.isArray(url) ? url[index] : url;
        if (typeof urlString !== 'string') return '';
        if (urlString.startsWith('http://') || urlString.startsWith('https://')) return urlString;
        const base = process.env.NEXT_PUBLIC_API_URL_IMAGE || '';
        return base + urlString;
    };

    // Check if URL is a video
    const isVideoUrl = (url: string): boolean => {
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
        const lowerUrl = url.toLowerCase();
        return videoExtensions.some(ext => lowerUrl.includes(ext));
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-bg-card border-2 border-border/50 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-8">
                {/* Header */}
                <div className="p-6 border-b border-border/50 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent-gold/10 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-accent-gold" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Performance Viewer</h3>
                            <p className="text-text-secondary text-sm">{indicatorTitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition"
                    >
                        <X className="w-5 h-5 text-text-secondary" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Date Range Selector */}
                    <div className="mb-8 bg-white/5 border border-border/50 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Filter by Date</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 text-accent-gold animate-spin mb-3" />
                            <p className="text-text-secondary">Loading performance data...</p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-6">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* No Data State */}
                    {!loading && performances.length === 0 && !error && (
                        <div className="text-center py-12">
                            <p className="text-text-secondary text-lg">
                                No performance data available for the selected date range.
                            </p>
                        </div>
                    )}

                    {/* Performance Records */}
                    {!loading && performances.length > 0 && (
                        <div className="space-y-6">
                            {/* Performance Date Selector */}
                            <div className="mb-8 overflow-x-auto pb-2">
                                <div className="flex gap-3 min-w-max">
                                    {performances.map((performance) => (
                                        <button
                                            key={performance.id}
                                            onClick={() => setSelectedPerformance(performance)}
                                            className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${
                                                selectedPerformance?.id === performance.id
                                                    ? 'bg-accent-gold text-bg-primary shadow-lg shadow-accent-gold/20'
                                                    : 'bg-white/5 border border-border/50 text-text-secondary hover:bg-white/10'
                                            }`}
                                        >
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm font-semibold">
                                                {new Date(performance.performanceDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Selected Performance Details */}
                            {selectedPerformance && (
                                <div className="space-y-6">
                                    {/* Performance Text */}
                                    <div className="bg-accent-gold/5 border border-accent-gold/10 rounded-2xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-accent-gold" />
                                            Performance Summary
                                        </h3>
                                        <p className="text-text-secondary text-base leading-relaxed">
                                            {selectedPerformance.todayPerformance}
                                        </p>
                                        <div className="mt-4 flex flex-wrap gap-3 text-sm">
                                            <div className="bg-white/5 rounded-lg px-3 py-2">
                                                <span className="text-text-secondary">Date: </span>
                                                <span className="text-accent-gold font-semibold">
                                                    {new Date(selectedPerformance.performanceDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="bg-white/5 rounded-lg px-3 py-2">
                                                <span className="text-text-secondary">Status: </span>
                                                <span className={selectedPerformance.activeStatus ? 'text-accent-green font-semibold' : 'text-red-400 font-semibold'}>
                                                    {selectedPerformance.activeStatus ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Performance Media Gallery */}
                                    {selectedPerformance.imageUrl && Array.isArray(selectedPerformance.imageUrl) && selectedPerformance.imageUrl.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                                <ImageIcon className="w-5 h-5 text-accent-gold" />
                                                Supporting Visuals
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {selectedPerformance.imageUrl.map((mediaUrl, idx) => {
                                                    const fullUrl = getMediaUrl(selectedPerformance.imageUrl, idx);
                                                    const isVideo = isVideoUrl(fullUrl);
                                                    
                                                    return (
                                                        <div key={idx} className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/50 bg-bg-secondary group">
                                                            {isVideo ? (
                                                                <video
                                                                    src={fullUrl}
                                                                    className="w-full h-full object-cover"
                                                                    controls
                                                                    preload="metadata"
                                                                    playsInline
                                                                >
                                                                    Your browser does not support the video tag.
                                                                </video>
                                                            ) : (
                                                                <>
                                                                    <Image
                                                                        src={fullUrl}
                                                                        alt={`Performance media ${idx + 1}`}
                                                                        fill
                                                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                                        unoptimized
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Metadata */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="bg-white/5 border border-border/50 rounded-lg p-4">
                                            <p className="text-text-secondary mb-1">Created Date</p>
                                            <p className="text-white font-semibold">
                                                {new Date(selectedPerformance.createdDate).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="bg-white/5 border border-border/50 rounded-lg p-4">
                                            <p className="text-text-secondary mb-1">Last Modified</p>
                                            <p className="text-white font-semibold">
                                                {new Date(selectedPerformance.modifiedDate).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
