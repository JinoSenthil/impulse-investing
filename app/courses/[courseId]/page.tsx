'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Clock, ArrowLeft, CheckCircle2, Play, CheckCircle } from 'lucide-react';
import ApiService from '@/services/ApiService';
import { Course } from '@/types';
// import { getCourseIcon } from '@/data/courseIcons';
import { getFullImageUrl } from '@/lib/utils';
import GlobalLoading from '@/components/ui/GlobalLoading';
import Navigation from '@/components/ui/Navigation';
import Footer from '@/components/ui/Footer';

// Helper to extract YouTube ID
const getYoutubeId = (url: string | null) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

export default function CourseDetailsPage({ params }: { params: { courseId: string } }) {
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
    const [checkingEnrollment, setCheckingEnrollment] = useState<boolean>(true);

    const router = useRouter();
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

    // Fetch course details
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const id = Number(params.courseId);
                let foundCourse: Course | null = null;

                if (!isNaN(id)) {
                    foundCourse = await ApiService.getCourseById(id);
                } else {
                    console.warn("Invalid ID provided");
                }

                if (foundCourse) {
                    setCourse(foundCourse);
                } else {
                    setError("Course not found");
                }
            } catch (err) {
                console.error("Error fetching course:", err);
                setError("Failed to load course details.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [params.courseId]);

    // Check enrollment status when user is authenticated
    useEffect(() => {
        const checkEnrollment = async () => {
            if (!isAuthenticated || !user || !course) {
                setCheckingEnrollment(false);
                return;
            }

            try {
                // Fetch enrollment data for this course and user
                const enrollments = await ApiService.getAllCourseEnrollments({
                    courseId: course.id,
                    createdById: user.id
                });

                // Check if user has any enrollment for this course
                const hasEnrollment = enrollments && enrollments.length > 0;
                setIsEnrolled(hasEnrollment);
            } catch (err) {
                console.error("Error checking enrollment:", err);
                // If there's an error, assume not enrolled to show enroll button
                setIsEnrolled(false);
            } finally {
                setCheckingEnrollment(false);
            }
        };

        if (course && isAuthenticated) {
            checkEnrollment();
        } else {
            setCheckingEnrollment(false);
        }
    }, [isAuthenticated, user, course]);

    // if (loading) {
    //     return (
    //         <div className="min-h-screen bg-[#020C0E] flex items-center justify-center">
    //             <div className="text-green-500 font-cinzel text-2xl animate-pulse">Loading Course Details...</div>
    //         </div>
    //     );
    // }

    if (loading) {
        return <GlobalLoading />;
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-[#020C0E] flex flex-col items-center justify-center text-white gap-4">
                <h1 className="text-2xl font-bold text-red-500">{error || "Course Not Found"}</h1>
                <Link href="/#courses" className="text-accent-gold hover:underline">Return to Courses</Link>
            </div>
        );
    }

    const youtubeId = getYoutubeId(course.introVideoUrl);
    const thumbnail = getFullImageUrl(course.thumbnailImgUrl);
    const cover = getFullImageUrl(course.coverImage);
    const displayImage = cover || thumbnail || '/noimage.webp';
    const hasThumbnail = displayImage !== '/noimage.webp';

    const handleEnrollClick = () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/courses/${course.id}`);
        } else {
            router.push(`/enroll?courseId=${course.id}`);
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary">
            <Navigation />

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-green/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-gold/5 blur-[120px] rounded-full" />
            </div>

            {/* Main Content */}
            <main className="relative z-10 w-[90%] max-w-[1800px] mx-auto px-6 pt-28 pb-12">
                {/* Back Link - Added to content area since header is replaced */}
                <Link
                    href="/#courses"
                    className="flex items-center gap-2 text-text-secondary hover:text-accent-gold transition-colors font-semibold group mb-8 inline-flex"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="">Back to Courses</span>
                </Link>

                {/* Heading Section - Metadata and Title */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="px-3 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/20 text-accent-gold text-xs font-bold uppercase tracking-widest">
                            {course.isPaid ? 'Premium Course' : 'Free Course'}
                        </div>
                        {course.duration && (
                            <div className="flex items-center gap-2 text-text-secondary text-sm">
                                <Clock className="w-4 h-4 text-accent-gold/70" />
                                <span>{course.duration}</span>
                            </div>
                        )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary font-cinzel leading-tight max-w-5xl">
                        {course.title}
                    </h1>
                </div>

                {/* Featured Content Grid - Image/Video and Short Description */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-start">
                    <div className="w-full">
                        {youtubeId ? (
                            <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                                <iframe
                                    className="absolute top-0 left-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${youtubeId}`}
                                    title={course.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                />
                            </div>
                        ) : hasThumbnail ? (
                            <div className="relative aspect-[4/3] w-full bg-black rounded-2xl overflow-hidden border border-border/50 shadow-2xl">
                                <Image
                                    fill
                                    src={displayImage}
                                    alt={course.title}
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            </div>
                        ) : (
                            <div className="w-full aspect-[4/3] bg-bg-card rounded-2xl flex items-center justify-center border border-border/50 shadow-2xl">
                                <div className="text-center">
                                    <Play className="w-12 h-12 text-accent-gold/40 mx-auto mb-3" />
                                    <span className="text-sm text-text-secondary/60">Preview Not Available</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col justify-center h-full pt-4 lg:pt-0">
                        {course.shortDescription && (
                            <div className="relative">
                                <div className="absolute -left-6 top-0 bottom-0 w-1 bg-accent-gold/20 rounded-full" />
                                <p className="text-xl text-accent-gold font-medium leading-relaxed italic pl-6">
                                    &quot;{course.shortDescription}&quot;
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Course Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12 items-start">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Course */}
                        <div className="bg-bg-card border border-border rounded-3xl p-8 shadow-sm">
                            <h2 className="text-2xl font-bold mb-6 text-accent-gold">About This Course</h2>
                            <div
                                className="text-text-secondary text-base leading-relaxed mb-6"
                                dangerouslySetInnerHTML={{ __html: course.fullDescription || course.description }}
                            />

                            {course.features && course.features.length > 0 && (
                                <div>
                                    <h3 className="text-xl font-bold mb-4 text-text-primary">What You&apos;ll Get</h3>
                                    <ul className="space-y-3">
                                        {course.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-3 text-text-secondary">
                                                <CheckCircle2 className="w-5 h-5 text-accent-green mt-0.5 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Syllabus (Only show if exists) */}
                        {course.syllabus && course.syllabus.length > 0 && (
                            <div className="bg-bg-card border border-border rounded-3xl p-8 shadow-sm">
                                <h2 className="text-2xl font-bold mb-6 text-accent-gold">Course Syllabus</h2>
                                <div className="space-y-4">
                                    {course.syllabus.map((module, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 p-6 bg-bg-secondary border border-border rounded-xl hover:border-accent-gold/30 transition-colors hover:bg-bg-secondary/80"
                                        >
                                            <div className="w-12 h-12 bg-accent-green/10 rounded-lg flex items-center justify-center text-accent-green font-bold text-xl flex-shrink-0">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-text-primary font-medium text-base">{module}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Enrollment Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-bg-card border border-accent-green/20 rounded-3xl p-8 sticky top-28 shadow-2xl">
                            <div className="mb-6">
                                <div className="text-2xl font-black text-accent-green mb-2">₹{course.price}</div>
                                <div className="text-text-secondary text-sm">One-time payment</div>
                            </div>

                            {/* Enrollment Button/Status */}
                            {checkingEnrollment && isAuthenticated ? (
                                <div className="w-full py-4 px-4 rounded-xl text-center text-lg mb-6 bg-bg-secondary animate-pulse">
                                    <div className="h-6 bg-border/50 rounded"></div>
                                </div>
                            ) : isEnrolled ? (
                                <div className="w-full bg-gradient-to-r from-accent-green/20 to-emerald-600/20 border-2 border-accent-green/30 text-accent-green font-black py-4 px-4 rounded-xl text-center text-lg mb-6 flex items-center justify-center gap-3">
                                    <CheckCircle className="w-6 h-6" />
                                    You are already enrolled in this course
                                </div>
                            ) : (
                                <button
                                    onClick={handleEnrollClick}
                                    className="block w-full bg-gradient-to-r from-accent-green to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-bg-primary font-black py-4 px-4 rounded-xl text-center text-lg transition-all shadow-[0_10px_40px_rgba(34,197,94,0.3)] hover:shadow-[0_15px_50px_rgba(34,197,94,0.4)] transform hover:-translate-y-1 active:scale-95 mb-6"
                                >
                                    Enroll Now
                                </button>
                            )}

                            <div className="space-y-4 pt-6 border-t border-border">
                                <div className="flex items-center gap-3 text-text-secondary">
                                    <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0" />
                                    <span>Lifetime access</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-secondary">
                                    <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0" />
                                    <span>Certificate of completion</span>
                                </div>
                                <div className="flex items-center gap-3 text-text-secondary">
                                    <CheckCircle2 className="w-5 h-5 text-accent-green flex-shrink-0" />
                                    <span>Expert support</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}