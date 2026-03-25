'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import DashboardPageWrapper from '@/components/ui/DashboardPageWrapper'
import { FileText, ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'
import { OnlineCourse } from '@/types'
import ApiService from '@/services/ApiService'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import Pagination from '@/components/ui/Pagination'
import { getFullImageUrl } from '@/lib/utils'
import GlobalLoading from '@/components/ui/GlobalLoading'
import ReviewModal from '@/components/ui/ReviewModal'

export default function MyCoursesPage() {
    const [enrolledCourses, setEnrolledCourses] = useState<OnlineCourse[]>([])
    const [loading, setLoading] = useState(true)
    const [reviewModal, setReviewModal] = useState<{ isOpen: boolean, title: string, id: number | null }>({ isOpen: false, title: '', id: null })

    const router = useRouter()

    const { user } = useSelector((state: RootState) => state.auth)
    const userId = user?.id

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 6

    useEffect(() => {
        if (!user) {
            router.push('/login')
            return
        }

        const fetchCourses = async () => {
            try {
                if (userId) {
                    const data = await ApiService.getAllOnlineCourses(userId, true)
                    setEnrolledCourses(data || [])
                }
            } catch (err) {
                console.log('Failed to fetch courses:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchCourses()
    }, [user, userId, router])

    const totalPages = Math.ceil(enrolledCourses.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentCourses = enrolledCourses.slice(startIndex, startIndex + itemsPerPage)

    const handleCourseClick = (courseNumber: string) => {
        router.push(`/premium-courses/${courseNumber}`)
    }

    const truncateText = (html: string, limit = 80) => {
        const text = html.replace(/<[^>]*>/g, '')
        return text.length > limit ? text.slice(0, limit) + '...' : text
    }


    if (loading) {
        return (
            <DashboardPageWrapper title="My Courses">
                <div className="flex justify-center items-center py-20">
                    <div className="text-2xl text-accent-gold animate-pulse"><GlobalLoading /></div>
                </div>
            </DashboardPageWrapper>
        )
    }


    return (
        <DashboardPageWrapper title="My Courses">
            <div className="mb-6 bg-bg-card border-2 border-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition">
                <p className="text-text-secondary text-sm">
                    Showing <span className="text-text-primary font-bold">{currentCourses.length}</span> courses
                </p>

                <Link
                    href="/premium-courses"
                    className="group inline-flex items-center gap-2 text-accent-gold text-sm font-semibold transition hover:text-accent-gold/90"
                >
                    Explore More Courses
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>

            </div>


            {/* Course List - Dynamic */}
            <div className="space-y-6">
                {currentCourses.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentCourses.map((course) => {
                                const imageUrl = getFullImageUrl(course.coverImage || course.thumbnailImgUrl)
                                const hasThumbnail = !!imageUrl && (course.coverImage || course.thumbnailImgUrl) !== 'string'

                                return (
                                    <div
                                        key={course.id}
                                        className="bg-bg-card border-2 border-border rounded-2xl p-6 hover:border-accent-gold transition group h-full flex flex-col cursor-pointer"
                                    // onClick={() => handleCourseClick(course.courseNumber)}
                                    >

                                        <div className="mb-2 flex justify-end">
                                            {course.isPaid ? (
                                                <span className="px-3 py-1 rounded-full border border-accent-gold/30 bg-accent-gold/5 text-accent-gold text-xs font-bold uppercase">
                                                    ₹{course.discountPrice || course.price}
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full border border-green-500/30 bg-green-500/5 text-green-500 text-xs font-bold uppercase">
                                                    Free
                                                </span>
                                            )}
                                        </div>

                                        <div className="mb-6 rounded-xl overflow-hidden border border-accent-gold/20 relative aspect-[4/3] w-full z-10">
                                            <Image
                                                src={hasThumbnail ? imageUrl : "/noimage.webp"}
                                                alt={course.title}
                                                fill
                                                className={`object-cover transition-transform duration-700 group-hover:scale-110 ${!hasThumbnail ? 'opacity-50 grayscale' : ''}`}
                                            />


                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        </div>


                                        <h3 className="font-cinzel text-xl font-bold text-text-primary group-hover:text-accent-gold transition-colors line-clamp-2 mb-2">
                                            {course.title}
                                        </h3>

                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="flex items-center gap-1 px-2 py-0.5 bg-accent-gold/10 border border-accent-gold/20 rounded-md">
                                                <Star className="w-3 h-3 text-accent-gold fill-accent-gold" />
                                                <span className="text-xs font-bold text-accent-gold">{course.averageRating || 0}</span>
                                            </div>
                                            {course.totalReviews !== undefined && (
                                                <span className="text-[10px] text-text-secondary">({course.totalReviews} reviews)</span>
                                            )}
                                        </div>

                                        <div
                                            className="text-text-secondary text-sm mb-6 leading-relaxed flex-grow"
                                            dangerouslySetInnerHTML={{
                                                __html: truncateText(course.shortDescription || '', 80),
                                            }}
                                        />




                                        <div className="w-full mb-4">


                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleCourseClick(course.courseNumber)
                                                }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20 border border-accent-gold/30 rounded-xl font-bold text-sm transition-all duration-300 group/btn mb-3"

                                            >
                                                View Course Details
                                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>

                                            {/* <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setReviewModal({ isOpen: true, title: course.title, id: course.id })
                                                }}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-xl font-bold text-sm transition-all duration-300"
                                            >
                                                <Star className="w-4 h-4 text-accent-gold" />
                                                Review Now
                                            </button> */}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </>
                ) : (
                    <div className="bg-bg-card border-2 border-dashed border-border rounded-3xl p-12 text-center">
                        <div className="w-16 h-16 bg-bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-8 h-8 text-text-secondary opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Courses Enrolled</h3>
                        <p className="text-text-secondary mb-8 max-w-sm mx-auto">
                            You have not enrolled in any courses yet. Start your trading journey by exploring our catalog.
                        </p>

                    </div>
                )}
            </div>

            {enrolledCourses.length > 0 && (
                <div className="mt-12 bg-gradient-to-r from-accent-gold/10 to-transparent border-2 border-accent-gold/30 rounded-2xl p-6 md:p-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold mb-2">Want to Buy More Courses?</h3>
                        <p className="text-text-secondary text-sm md:text-base">
                            Explore and enroll in more premium trading courses
                        </p>
                    </div>

                </div>
            )}
            <ReviewModal
                isOpen={reviewModal.isOpen}
                onClose={() => setReviewModal({ ...reviewModal, isOpen: false })}
                title={reviewModal.title}
                onSubmit={async (data) => {
                    try {
                        if (!userId || !reviewModal.id) return

                        await ApiService.addReview({
                            userId: Number(userId),
                            onlineCourseId: reviewModal.id,
                            courseId: null,
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