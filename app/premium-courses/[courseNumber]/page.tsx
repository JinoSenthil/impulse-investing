'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getFullImageUrl } from '@/lib/utils';
import ApiService from '@/services/ApiService';
import { CourseModule, PurchaseDetailsResponse, Payment, CoursePurchase, Course } from '@/types';
import { ArrowLeft, Lock, CheckCircle, Loader2, PlayCircle, X, CreditCard, Wallet, Banknote, Smartphone, Shield, ChevronDown } from 'lucide-react';
import PaymentModal from '@/components/ui/PaymentModal';
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import Pagination from '@/components/ui/Pagination';
import GlobalLoading from '@/components/ui/GlobalLoading';

export default function OnlineCourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courseNumber = params.courseNumber as string;

    const [courseData, setCourseData] = useState<PurchaseDetailsResponse | null>(null);
    const [simpleCourse, setSimpleCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [isCheckingPurchase, setIsCheckingPurchase] = useState(false);

    // Payment confirmation modal state
    const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CREDIT_CARD');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const { user } = useSelector((state: RootState) => state.auth)
    const userId = user?.id

    useEffect(() => {
        const fetchCourseDetails = async () => {
            try {
                if (!courseNumber) return;

                setLoading(true);

                const data = await ApiService.getPurchaseDetails(courseNumber, userId);

                if (data.onlineCourse && data.onlineCourse.length > 0) {
                    setCourseData(data);
                } else {
                    if (!isNaN(Number(courseNumber))) {
                        const simpleData = await ApiService.getCourseById(Number(courseNumber));
                        if (simpleData) {
                            setSimpleCourse(simpleData);
                        }
                    }
                }


            } catch (err) {
                console.error('Failed to fetch course details:', err);
                setError('Failed to load course details. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseNumber, userId]);


    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'loading' as 'loading' | 'success' | 'error' | 'info',
        title: '',
        message: '',
        showConfirmButton: false,
    });

    const paymentMethods = [
        { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
        { id: 'DEBIT_CARD', label: 'Debit Card', icon: CreditCard },
        { id: 'UPI', label: 'UPI', icon: Smartphone },
        { id: 'NET_BANKING', label: 'Net Banking', icon: Banknote },
        { id: 'WALLET', label: 'Wallet', icon: Wallet },
        { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Banknote },
    ]

    const handlePayment = async () => {
        if (!courseData || !courseData.onlineCourse[0]) {
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Missing Information',
                message: 'Course data is missing.',
                showConfirmButton: true,
            });
            return;
        }

        // If not logged in, redirect to login page with return URL
        if (!userId) {
            router.push(`/login?redirect=/premium-courses/${courseNumber}`);
            return;
        }

        setIsCheckingPurchase(true);

        try {
            // Use the new purchaseDetails endpoint
            const purchaseDetails = await ApiService.getPurchaseDetails(
                courseNumber,
                userId
            );

            // Check if the course is already purchased (SUCCESS status)
            if (purchaseDetails.isPurchased === true) {
                setModalState({
                    isOpen: true,
                    type: 'info',
                    title: 'Already Purchased',
                    message: 'You have already purchased this course. You can access all levels now.',
                    showConfirmButton: true,
                });
                return;
            }

            // Check for PENDING payment status
            const course = purchaseDetails.onlineCourse?.[0];
            if (course && course.paymentStatus === 'PENDING') {
                setModalState({
                    isOpen: true,
                    type: 'info',
                    title: 'Payment Already Initiated',
                    message: 'You have already initiated payment for this course. Please wait until the payment is completed.',
                    showConfirmButton: true,
                });
                return;
            }

            // If no pending or successful purchases, proceed to payment
            setShowPaymentConfirm(true);

        } catch (error) {
            console.error('Error checking purchase details:', error);
            // If there's an error checking, show error message
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Connection Error',
                message: 'Unable to verify purchase status. Please try again.',
                showConfirmButton: true,
            });
        } finally {
            setIsCheckingPurchase(false);
        }
    };

    const confirmPayment = async () => {
        if (!courseData || !courseData.onlineCourse[0] || !userId) return;

        const course = courseData.onlineCourse[0];
        const amount = course.discountPrice < course.price ? course.discountPrice : course.price;

        setIsProcessingPayment(true);
        setShowPaymentConfirm(false);

        // Show loading modal
        setModalState({
            isOpen: true,
            type: 'loading',
            title: 'Processing Payment',
            message: 'Please wait while we process your payment...',
            showConfirmButton: false,
        });

        try {
            const paymentPayload = {
                transactionId: null,
                userId: userId,
                amount: amount,
                paymentStatus: "PENDING",
                paymentMethod: selectedPaymentMethod,
                paymentDetail: "USER_PAY_FOR_COURSE",
                createdDate: new Date().toISOString(),
                modifiedDate: new Date().toISOString(),
            };

            // Step 1: Create payment record (PENDING)
            const paymentData = await ApiService.createPayment(paymentPayload as Partial<Payment>);

            const paymentId = paymentData.id;

            // Step 2: Create course purchase record
            await ApiService.createCoursePurchase({
                userId: userId,
                courseId: course.id,
                amount: amount,
                purchaseDate: new Date().toISOString().split('T')[0],
                createdDate: new Date().toISOString(),
                modifiedDate: new Date().toISOString(),
                paymentId: paymentId,
            } as Partial<CoursePurchase>);

            // Show success modal
            setModalState({
                isOpen: true,
                type: 'success',
                title: 'Payment Successful!',
                message: 'Congratulations! You now have full access to all course levels.',
                showConfirmButton: true,
            });

            // Auto redirect after 3 seconds
            setTimeout(() => {
                router.push('/');
            }, 3000);

        } catch (error) {
            console.error('Payment error:', error);

            // Show error modal
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Payment Failed',
                message: 'We encountered an issue processing your payment. Please try again or contact support.',
                showConfirmButton: true,
            });
        } finally {
            setIsProcessingPayment(false);
            setSelectedPaymentMethod('CREDIT_CARD');
        }
    };

    const cancelPayment = () => {
        setShowPaymentConfirm(false);
        setSelectedPaymentMethod('CREDIT_CARD');
    };

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    const getLevelState = (module: CourseModule, index: number) => {
        // Determine if module should be accessible based on preview/access
        const isAccessible = module.isPreview === true || module.isAccess === true;

        // First module logic
        if (index === 0) {
            if (isAccessible) {
                const isTestCompleted = module.isTestCompleted === true;
                return {
                    isUnlocked: true,
                    isCompleted: isTestCompleted,
                    isActive: !isTestCompleted,
                    label: module.isPreview ? 'FREE PREVIEW' :
                        isTestCompleted ? 'COMPLETED' : 'START TEST'
                };
            } else {
                return {
                    isUnlocked: false,
                    isCompleted: false,
                    isActive: false,
                    label: 'LOCKED'
                };
            }
        }

        // Subsequent modules logic
        const prevModule = modules[index - 1];
        const isPrevTestCompleted = prevModule?.isTestCompleted === true;

        // Unlock current module only if:
        // 1. It has preview or access AND
        // 2. Previous module's test is completed
        const shouldUnlock = isAccessible && isPrevTestCompleted;

        if (shouldUnlock) {
            const isTestCompleted = module.isTestCompleted === true;
            return {
                isUnlocked: true,
                isCompleted: isTestCompleted,
                isActive: !isTestCompleted,
                label: module.isPreview ? 'FREE PREVIEW' :
                    isTestCompleted ? 'COMPLETED' : 'START TEST'
            };
        } else {
            // Module is locked
            let label = 'LOCKED';
            if (isAccessible && !isPrevTestCompleted) {
                label = 'COMPLETE PREVIOUS TEST';
            } else if (!isAccessible) {
                label = 'LOCKED';
            }

            return {
                isUnlocked: false,
                isCompleted: false,
                isActive: false,
                label: label
            };
        }
    };

    // Check if user has purchased the course
    // CHANGED: Now only checks isPurchased, not module access
    const hasCourseAccess = courseData?.isPurchased === true;

    // Get modules from course data
    const modules = courseData?.onlineCourse[0]?.modules || [];

    // Check if first level exists and is a preview (for demo)
    const firstModule = modules.length > 0 ? modules[0] : null;
    const isFirstModulePreview = firstModule?.isPreview === true;
    const isFirstModuleTestCompleted = firstModule?.isTestCompleted === true;

    // Pagination calculations
    const totalLevels = modules.length;
    const totalPages = Math.ceil(totalLevels / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentLevels = modules.slice(startIndex, endIndex);

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top of levels section when changing pages
        const levelsSection = document.getElementById('course-levels-section');
        if (levelsSection) {
            levelsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Handle start free demo button click
    const handleStartFreeDemo = () => {
        if (firstModule) {
            // If test is not completed, go to the level page normally
            if (!isFirstModuleTestCompleted) {
                router.push(`/premium-courses/${courseNumber}/level-${firstModule.id}`);
            } else {
                // If test is completed, go with review parameter
                router.push(`/premium-courses/${courseNumber}/level-${firstModule.id}?review=true`);
            }
        }
    };

    if (loading) {
        return <GlobalLoading />;
    }

    if (simpleCourse && !courseData) {
        return (
            <div className="min-h-screen bg-bg-primary text-text-primary relative overflow-hidden">
                {/* Background Glows */}
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-teal/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-gold/5 blur-[120px] rounded-full" />
                </div>

                {/* Header - FIXED */}
                <header className="fixed top-0 left-0 right-0 z-50 bg-bg-card/90 backdrop-blur-xl border-b border-border px-6 pt-4 pb-6 shadow-2xl">
                    <div className="w-[90%] max-w-[1800px] mx-auto flex items-center justify-between">
                        <Link
                            href="/premium-courses"
                            className="flex items-center gap-2 text-text-secondary hover:text-accent-teal transition-colors font-semibold group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="hidden sm:inline">Back to Courses</span>
                        </Link>
                        <div className="text-center">
                            <h1 className="font-cinzel text-lg sm:text-xl font-bold tracking-[2px] text-accent-teal">
                                Course Details
                            </h1>
                        </div>

                    </div>
                </header>

                {/* Add padding-top to account for fixed header */}
                <div className="relative z-10 pt-20 pb-12 px-8">
                    <div className="w-[90%] max-w-[1800px] mx-auto">
                        <div className="text-center mb-16">
                            {simpleCourse.courseNumber && (
                                <p className="text-sm uppercase tracking-[0.3em] font-black text-accent-green mb-6">
                                    {simpleCourse.courseNumber}
                                </p>
                            )}
                            <h1 className="text-3xl md:text-5xl font-black mb-6 bg-gradient-to-r from-green-400 via-accent-green to-green-500 bg-clip-text text-transparent">
                                {simpleCourse.title}
                            </h1>
                            <div
                                className="text-lg text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed prose prose-invert"
                                dangerouslySetInnerHTML={{ __html: simpleCourse.description || simpleCourse.shortDescription }}
                            />

                            {/* Course Image */}
                            {(simpleCourse.coverImage || simpleCourse.thumbnailImgUrl) && (
                                <div className="max-w-3xl mx-auto mb-10 rounded-3xl overflow-hidden border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.15)]">
                                    <div className="relative w-full h-[300px] md:h-[400px]">
                                        <Image
                                            src={getFullImageUrl(simpleCourse.coverImage || simpleCourse.thumbnailImgUrl)}
                                            alt={simpleCourse.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Price */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                                <div className="flex items-center gap-3">
                                    {simpleCourse.discountPrice < simpleCourse.price ? (
                                        <>
                                            <span className="text-4xl font-black text-green-400">₹{simpleCourse.discountPrice}</span>
                                            <span className="text-xl text-gray-500 line-through">₹{simpleCourse.price}</span>
                                        </>
                                    ) : (
                                        <span className="text-4xl font-black text-green-400">₹{simpleCourse.price}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !courseData || courseData.onlineCourse.length === 0) {
        return (
            <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center text-text-primary gap-4">
                <h1 className="text-2xl font-bold text-red-500">{error || 'Course Not Found'}</h1>
                <Link href="/premium-courses" className="text-accent-teal hover:underline">
                    Return to Courses
                </Link>
            </div>
        );
    }

    const course = courseData.onlineCourse[0];
    const hasThumbnail = course.coverImage && course.coverImage !== 'string';

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary relative overflow-hidden">

            {/* Payment Confirmation Modal */}
            {showPaymentConfirm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-bg-card border-2 border-border rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-accent-teal/10 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent-teal/20 rounded-lg">
                                    <Shield className="w-6 h-6 text-accent-teal" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-text-primary">Secure Payment</h3>
                                    <p className="text-text-secondary text-sm">Complete your course purchase</p>
                                </div>
                            </div>
                            <button
                                onClick={cancelPayment}
                                className="p-2 hover:bg-bg-secondary rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-text-secondary" />
                            </button>
                        </div>

                        <div className="">
                            <div className="p-8">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-bold text-text-primary mb-1">SELECT PAYMENT METHOD</h4>
                                        <p className="text-text-secondary text-sm">Choose your preferred payment option</p>
                                    </div>

                                    {/* Payment Method Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={selectedPaymentMethod}
                                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                            className="w-full bg-bg-secondary border-2 border-border rounded-xl py-4 px-4 text-text-primary appearance-none focus:border-accent-teal focus:ring-2 focus:ring-accent-teal/20 focus:outline-none transition-all"
                                        >
                                            <option value="" disabled className="bg-bg-card text-text-primary">
                                                Select a payment method
                                            </option>
                                            {paymentMethods.map((method) => {
                                                return (
                                                    <option
                                                        key={method.id}
                                                        value={method.id}
                                                        className="bg-bg-card text-text-primary py-2"
                                                    >
                                                        {method.label}
                                                    </option>
                                                )
                                            })}
                                        </select>
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <ChevronDown className="w-5 h-5 text-text-secondary" />
                                        </div>
                                    </div>

                                    {/* Selected Payment Method Details */}
                                    {selectedPaymentMethod && (
                                        <div className="bg-accent-teal/10 rounded-xl p-4 border border-accent-teal/30">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-accent-teal/20 rounded-lg">
                                                    {(() => {
                                                        const method = paymentMethods.find(m => m.id === selectedPaymentMethod)
                                                        const Icon = method?.icon || CreditCard
                                                        return <Icon className="w-5 h-5 text-accent-teal" />
                                                    })()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-text-primary">
                                                        {paymentMethods.find(m => m.id === selectedPaymentMethod)?.label}
                                                    </div>
                                                    <div className="text-xs text-text-secondary">Selected payment method</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}


                                    {/* Action Buttons */}
                                    <div className="pt-4 flex gap-4">
                                        <button
                                            onClick={confirmPayment}
                                            disabled={isProcessingPayment || !selectedPaymentMethod}
                                            className="flex-1 py-4 rounded-xl bg-accent-teal text-white font-bold text-lg hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-accent-teal/20"
                                        >
                                            {isProcessingPayment ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Processing Payment...
                                                </>
                                            ) : (
                                                <>Confirm Payment</>
                                            )}
                                        </button>

                                        <button
                                            onClick={cancelPayment}
                                            className="flex-1 py-3 rounded-xl border border-border hover:bg-bg-secondary transition text-text-secondary font-semibold"
                                        >
                                            Cancel
                                        </button>
                                    </div>

                                    <p className="text-center text-xs text-text-secondary pt-2">
                                        By confirming, you agree to our Terms of Service and Privacy Policy
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <PaymentModal
                isOpen={modalState.isOpen}
                type={modalState.type}
                title={modalState.title}
                message={modalState.message}
                onClose={modalState.type !== 'loading' ? closeModal : undefined}
                onConfirm={modalState.type === 'success' ? () => router.push('/') : undefined}
                showConfirmButton={modalState.showConfirmButton}
                confirmText={modalState.type === 'success' ? 'Done' : 'Try Again'}
            />

            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-green/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-teal/5 blur-[120px] rounded-full" />
            </div>

            {/* Header - FIXED - Now won't scroll */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-xl border-b border-border px-6 pt-4 pb-6 shadow-2xl">
                <div className="w-[90%] max-w-[1800px] mx-auto flex items-center justify-between">
                    <Link
                        href="/premium-courses"
                        className="flex items-center gap-2 text-text-secondary hover:text-accent-teal transition-colors font-semibold group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Back to Courses</span>
                    </Link>

                    <div className="text-center">
                        <h1 className="font-cinzel text-lg sm:text-xl font-bold tracking-[2px] text-accent-teal">
                            Course Details
                        </h1>
                    </div>

                    <Link href="/" className="text-text-secondary hover:text-accent-teal font-semibold text-sm">
                        Home
                    </Link>
                </div>
            </header>

            {/* Add padding-top to account for fixed header */}
            <div className="relative z-10 pt-20 pb-12 px-8">
                <div className="w-[90%] max-w-[1800px] mx-auto">

                    <div className="relative text-center mb-16 rounded-3xl p-10 border border-border overflow-hidden">
                        {/* Background Image - Only for this section */}
                        {course.thumbnailImgUrl && (
                            <>
                                <div className="absolute inset-0 z-0">
                                    <div className="absolute inset-0">
                                        <Image
                                            src={getFullImageUrl(course.thumbnailImgUrl)}
                                            alt={course.title}
                                            fill
                                            className="object-cover opacity-20"
                                            sizes="100vw"
                                            priority
                                            quality={50}
                                        />
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/90 via-bg-primary/70 to-bg-primary/95" />
                                </div>

                            </>
                        )}

                        {/* Content - Above the background */}
                        <div className="relative z-10">
                            {course.courseKey && (
                                <p className="text-sm uppercase tracking-[0.3em] font-black text-accent-teal mb-6">
                                    {course.courseKey}
                                </p>
                            )}

                            <h1 className="text-3xl md:text-5xl font-black mb-6 bg-gradient-to-r from-accent-teal via-accent-teal to-accent-gold bg-clip-text text-transparent">
                                {course.title}
                            </h1>

                            <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
                                {course.shortDescription}
                            </p>

                            {/* Featured Image - Smaller and above price */}
                            {hasThumbnail && (
                                <div className="max-w-2xl mx-auto mb-8 rounded-2xl overflow-hidden border border-border shadow-[0_0_40px_rgba(20,184,166,0.2)]">
                                    <div className="relative w-full pt-[56.25%] bg-bg-secondary/80">
                                        <Image
                                            src={getFullImageUrl(course.thumbnailImgUrl) || '/noimage.webp'}
                                            alt={course.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
                                <div className="flex items-center gap-3">
                                    {course.discountPrice < course.price ? (
                                        <>
                                            <span className="text-4xl font-black text-accent-teal">₹{course.discountPrice}</span>
                                            <span className="text-2xl text-text-secondary line-through">₹{course.price}</span>
                                        </>
                                    ) : (
                                        <span className="text-4xl font-black text-accent-teal">₹{course.price}</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                {/* Only show demo button if first level exists and is accessible */}
                                {isFirstModulePreview && (
                                    <button
                                        onClick={handleStartFreeDemo}
                                        className="bg-accent-teal text-white font-black py-4 px-10 rounded-xl text-base hover:bg-accent-teal/90 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(20,184,166,0.3)]"
                                    >
                                        {isFirstModuleTestCompleted ? 'Review Free Demo (Level 1)' : 'Start Free Demo (Level 1)'}
                                    </button>
                                )}

                                {/* Only show Pay Now button if user hasn't purchased */}
                                {!hasCourseAccess && (
                                    <button
                                        onClick={handlePayment}
                                        disabled={isProcessingPayment || isCheckingPurchase}
                                        className="border-2 border-accent-gold text-accent-gold font-black py-4 px-10 rounded-xl text-base hover:bg-accent-gold hover:text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                    >
                                        {isProcessingPayment || isCheckingPurchase ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                {isCheckingPurchase ? 'Checking...' : 'Processing...'}
                                            </>
                                        ) : (
                                            'Pay Now'
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Course Levels Section */}
                    {modules.length > 0 && (
                        <div id="course-levels-section" className="mb-16">
                            <div className="text-center mb-12">
                                <h4 className="font-cinzel text-4xl md:text-4xl font-bold mb-6">
                                    Course Levels
                                </h4>
                                <p className="text-text-secondary text-lg max-w-[600px] mx-auto">
                                    Complete each level with 100% quiz score to unlock the next
                                </p>

                                {/* Levels Count and Pagination Info */}
                                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-text-secondary">
                                    <div className="bg-bg-secondary px-4 py-2 rounded-lg border border-border">
                                        Total Levels: <span className="font-bold text-accent-teal">{totalLevels}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
                                {currentLevels.map((module: CourseModule, index: number) => {
                                    const levelState = getLevelState(module, index);
                                    const levelNumber = startIndex + index + 1; // Calculate actual level number with pagination

                                    return (
                                        <div
                                            key={module.id}
                                            className={`relative rounded-2xl p-6 text-center transition-all duration-300
                                                ${levelState.isUnlocked
                                                    ? levelState.isCompleted
                                                        ? 'bg-bg-card border-2 border-border shadow-[0_0_20px_rgba(20,184,166,0.1)]'
                                                        : 'bg-bg-card border-2 border-accent-teal shadow-[0_0_30px_rgba(20,184,166,0.15)] hover:shadow-[0_0_50px_rgba(20,184,166,0.25)] cursor-pointer'
                                                    : 'bg-bg-card/40 border-2 border-border opacity-60 shadow-[0_0_20px_rgba(0,0,0,0.1)]'
                                                }`}
                                        >
                                            {/* FREE badge for preview levels */}
                                            {module.isPreview === true && (
                                                <span className="absolute top-3 right-3 bg-accent-teal text-white text-[10px] font-black px-3 py-1 rounded-full tracking-wider">
                                                    FREE
                                                </span>
                                            )}

                                            {/* Completed badge */}
                                            {levelState.isCompleted && (
                                                <span className="absolute top-3 right-3 bg-accent-gold/20 text-accent-gold text-[10px] font-black px-3 py-1 rounded-full tracking-wider border border-accent-gold/30">
                                                    COMPLETED
                                                </span>
                                            )}

                                            {/* Icon */}
                                            <div
                                                className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center
                                                    ${levelState.isCompleted
                                                        ? 'bg-accent-gold/10 text-accent-gold'
                                                        : levelState.isUnlocked
                                                            ? 'bg-accent-teal/10 text-accent-teal shadow-[0_0_20px_rgba(20,184,166,0.1)]'
                                                            : 'bg-bg-secondary text-text-secondary'
                                                    }`}
                                            >
                                                {levelState.isCompleted ? (
                                                    <CheckCircle className="w-6 h-6" />
                                                ) : levelState.isUnlocked ? (
                                                    <PlayCircle className="w-6 h-6" />
                                                ) : (
                                                    <Lock className="w-6 h-6" />
                                                )}
                                            </div>

                                            {/* Level Number */}
                                            <h2 className="text-3xl font-bold text-text-primary mb-1">
                                                {levelNumber}
                                            </h2>

                                            {/* Title */}
                                            <p className="text-sm text-text-secondary mb-2 line-clamp-2 min-h-[2.5rem]">
                                                {module.title}
                                            </p>

                                            {/* Lesson Count */}
                                            <p className="text-xs text-text-secondary/60 mb-4">
                                                {module.lessons.length} Lesson{module.lessons.length !== 1 ? 's' : ''}
                                            </p>

                                            {/* Access Status Info */}
                                            <div className="text-xs mb-3">
                                                {module.isPreview === true ? (
                                                    <span className="text-accent-teal">✓ Free Preview</span>
                                                ) : module.isAccess === true ? (
                                                    module.isTestCompleted === true ? (
                                                        <span className="text-accent-teal">✓ Test Completed</span>
                                                    ) : (
                                                        <span className="text-accent-gold">Test Pending</span>
                                                    )
                                                ) : (
                                                    <span className="text-text-secondary">Access Required</span>
                                                )}
                                            </div>

                                            {/* CTA Button */}
                                            {levelState.isUnlocked && !levelState.isCompleted ? (
                                                <button
                                                    onClick={() => router.push(`/premium-courses/${courseNumber}/level-${module.id}`)}
                                                    className="w-full bg-accent-teal hover:bg-accent-teal/90 text-white font-black py-3 px-4 rounded-lg transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)]"
                                                >
                                                    {levelState.label}
                                                </button>
                                            ) : levelState.isCompleted ? (
                                                <button
                                                    onClick={() => router.push(`/premium-courses/${courseNumber}/level-${module.id}?review=true`)}
                                                    className="w-full bg-accent-gold/20 hover:bg-accent-gold/30 text-accent-gold font-black py-3 px-4 rounded-lg transition-all border border-accent-gold/40"
                                                >
                                                    Review Level
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="w-full bg-bg-secondary text-text-secondary/40 font-black py-3 px-4 rounded-lg cursor-not-allowed"
                                                >
                                                    {levelState.label}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Pagination Component - Only show if there are multiple pages */}
                            {totalPages > 1 && (
                                <div className="flex justify-center mt-8">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}