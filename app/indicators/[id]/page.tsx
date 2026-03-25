'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Navigation from '@/components/ui/Navigation'
import Footer from '@/components/ui/Footer'
import { Indicator, IndicatorPurchase, Payment } from '@/types'
import {
    ChevronLeft,
    CheckCircle2,
    ArrowRight,
    Loader2,
    X,
    CreditCard,
    Wallet,
    Banknote,
    Smartphone,
    Shield,
    ChevronDown
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import ApiService from '@/services/ApiService'
import PaymentModal from '@/components/ui/PaymentModal'
import Link from 'next/link'
import GlobalLoading from '@/components/ui/GlobalLoading'

export default function IndicatorDetails() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const { user } = useSelector((state: RootState) => state.auth)
    const userId = user?.id

    const [indicator, setIndicator] = useState<Indicator | null>(null)
    const [loading, setLoading] = useState(true)
    const [enrollmentLoading, setEnrollmentLoading] = useState(true)
    const [paymentLoading, setPaymentLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // New state for enrollment status
    const [isEnrolled, setIsEnrolled] = useState(false)

    // Payment confirmation modal state
    const [showPaymentConfirm, setShowPaymentConfirm] = useState(false)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CREDIT_CARD')

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id) return

                setLoading(true)
                setEnrollmentLoading(true)

                // Fetch indicator data
                const indicatorData = await ApiService.getIndicatorById(Number(id))
                setIndicator(indicatorData)

                // Check enrollment status if user is logged in
                if (userId) {
                    await checkEnrollmentStatus(userId, indicatorData.id)
                }
            } catch (err) {
                console.log('Failed to fetch data:', err)
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
                setEnrollmentLoading(false)
            }
        }

        fetchData()
    }, [id, userId])

    // Function to check enrollment status
    const checkEnrollmentStatus = async (userId: number, indicatorId: number) => {
        try {
            const enrollments = await ApiService.getAllIndicatorEnrollments({
                userId: userId,
                indicatorId: indicatorId
            })

            // If there's at least one enrollment for this indicator, user is enrolled
            setIsEnrolled(enrollments.length > 0)
        } catch (error) {
            console.error('Error checking enrollment status:', error)
            // On error, assume not enrolled to avoid blocking user
            setIsEnrolled(false)
        }
    }

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

    const handlePayment = () => {
        if (!indicator) {
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Missing Information',
                message: 'Indicator data is missing.',
                showConfirmButton: true,
            });
            return;
        }

        if (!userId) {
            router.push(`/login?redirect=/indicators/${indicator.id}`);
            return;
        }

        // Check if already enrolled
        if (isEnrolled) {
            setModalState({
                isOpen: true,
                type: 'info',
                title: 'Already Enrolled',
                message: 'You have already enrolled in this indicator.',
                showConfirmButton: true,
            });
            return;
        }

        // Redirect to enrollment page with indicator ID as query parameter
        router.push(`/enrollIndicator?indicatorId=${indicator.id}`);
    }

    const confirmPayment = async () => {
        if (!indicator || !userId) {
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Missing Information',
                message: 'User or indicator information is missing.',
                showConfirmButton: true,
            })
            return
        }

        // Check if already enrolled before proceeding with payment
        if (isEnrolled) {
            setModalState({
                isOpen: true,
                type: 'info',
                title: 'Already Enrolled',
                message: 'You have already enrolled in this indicator.',
                showConfirmButton: true,
            })
            setShowPaymentConfirm(false)
            return
        }

        const amount = indicator.price
        setPaymentLoading(true)
        setShowPaymentConfirm(false)

        // Show loading modal
        setModalState({
            isOpen: true,
            type: 'loading',
            title: 'Processing Payment',
            message: 'Please wait while we process your payment...',
            showConfirmButton: false,
        })

        try {
            const now = new Date()
            const isoDateTime = now.toISOString()
            const dateOnly = now.toISOString().split('T')[0] // Format: YYYY-MM-DD

            // Step 1: Create Payment
            const paymentPayload: Partial<Payment> = {
                transactionId: `TXN-${Date.now()}-${userId}`,
                userId: userId,
                amount: amount,
                paymentStatus: 'PENDING',
                paymentMethod: selectedPaymentMethod,
                paymentDetail: 'USER_PAY_FOR_INDICATOR',
                createdDate: isoDateTime,
                modifiedDate: isoDateTime,
            }

            console.log('Creating payment with payload:', paymentPayload)
            const paymentData = await ApiService.createPayment(paymentPayload)

            if (!paymentData || !paymentData.id) {
                throw new Error('Payment creation failed - no payment ID returned')
            }

            console.log('Payment created successfully:', paymentData)

            // Step 2: Create Indicator Purchase
            const purchasePayload: Partial<IndicatorPurchase> = {
                userId: userId,
                indicatorId: indicator.id,
                amount: amount,
                purchaseDate: dateOnly, // Use date-only format
                createdDate: isoDateTime,
                modifiedDate: isoDateTime,
                paymentId: paymentData.id,
            }

            console.log('Creating indicator purchase with payload:', purchasePayload)
            await ApiService.createIndicatorPurchase(purchasePayload)

            console.log('Indicator purchase created successfully')

            setModalState({
                isOpen: true,
                type: 'success',
                title: 'Payment Successful!',
                message: 'Your indicator has been purchased successfully. You can start using it now.',
                showConfirmButton: true,
            })

            // Update enrollment status after successful payment
            setIsEnrolled(true)

            setTimeout(() => {
                router.push('/')
            }, 3000)

        }
        catch (error: unknown) {
            console.error('Payment error:', error)

            let errorMessage = 'We encountered an issue while processing your payment. Please try again.'

            if (error instanceof Error) {
                errorMessage = error.message
            } else if (typeof error === 'object' && error !== null) {
                const errorObj = error as Record<string, unknown>
                if (typeof errorObj.message === 'string') {
                    errorMessage = errorObj.message
                }
            }

            setModalState({
                isOpen: true,
                type: 'error',
                title: 'Payment Failed',
                message: errorMessage,
                showConfirmButton: true,
            })
        }
        finally {
            setPaymentLoading(false)
        }
    }

    const cancelPayment = () => {
        setShowPaymentConfirm(false)
        setSelectedPaymentMethod('CREDIT_CARD')
    }

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    // Helper to get full image URL
    const getImageUrl = (url: string | undefined) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        const base = process.env.NEXT_PUBLIC_API_URL_IMAGE || '';
        return base + url;
    };

    if (loading) {
        return <GlobalLoading />;
    }

    if (error || !indicator) {
        return (
            <div className="min-h-screen bg-bg-primary text-text-primary">
                <Navigation />
                <div className="pt-32 pb-24 px-6 max-w-5xl mx-auto text-center">
                    <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl mb-8">
                        <h1 className="text-2xl font-bold text-red-400 mb-4">Oops! Something went wrong</h1>
                        <p className="text-text-secondary">{error || 'Indicator not found'}</p>
                    </div>
                    <button
                        onClick={() => router.back()}
                        className="bg-white/5 hover:bg-white/10 px-8 py-3 rounded-xl transition"
                    >
                        Return to Indicators
                    </button>
                </div>
                <Footer />
            </div>
        )
    }

    // Function to render the appropriate button based on enrollment status
    const renderEnrollmentButton = () => {
        if (!userId) {
            return (
                <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-red-400 text-sm">
                        Please log in to purchase this indicator.
                    </p>
                    <Link
                        href="/login"
                        className="text-accent-gold hover:underline text-xs font-semibold mt-1 inline-block"
                    >
                        Click here to login
                    </Link>
                </div>
            )
        }

        if (enrollmentLoading) {
            return (
                <button
                    disabled
                    className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-accent-gold to-[#c5a059] text-bg-primary py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-accent-gold/20 flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
                >
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking Enrollment...
                </button>
            )
        }

        if (isEnrolled) {
            return (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-accent-green/10 to-accent-green/5 text-accent-green py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wider border border-accent-green/20 flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Already Enrolled
                    </div>
                    <p className="text-text-secondary text-sm text-center">
                        You have already enrolled in this indicator
                    </p>
                </div>
            )
        }

        return (
            <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className={`w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-accent-gold to-[#c5a059] text-bg-primary py-3 px-6 rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg shadow-accent-gold/20 hover:brightness-110 hover:scale-[1.02] transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
            >
                {paymentLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        Enroll Now <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </button>
        )
    }

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary">
            <Navigation />

            {/* Payment Confirmation Modal */}
            {showPaymentConfirm && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-bg-card border-2 border-border/50 rounded-3xl shadow-2xl w-full max-w-md md:max-w-lg overflow-hidden">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent-gold/10 rounded-lg">
                                    <Shield className="w-6 h-6 text-accent-gold" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Secure Payment</h3>
                                    <p className="text-text-secondary text-sm">Complete your purchase</p>
                                </div>
                            </div>
                            <button
                                onClick={cancelPayment}
                                className="p-2 hover:bg-white/10 rounded-lg transition"
                            >
                                <X className="w-5 h-5 text-text-secondary" />
                            </button>
                        </div>

                        <div className="">
                            <div className="p-6">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-bold text-white mb-1">SELECT PAYMENT METHOD</h4>
                                        <p className="text-text-secondary text-sm">Choose your preferred payment option</p>
                                    </div>

                                    {/* Payment Method Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={selectedPaymentMethod}
                                            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                                            className="w-full bg-white/5 border-2 border-border/50 rounded-xl py-3 px-4 text-white appearance-none focus:border-accent-gold focus:ring-2 focus:ring-accent-gold/20 focus:outline-none transition-all text-sm"
                                        >
                                            <option value="" disabled className="bg-bg-card text-white">
                                                Select a payment method
                                            </option>
                                            {paymentMethods.map((method) => (
                                                <option
                                                    key={method.id}
                                                    value={method.id}
                                                    className="bg-bg-card text-white py-2"
                                                >
                                                    {method.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <ChevronDown className="w-5 h-5 text-text-secondary" />
                                        </div>
                                    </div>

                                    {/* Selected Payment Method Details */}
                                    {selectedPaymentMethod && (
                                        <div className="bg-white/5 rounded-xl p-4 border border-accent-gold/20">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-2 bg-accent-gold/20 rounded-lg">
                                                    {(() => {
                                                        const method = paymentMethods.find(m => m.id === selectedPaymentMethod)
                                                        const Icon = method?.icon || CreditCard
                                                        return <Icon className="w-5 h-5 text-accent-gold" />
                                                    })()}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white text-sm">
                                                        {paymentMethods.find(m => m.id === selectedPaymentMethod)?.label}
                                                    </div>
                                                    <div className="text-xs text-text-secondary">Selected payment method</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="pt-4 flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={confirmPayment}
                                            disabled={paymentLoading || !selectedPaymentMethod}
                                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-accent-gold to-[#c5a059] text-bg-primary font-semibold text-base hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                        >
                                            {paymentLoading ? (
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
                                            className="flex-1 py-3 rounded-xl border border-border/50 hover:bg-white/5 transition text-text-secondary font-semibold text-sm"
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
                confirmText={
                    modalState.type === 'success'
                        ? 'Done'
                        : 'Try Again'
                }
            />

            <main className="pt-28 pb-16 px-4 md:px-8 w-[90%] max-w-[1400px] mx-auto">
                {/* Back Link */}
                <Link
                    href="/#indicators"
                    className="flex items-center gap-2 text-text-secondary hover:text-accent-gold transition mb-6 group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Back to Indicators</span>
                </Link>

                <div className="bg-bg-card border-2 border-border/50 rounded-3xl overflow-hidden shadow-xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 md:p-8">
                        {/* Left Side: Product Image/Visual */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
                                <div className="absolute inset-0 bg-accent-gold/20 blur-[40px] opacity-20 group-hover:opacity-30 transition-opacity rounded-2xl" />

                                <Image
                                    src={getImageUrl(indicator.imageUrl) || `/course${(indicator.id % 4) + 1}.png`}
                                    alt={indicator.title}
                                    fill
                                    className="object-cover rounded-2xl shadow-lg ring-1 ring-white/10"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </div>

                        {/* Right Side: Details */}
                        <div className="space-y-6 flex flex-col justify-center">
                            {/* Title and Premium Badge */}
                            <div>
                                <h1 className="font-cinzel text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
                                    {indicator.title}
                                </h1>
                                <div className="inline-flex items-center gap-2 bg-accent-gold/10 border border-accent-gold/20 px-4 py-2 rounded-full text-[10px] text-accent-gold font-bold uppercase tracking-widest mt-2">
                                    Premium Indicator
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">Current Price</div>
                                        <div className="text-3xl md:text-4xl font-bold text-accent-gold">₹{indicator.price}/-</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2 text-accent-green mb-1 justify-end">
                                            <Shield className="w-4 h-4" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-white">One-time Payment</span>
                                        </div>
                                        <div className="text-[10px] text-text-secondary">Includes Lifetime Support</div>
                                    </div>
                                </div>
                            </div>

                            {/* Enrollment Button */}
                            <div className="space-y-4">
                                {renderEnrollmentButton()}

                                <div className="flex items-center gap-4 justify-center sm:justify-start">
                                    <div className="flex items-center gap-1.5 opacity-60">
                                        <CheckCircle2 className="w-4 h-4 text-accent-green" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Instant Access</span>
                                    </div>
                                    <div className="w-1 h-1 bg-white/20 rounded-full" />
                                    <div className="flex items-center gap-1.5 opacity-60">
                                        <CheckCircle2 className="w-4 h-4 text-accent-green" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">Setup Guide</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Section at bottom */}
                    <div className="border-t border-border/50 p-6 md:p-10 bg-gradient-to-b from-white/[0.02] to-transparent">
                        <div className="w-full">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                                <span className="w-8 h-1 bg-accent-gold rounded-full" />
                                About this Indicator
                            </h2>
                            <p className="text-text-secondary text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                                {indicator.description}
                            </p>

                            {/* Features list */}
                            <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-accent-gold/5 border border-accent-gold/10 rounded-2xl">
                                    <p className="text-sm font-semibold text-white mb-1">Support & Guidance</p>
                                    <p className="text-xs text-text-secondary">Every purchase comes with a comprehensive video setup guide and lifetime priority support from our technical experts.</p>
                                </div>
                                <div className="p-4 bg-accent-gold/5 border border-accent-gold/10 rounded-2xl">
                                    <p className="text-sm font-semibold text-white mb-1">Trading Edge</p>
                                    <p className="text-xs text-text-secondary">Designed to enhance your trading strategy with high-conviction signals and risk management tools.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disclaimer/Note */}
                <div className="mt-8 p-6 bg-accent-gold/5 rounded-2xl border border-accent-gold/10">
                    <p className="text-text-secondary text-sm text-center leading-relaxed italic opacity-70">
                        * Trading involves risk. Our indicators are designed to provide statistical edges but do not guarantee profits. Use with proper risk management.
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    )
}