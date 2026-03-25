'use client'

import { useState, useEffect } from 'react'
import { Star, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ReviewModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: { rating: number; message: string }) => void
    title: string
    initialRating?: number
    initialMessage?: string
}

export default function ReviewModal({
    isOpen,
    onClose,
    onSubmit,
    title,
    initialRating = 0,
    initialMessage = ''
}: ReviewModalProps) {
    const [rating, setRating] = useState(initialRating)
    const [hover, setHover] = useState(0)
    const [message, setMessage] = useState(initialMessage)

    useEffect(() => {
        if (isOpen) {
            setRating(initialRating)
            setMessage(initialMessage)
        }
    }, [isOpen, initialRating, initialMessage])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) {
            alert('Please select a rating')
            return
        }
        onSubmit({ rating, message })
        // Reset state after submission
        setRating(0)
        setMessage('')
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-bg-card border-2 border-border rounded-3xl p-6 md:p-8 shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold font-cinzel text-white mb-2">Write a Review</h2>
                            <p className="text-text-secondary text-sm">How was your experience with <span className="text-accent-gold font-semibold">{title}</span>?</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Star Rating */}
                            <div className="flex flex-col items-center gap-3 py-4 bg-bg-secondary/30 rounded-2xl border border-white/5">
                                <p className="text-xs text-text-secondary uppercase tracking-[0.2em] font-black">Your Rating</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHover(star)}
                                            onMouseLeave={() => setHover(0)}
                                            className="transition-transform active:scale-90"
                                        >
                                            <Star
                                                className={`w-10 h-10 transition-colors duration-300 ${(hover || rating) >= star
                                                    ? 'fill-accent-gold text-accent-gold drop-shadow-[0_0_8px_rgba(255,184,0,0.4)]'
                                                    : 'text-gray-600'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Review Message */}
                            <div className="space-y-2">
                                <label className="text-xs text-text-secondary uppercase tracking-[0.2em] font-black pl-1">
                                    Share your feedback (Optional)
                                </label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Tell us what you liked or how we can improve..."
                                    className="w-full h-32 bg-bg-secondary border-2 border-border rounded-2xl p-4 text-white outline-none focus:border-accent-gold transition-colors resize-none placeholder:text-text-secondary/50"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-8 py-3 bg-transparent border-2 border-border text-white rounded-xl font-bold hover:bg-white/5 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-8 py-3 bg-accent-gold text-bg-primary rounded-xl font-bold hover:bg-accent-gold/90 transition shadow-lg shadow-accent-gold/20"
                                >
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
