'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, User, Phone, MapPin, MessageCircle, Zap, Loader2, Sparkles } from 'lucide-react'
import Navigation from '@/components/ui/Navigation'
import Footer from '@/components/ui/Footer'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import ApiService from '@/services/ApiService'
import { Indicator, Enrollment } from '@/types'

function IndicatorEnrollmentFormContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialIndicatorId = searchParams.get('indicatorId')
    const { user, isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth)

    const [loading, setLoading] = useState(false)
    const [indicatorLoading, setIndicatorLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [indicator, setIndicator] = useState<Indicator | null>(null)

    const [formData, setFormData] = useState({
        indicatorId: initialIndicatorId ? parseInt(initialIndicatorId) : 0,
        createdById: user?.id || 0,
        fullName: '',
        mobileNumber: '',
        location: '',
        message: '',
        activeStatus: true
    })

    // Fetch indicator details
    useEffect(() => {
        const fetchIndicator = async () => {
            if (!initialIndicatorId) return

            try {
                setIndicatorLoading(true)
                const indicatorData = await ApiService.getIndicatorById(parseInt(initialIndicatorId))
                setIndicator(indicatorData)
            } catch (err) {
                console.error('Failed to fetch indicator:', err)
                setError('Failed to load indicator details')
            } finally {
                setIndicatorLoading(false)
            }
        }

        fetchIndicator()
    }, [initialIndicatorId])

    // Auto-fill and Protection
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=/enroll/indicator')
            return
        }

        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: `${user.firstName} ${user.lastName}`.trim(),
                mobileNumber: user.phoneNumber || '',
                createdById: user.id
            }))
        }
    }, [user, isAuthenticated, authLoading, router])

    if (authLoading || indicatorLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-accent-gold animate-spin" />
            </div>
        )
    }

    if (!isAuthenticated) return null

    if (!initialIndicatorId) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">No Indicator Selected</h3>
                <p className="text-text-secondary mb-6">Please select an indicator to enroll in.</p>
                <Link
                    href="/#indicators"
                    className="inline-flex items-center gap-2 bg-accent-gold text-bg-primary px-6 py-3 rounded-xl font-bold hover:bg-white transition"
                >
                    Browse Indicators
                </Link>
            </div>
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const enrollmentPayload = {
                id: 0,
                indicatorId: formData.indicatorId,
                createdById: user?.id || 0,
                fullName: formData.fullName,
                mobileNumber: formData.mobileNumber,
                location: formData.location,
                message: formData.message,
                enrollment: 'INDICATOR' as Enrollment,
                createdDate: new Date().toISOString(),
                modifiedDate: new Date().toISOString(),
                activeStatus: true
            }

            console.log('Sending enrollment payload:', enrollmentPayload)

            await ApiService.createIndicatorEnrollment(enrollmentPayload)

            setIsSubmitted(true)

        } catch (err: unknown) {
            console.error('Indicator enrollment failed:', err)
            const errorMessage =
                err instanceof Error ? err.message : 'Submission failed. Please try again.'
            setError(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const inputClasses = "w-full bg-bg-secondary border-2 border-border rounded-2xl px-12 py-4 focus:border-accent-gold focus:outline-none transition-all duration-300 appearance-none font-medium text-text-primary placeholder:text-text-secondary/50"

    return (
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-12 bg-bg-card border-2 border-border rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            {/* Sidebar Info */}
            <div className="lg:col-span-5 bg-bg-secondary/50 p-8 lg:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(212,175,55,0.05)_0%,transparent_50%)]" />

                <div className="relative z-10">
                    <h1 className="font-cinzel text-4xl font-bold mb-6">
                        Premium Indicator <span className="text-accent-gold">Enrollment</span>
                    </h1>

                    {/* Indicator Name Display - Added here */}
                    {indicator && (
                        <div className="mb-6 p-5 bg-gradient-to-r from-accent-gold/10 to-accent-gold/5 rounded-2xl border border-accent-gold/20 shadow-lg">
                            <div className="flex items-center gap-3 mb-3">

                                <div>
                                    <div className="text-xs font-bold uppercase tracking-wider text-accent-gold/80">Selected Indicator</div>
                                    <h2 className="font-cinzel text-xl font-bold text-white">
                                        {indicator.title}
                                    </h2>
                                </div>
                            </div>
                            {indicator.price && (
                                <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl">

                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-accent-gold">₹{indicator.price}</span>
                                        <span className="text-text-secondary">/one-time</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    {/* <p className="text-text-secondary mb-10 leading-relaxed font-medium">
                        Get access to our institutional-grade trading indicators and join our exclusive community of successful traders.
                    </p> */}


                </div>

                <div className="mb-6 p-4 bg-gradient-to-r from-accent-gold/5 to-accent-gold/10 rounded-2xl border border-accent-gold/20">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-accent-gold rounded-full animate-pulse" />
                        <p className="text-sm font-bold text-text-primary">
                            <span className="text-accent-gold">Note:</span> Our team will contact you within 24 hours to complete your indicator setup
                        </p>
                    </div>
                </div>
            </div>

            {/* Form Area */}
            <div className="lg:col-span-7 p-8 lg:p-12 relative">
                {/* Indicator Name in Form Header - Alternative location */}


                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Indicator ID (Hidden) */}
                        <input
                            type="hidden"
                            name="indicatorId"
                            value={formData.indicatorId}
                            onChange={e => setFormData({ ...formData, indicatorId: parseInt(e.target.value) })}
                        />

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold ml-1">Full Name</label>
                            <div className="relative group/input">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Enter your full name"
                                    required
                                    className={inputClasses}
                                    value={formData.fullName}
                                    readOnly
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold ml-1">Phone Number</label>
                            <div className="relative group/input">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                                <span className="absolute left-11 top-1/2 -translate-y-1/2 font-bold text-text-secondary/50 border-r border-border pr-3">+91</span>
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    placeholder="XXXXX XXXXX"
                                    required
                                    maxLength={10}
                                    pattern="[0-9]{10}"
                                    className={`${inputClasses} pl-[4.5rem]`}
                                    value={formData.mobileNumber}
                                    readOnly
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) {
                                            setFormData({ ...formData, mobileNumber: val });
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold ml-1">Location / City (Optional)</label>
                            <div className="relative group/input">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                                <input
                                    type="text"
                                    name="location"
                                    placeholder="Enter your city"
                                    className={inputClasses}
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Message */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold ml-1">Message (Optional)</label>
                            <div className="relative group/input">
                                <MessageCircle className="absolute left-4 top-6 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                                <textarea
                                    name="message"
                                    placeholder="Any notes or requirements?"
                                    rows={3}
                                    className={`${inputClasses} py-4 h-32 resize-none`}
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 text-red-500 text-center font-bold text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-border">
                            <button
                                type="submit"
                                disabled={loading || !formData.indicatorId}
                                className="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-accent-gold to-[#d4af37] text-bg-primary py-5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-accent-gold/30 hover:shadow-2xl hover:shadow-accent-gold/40 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        <Zap size={20} fill="currentColor" />
                                        Complete Enrollment
                                    </>
                                )}
                            </button>

                            {!formData.indicatorId && (
                                <p className="text-center text-red-500 text-sm mt-2">
                                    Please select a valid indicator first
                                </p>
                            )}
                        </div>
                    </form>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-12 px-4">
                        <div className="relative">
                            <div className="w-28 h-28 bg-gradient-to-br from-accent-gold/20 to-accent-green/20 rounded-full flex items-center justify-center ring-8 ring-accent-green/10 animate-pulse">
                                <ShieldCheck size={52} className="text-accent-green" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-10 h-10 bg-accent-gold/20 rounded-full flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-accent-gold" />
                            </div>
                        </div>
                        <div className="space-y-4 max-w-md">
                            <h2 className="text-4xl font-cinzel font-black">Enrollment Successful!</h2>
                            <div className="p-4 bg-accent-gold/10 rounded-xl border border-accent-gold/20 mb-4">
                                <p className="text-text-secondary leading-relaxed font-medium">
                                    Thank you <span className="text-accent-gold font-bold">{formData.fullName}</span> for enrolling in
                                    <span className="text-white font-bold ml-2">{indicator?.title}</span>
                                </p>
                                {indicator?.price && (
                                    <p className="text-sm text-text-secondary mt-2">
                                        <span className="text-accent-gold font-bold">₹{indicator.price}</span>
                                    </p>
                                )}
                            </div>
                            <p className="text-text-secondary leading-relaxed font-medium">
                                Our technical team will contact you on <span className="text-white font-bold">{formData.mobileNumber}</span> shortly to set up your access.
                            </p>

                            <div className="pt-4">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-accent-gold to-[#d4af37] text-bg-primary rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white transition-all duration-300 shadow-xl shadow-accent-gold/20 hover:scale-[1.02]"
                                >
                                    Return to Dashboard
                                    <ArrowLeft className="w-4 h-4 rotate-180" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function IndicatorEnrollmentPage() {
    return (
        <div className="min-h-screen bg-bg-primary">
            <Navigation />

            <main className="pt-32 pb-24 px-6 sm:px-8 bg-[url('/grid-pattern.svg')] relative">
                {/* Background Glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent-gold/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-[1400px] mx-auto relative z-10">
                    <Link
                        href="/#indicators"
                        className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-gold transition mb-12 uppercase tracking-[0.2em] text-[10px] font-black group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Cancel Enrollment
                    </Link>

                    <Suspense fallback={
                        <div className="text-center text-accent-gold py-24 font-black tracking-widest uppercase">
                            <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" />
                            Loading Indicator Enrollment...
                        </div>
                    }>
                        <IndicatorEnrollmentFormContent />
                    </Suspense>

                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
                            <span className="opacity-70">Secure Payment Processing</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse" />
                            <span className="opacity-70">24/7 Technical Support</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-accent-gold rounded-full animate-pulse" />
                            <span className="opacity-70">30-Day Money Back Guarantee</span>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}