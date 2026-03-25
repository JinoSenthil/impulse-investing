'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Star, Quote, ChevronLeft, ChevronRight, User } from 'lucide-react'
import ApiService, { parseArrayResponse } from '@/services/ApiService'
import { Review } from '@/types'
import Image from 'next/image'
import { getFullImageUrl } from '@/lib/utils'

export default function Reviews() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [itemsPerPage, setItemsPerPage] = useState(1)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1280) setItemsPerPage(3)
            else if (window.innerWidth >= 768) setItemsPerPage(2)
            else setItemsPerPage(1)
        }
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await ApiService.getAllReviews()
                const list = parseArrayResponse<Review>(data)

                // CRITICAL: Only display reviews with 'APPROVED' status
                // 'PENDING' or 'REJECTED' reviews are strictly excluded
                const approvedReviews = list.filter(r => r.reviewStatus === 'APPROVED')

                setReviews(approvedReviews)
            } catch (_err) {
                console.error('Failed to fetch reviews:', _err)
            } finally {
                setLoading(false)
            }
        }
        fetchReviews()
    }, [])

    const handleNext = useCallback(() => {
        setCurrentIndex(prev =>
            prev >= reviews.length - itemsPerPage ? 0 : prev + 1
        )
    }, [reviews.length, itemsPerPage])

    const handlePrev = () => {
        setCurrentIndex(prev =>
            prev === 0 ? Math.max(0, reviews.length - itemsPerPage) : prev - 1
        )
    }

    useEffect(() => {
        if (reviews.length <= itemsPerPage || isHovered) return

        const interval = setInterval(() => {
            handleNext()
        }, 5000)

        return () => clearInterval(interval)
    }, [reviews.length, itemsPerPage, isHovered, handleNext])

    if (loading) {
        return (
            <section className="py-24 bg-bg-primary overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <div className="animate-pulse font-cinzel text-xl text-accent-gold">Loading Testimonials...</div>
                </div>
            </section>
        )
    }

    if (reviews.length === 0) return null

    return (
        <section
            id="reviews"
            className="py-24 relative bg-bg-primary overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-teal/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="w-[90%] max-w-[1800px] mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-accent-gold/10 border border-accent-gold/20 rounded-full mb-6"
                    >
                        <Star className="w-4 h-4 text-accent-gold fill-accent-gold" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-gold">Wall of Fame</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="font-cinzel text-4xl md:text-6xl font-black mb-6 text-text-primary uppercase tracking-tight"
                    >
                        Success <span className="text-accent-gold">Stories</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-text-secondary max-w-2xl mx-auto text-lg font-medium"
                    >
                        Don&apos;t just take our word for it. Hear from our global community of traders who have transformed their journey with IMPULSE.
                    </motion.p>
                </div>

                <div className="relative group/slider">
                    {/* Navigation Buttons */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-30 bg-bg-card/90 border border-border p-5 rounded-full backdrop-blur-sm shadow-2xl hover:bg-accent-gold hover:text-bg-primary hover:border-accent-gold transition-all duration-300 active:scale-95 disabled:opacity-50"
                        disabled={reviews.length <= itemsPerPage}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    <button
                        onClick={handleNext}
                        className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-30 bg-bg-card/90 border border-border p-5 rounded-full backdrop-blur-sm shadow-2xl hover:bg-accent-gold hover:text-bg-primary hover:border-accent-gold transition-all duration-300 active:scale-95 disabled:opacity-50"
                        disabled={reviews.length <= itemsPerPage}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    <div className="overflow-hidden py-8">
                        <motion.div
                            className="flex gap-6 md:gap-8"
                            animate={{ x: `-${currentIndex * (100 / itemsPerPage)}%` }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        >
                            {reviews.map((review) => (
                                <div
                                    key={review.id}
                                    className="flex-shrink-0 w-full md:w-[48%] xl:w-[31.3%] bg-bg-card/50 backdrop-blur-xl border border-border p-8 rounded-[2rem] relative shadow-xl overflow-hidden group hover:border-accent-gold/30 transition-all duration-500 hover:-translate-y-2"
                                >
                                    {/* Decorative Quote Icon */}
                                    <div className="absolute top-4 right-6 text-accent-gold/5 group-hover:text-accent-gold/10 transition-colors duration-500">
                                        <Quote size={40} />
                                    </div>

                                    <div className="relative z-10 h-full flex flex-col">
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-accent-gold/20 p-0.5 shadow-lg group-hover:border-accent-gold/50 transition-colors">
                                                <div className="w-full h-full rounded-xl overflow-hidden bg-bg-secondary flex items-center justify-center relative">
                                                    {review.profileImage ? (
                                                        <Image
                                                            src={getFullImageUrl(review.profileImage)}
                                                            alt={review.userName || 'Member'}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <User className="w-8 h-8 text-accent-gold/30" />
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-cinzel text-lg font-black text-text-primary mb-0.5 tracking-tight group-hover:text-accent-gold transition-colors">
                                                    {review.userName}
                                                </h4>
                                                <div className="flex gap-0.5 mb-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={12}
                                                            className={`${i < (review.rating ?? review.ratings ?? 0) ? 'text-accent-gold fill-accent-gold' : 'text-border'}`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-accent-teal">Verified Member</p>
                                            </div>
                                        </div>

                                        <p className="text-text-primary/90 text-base md:text-lg leading-relaxed italic font-medium mb-8 flex-grow">
                                            &quot;{review.review || review.reviews}&quot;
                                        </p>

                                        <div className="flex items-center gap-3 mt-auto">
                                            <div className="h-[1.5px] w-8 bg-accent-gold/30" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-text-secondary">
                                                {new Date(review.createdDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Pagination Indicators */}
                    <div className="flex justify-center gap-2 mt-8">
                        {Array.from({ length: Math.ceil(reviews.length / itemsPerPage) }).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx * itemsPerPage)}
                                className={`h-1.5 rounded-full transition-all duration-500 ${Math.floor(currentIndex / itemsPerPage) === idx ? 'w-8 bg-accent-gold' : 'w-2 bg-border hover:bg-accent-gold/30'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
