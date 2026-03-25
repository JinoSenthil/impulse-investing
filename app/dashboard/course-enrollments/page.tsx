'use client'

import { useState, useEffect } from 'react'
import DashboardPageWrapper from '@/components/ui/DashboardPageWrapper'
import { BookOpen, Clock, Search, Filter } from 'lucide-react'
import ReviewModal from '@/components/ui/ReviewModal'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import ApiService from '@/services/ApiService'
import { CourseEnrollment } from '@/types'
import Pagination from '@/components/ui/Pagination'
import GlobalLoading from '@/components/ui/GlobalLoading'

export default function CourseEnrollmentsPage() {
    const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [reviewModal, setReviewModal] = useState<{ isOpen: boolean, title: string, id: number | null }>({ isOpen: false, title: '', id: null })

    const { user } = useSelector((state: RootState) => state.auth)
    const userId = user?.id

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    useEffect(() => {
        if (!userId) return

        const fetchEnrollments = async () => {
            try {
                setLoading(true)
                const data = await ApiService.getAllCourseEnrollments({
                    createdById: userId
                })
                setEnrollments(data || [])
                setError(null)
            } catch (err) {
                console.error('Failed to fetch course enrollments:', err)
                setError('Failed to load your course enrollments. Please try again later.')
            } finally {
                setLoading(false)
            }
        }

        fetchEnrollments()
    }, [userId])

    // Filter logic
    const filteredEnrollments = enrollments.filter(enrollment => {
        const fullName = enrollment.fullName || ''
        const title = enrollment.title || `Course #${enrollment.courseId}`
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fullName.toLowerCase().includes(searchTerm.toLowerCase())

        // Since the new API doesn't have isPaid in the base response unless joined, 
        // we'll primarily rely on ALL or filter by other fields if needed.
        return matchesSearch
    })

    const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentEnrollments = filteredEnrollments.slice(startIndex, startIndex + itemsPerPage)

    if (loading) {
        return <GlobalLoading />
    }

    return (
        <DashboardPageWrapper title="Course Enrollments">
            {/* Header Stats & Filters */}
            <div className="mb-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-bg-card border-2 border-border rounded-2xl p-6 hover:border-accent-gold transition">
                        <div className="flex items-center gap-4">
                            <div className="bg-accent-gold/10 p-3 rounded-xl">
                                <BookOpen className="w-6 h-6 text-accent-gold" />
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary uppercase tracking-wider">Total Enrollments</p>
                                <h3 className="text-2xl font-bold">{enrollments.length}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by title or name..."
                            className="w-full bg-bg-card border-2 border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent-gold outline-none transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                            <select
                                className="bg-bg-card border-2 border-border rounded-xl py-3 pl-12 pr-10 focus:border-accent-gold outline-none transition appearance-none cursor-pointer min-w-[160px]"
                                value="ALL"
                                onChange={() => { }}
                            >
                                <option value="ALL">All Sources</option>
                                <option value="INDIAN_MARKET">Indian Market</option>
                                <option value="GLOBAL_MARKET">Global Market</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {error ? (
                <div className="bg-bg-card border-2 border-border rounded-2xl p-12 text-center">
                    <p className="text-text-secondary mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-accent-gold text-bg-primary px-8 py-2 rounded-xl font-bold hover:bg-accent-gold/90 transition"
                    >
                        Retry
                    </button>
                </div>
            ) : filteredEnrollments.length === 0 ? (
                <div className="bg-bg-card border-2 border-dashed border-border rounded-3xl p-12 text-center">
                    <div className="w-16 h-16 bg-bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-8 h-8 text-text-secondary opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">No Enrollments Found</h3>
                    <p className="text-text-secondary mb-8 max-w-sm mx-auto">
                        {searchTerm
                            ? "No enrollments match your active filters."
                            : "You haven't enrolled in any courses yet."}
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {currentEnrollments.map((enrollment) => (
                            <div key={enrollment.id} className="bg-bg-card border-2 border-border rounded-2xl p-6 hover:border-accent-gold transition group flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-accent-gold/20 text-accent-gold">
                                                {enrollment.marketType?.replace('_', ' ') || 'Market'}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md bg-bg-secondary text-text-primary">
                                                {enrollment.tradingType || 'Trading'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold group-hover:text-accent-gold transition line-clamp-1">
                                            {enrollment.title || `Course #${enrollment.courseId}`}
                                        </h3>
                                        <p className="text-xs text-text-secondary mt-1">Student: {enrollment.fullName}</p>
                                    </div>
                                    <div className="text-right text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <Clock className="w-3 h-3 text-accent-gold" />
                                            {enrollment.createdDate ? new Date(enrollment.createdDate).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-bg-secondary/50 rounded-xl p-3 border border-border">
                                        <p className="text-[10px] text-text-secondary uppercase mb-1">Experience</p>
                                        <p className="text-xs font-bold text-white uppercase tracking-wider">{enrollment.experienceLevel || 'Beginner'}</p>
                                    </div>
                                    <div className="bg-bg-secondary/50 rounded-xl p-3 border border-border">
                                        <p className="text-[10px] text-text-secondary uppercase mb-1">Interested in</p>
                                        <p className="text-xs font-bold text-white uppercase tracking-wider truncate">{enrollment.interestedProduct?.replace('_', ' ') || 'All'}</p>
                                    </div>
                                </div>

                                {/* <div className="mt-auto">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setReviewModal({
                                                isOpen: true,
                                                title: enrollment.title || `Course #${enrollment.courseId}`,
                                                id: enrollment.courseId
                                            })
                                        }}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm transition-all duration-300"
                                    >
                                        <Star className="w-4 h-4 text-accent-gold" />
                                        Review Now
                                    </button>
                                </div> */}
                            </div>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-8">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={(page) => setCurrentPage(page)}
                            />
                        </div>
                    )}
                </div>
            )}
            <ReviewModal
                isOpen={reviewModal.isOpen}
                onClose={() => setReviewModal({ ...reviewModal, isOpen: false })}
                title={reviewModal.title}
                onSubmit={async (data) => {
                    try {
                        if (!userId || !reviewModal.id) {
                            alert('Review details are missing.')
                            return
                        }

                        await ApiService.addReview({
                            userId: Number(userId),
                            onlineCourseId: null,
                            courseId: reviewModal.id,
                            indicatorId: null,
                            ratings: data.rating,
                            reviews: data.message
                        })

                        alert('Thank you for your review!')
                    } catch (err) {
                        console.error('Failed to submit review:', err)
                        alert('Failed to submit review. Please try again.')
                    }
                }}
            />
        </DashboardPageWrapper>
    )
}
