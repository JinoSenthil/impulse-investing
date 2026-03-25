'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import ApiService, { parseArrayResponse } from '@/services/ApiService'
import { Review } from '@/types'
import {
    Star,
    Plus,
    Edit2,
    Trash2,
    MessageCircle,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    User
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReviewModal from '@/components/ui/ReviewModal'

export default function UserReviewsPage() {
    const { user } = useSelector((state: RootState) => state.auth)
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingReview, setEditingReview] = useState<Review | null>(null)

    const fetchUserReviews = useCallback(async () => {
        if (!user?.id) return
        try {
            setLoading(true)
            const data = await ApiService.getAllReviews(user.id)
            const list = parseArrayResponse<Review>(data)
            // The API might return all reviews if userId is optional on backend, 
            // so we filter locally just in case to ensure privacy
            setReviews(list.filter(r => r.userId === user.id))
        } catch (_err) {
            console.error('Failed to fetch reviews:', _err)
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    useEffect(() => {
        fetchUserReviews()
    }, [fetchUserReviews])

    const handleAddReview = () => {
        setEditingReview(null)
        setIsModalOpen(true)
    }

    const handleEditReview = (review: Review) => {
        setEditingReview(review)
        setIsModalOpen(true)
    }

    const handleDeleteReview = async (id: number) => {
        if (!confirm('Are you sure you want to delete this review?')) return
        try {
            await ApiService.deleteReview(id)
            setReviews(prev => prev.filter(r => r.id !== id))
        } catch {
            alert('Failed to delete review')
        }
    }

    const handleModalSubmit = async (data: { rating: number; message: string }) => {
        if (!user?.id) return

        try {
            if (editingReview) {
                // Update
                await ApiService.updateReview(editingReview.id, {
                    ...editingReview,
                    ratings: data.rating,
                    reviews: data.message,
                    reviewStatus: 'PENDING' // Reset to pending on edit
                })
            } else {
                // Create
                await ApiService.addReview({
                    userId: user.id,
                    ratings: data.rating,
                    reviews: data.message,
                })
            }
            fetchUserReviews()
        } catch {
            alert('Failed to save review')
        }
    }

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case 'APPROVED':
                return (
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-accent-green/10 border border-accent-green/20 text-accent-green rounded-full shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-[0.1em]">Approved</span>
                    </div>
                )
            case 'REJECTED':
                return (
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                        <XCircle className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-[0.1em]">Rejected</span>
                    </div>
                )
            default:
                return (
                    <div className="flex items-center gap-1.5 px-4 py-1.5 bg-accent-gold/10 border border-accent-gold/20 text-accent-gold rounded-full shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                        <Clock className="w-3 h-3" />
                        <span className="text-[9px] font-black uppercase tracking-[0.1em]">Pending</span>
                    </div>
                )
        }
    }

    return (
        <div className="p-4 md:p-8 lg:p-12 min-h-[calc(100vh-80px)] lg:min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="font-cinzel text-3xl md:text-5xl font-black text-text-primary mb-3 tracking-tight">
                        My <span className="text-accent-gold">Reviews</span>
                    </h1>
                    <p className="text-text-secondary font-medium">Manage your testimonials and share your experience with the community.</p>
                </div>
                <button
                    onClick={handleAddReview}
                    className="inline-flex items-center justify-center gap-2 bg-accent-gold text-bg-primary px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-accent-gold/20 hover:bg-accent-gold/90 transition-all active:scale-95 group"
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    Write a Review
                </button>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-12 h-12 text-accent-gold animate-spin" />
                    <p className="font-cinzel text-accent-gold animate-pulse font-bold">Loading your reviews...</p>
                </div>
            ) : reviews.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center text-center py-20 px-6 bg-bg-card/30 backdrop-blur-xl border-2 border-dashed border-border rounded-[2.5rem]"
                >
                    <div className="w-20 h-20 bg-accent-gold/10 rounded-3xl flex items-center justify-center text-accent-gold mb-6">
                        <MessageCircle size={40} />
                    </div>
                    <h3 className="text-2xl font-cinzel font-black text-text-primary mb-3">No reviews yet</h3>
                    <p className="text-text-secondary max-w-sm mb-8">You haven&apos;t shared your IMPULSE journey yet. Your feedback helps us improve and guides other traders.</p>
                    <button
                        onClick={handleAddReview}
                        className="text-accent-gold font-black text-sm uppercase tracking-widest hover:underline decoration-2 underline-offset-8"
                    >
                        Share your first story +
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    <AnimatePresence mode="popLayout">
                        {reviews.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()).map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group relative bg-bg-card/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-accent-gold/40 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(212,175,55,0.1)]"
                            >
                                {/* Decorative Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-accent-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="p-8 relative z-10 h-full flex flex-col">
                                    {/* Card Header: Rating & Status */}
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        className={`${i < (item.rating || item.ratings || 0) ? 'text-accent-gold fill-accent-gold' : 'text-white/10'} drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary/60">
                                                {new Date(item.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        {getStatusBadge(item.reviewStatus)}
                                    </div>

                                    {/* Review Body */}
                                    <div className="relative mb-10 flex-grow">
                                        {/* <Quote className="absolute -top-4 -left-2 w-12 h-12 text-accent-gold/5 group-hover:text-accent-gold/10 transition-colors duration-500" /> */}
                                        <p className="text-text-primary/90 font-medium text-lg leading-relaxed pl-6 border-l-2 border-accent-gold/30">
                                            {item.review || item.reviews || 'No review content provided.'}
                                        </p>
                                    </div>

                                    {/* Card Footer: Actions */}
                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-accent-gold/10 flex items-center justify-center">
                                                <User className="w-4 h-4 text-accent-gold" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Verified Member</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditReview(item)}
                                                className="w-10 h-10 flex items-center justify-center bg-white/5 text-text-secondary hover:text-accent-gold hover:bg-accent-gold/10 rounded-xl transition-all active:scale-90"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteReview(item.id)}
                                                className="w-10 h-10 flex items-center justify-center bg-white/5 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Review Modal */}
            <ReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                title={editingReview ? 'Update Your Review' : 'Create New Review'}
                initialRating={editingReview ? (editingReview.rating || editingReview.ratings || 0) : 0}
                initialMessage={editingReview ? (editingReview.review || editingReview.reviews || '') : ''}
            />
        </div>
    )
}
