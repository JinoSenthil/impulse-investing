'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Rocket, ArrowLeft, ShieldCheck, MessageCircle, ChevronDown, User, Phone, Globe, BarChart2, Layers, Briefcase, Zap, Loader2 } from 'lucide-react'
import Navigation from '@/components/ui/Navigation'
import Footer from '@/components/ui/Footer'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import ApiService from '@/services/ApiService'
import { EnrollmentData, MarketType, TradingType, ExperienceLevel, InterestedProduct } from '@/types'

function EnrollmentFormContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialCourseId = searchParams.get('courseId')
    const { user, isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const [formData, setFormData] = useState<EnrollmentData>({
        fullName: '',
        mobileNumber: '',
        marketType: 'INDIAN_MARKET',
        tradingType: 'INTRADAY',
        segments: 'EQUITY_CASH',
        experienceLevel: 'BEGINNER',
        interestedProduct: 'PREMIUM_INDICATORS',
        activeStatus: true,
        courseId: initialCourseId ? parseInt(initialCourseId) : 0,
        createdById: user?.id || 0
    })

    // Auto-fill and Protection
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=/enroll')
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

    if (authLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-accent-gold animate-spin" />
            </div>
        )
    }

    if (!isAuthenticated) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await ApiService.addEnrollment({
                ...formData,
                createdById: user?.id || 0
            })
            setIsSubmitted(true)
        } catch (err: unknown) {
            console.error('Enrollment failed:', err)
            const errorMessage = err instanceof Error ? err.message : 'Submission failed. Please try again.'
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
                    <div className="w-16 h-16 bg-accent-gold/10 rounded-2xl flex items-center justify-center mb-8 ring-1 ring-accent-gold/20">
                        <Rocket size={32} className="text-accent-gold" />
                    </div>
                    <h1 className="font-cinzel text-4xl font-bold mb-6">
                        Enrollment <span className="text-accent-gold">Form</span>
                    </h1>
                    <p className="text-text-secondary mb-10 leading-relaxed font-medium">
                        Complete the form and get instant access to our premium trading tools and institutional-grade education.
                    </p>

                    <ul className="space-y-5">
                        {[
                            'Instant Course Access',
                            'Premium Indicators Pro',
                            'Discord Community Access',
                            'Weekly Live Q&A Sessions'
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-4 text-sm font-bold text-text-primary group">
                                <div className="p-1 bg-accent-green/10 rounded-full group-hover:bg-accent-green/20 transition-colors">
                                    <ShieldCheck size={18} className="text-accent-green" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-12 pt-8 border-t border-border relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-bg-card bg-bg-secondary flex items-center justify-center overflow-hidden relative shadow-lg">
                                    <Image src={`/course${i}.png`} alt="User" fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="text-sm font-black text-text-primary uppercase tracking-widest">Join 15K+ Traders</p>
                            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Growing Community</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Area */}
            <div className="lg:col-span-7 p-8 lg:p-12 relative">
                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold ml-1">Full Name</label>
                            <div className="relative group/input">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Enter your name"
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

                        {/* Market & Style */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold ml-1">Market</label>
                                <div className="relative group/input">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                                    <select
                                        className={inputClasses}
                                        required
                                        value={formData.marketType}
                                        onChange={e => setFormData({ ...formData, marketType: e.target.value as MarketType })}
                                    >
                                        <option value="INDIAN_MARKET">Indian Market</option>
                                        <option value="GLOBAL_MARKET">Global Market</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none group-focus-within/input:text-accent-gold transition-colors" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold ml-1">Style</label>
                                <div className="relative group/input">
                                    <BarChart2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                                    <select
                                        className={inputClasses}
                                        required
                                        value={formData.tradingType}
                                        onChange={e => setFormData({ ...formData, tradingType: e.target.value as TradingType })}
                                    >
                                        <option value="INTRADAY">Intraday</option>
                                        <option value="SCALPING">Scalping</option>
                                        <option value="SWING">Swing</option>
                                        <option value="INVESTING">Investing</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none group-focus-within/input:text-accent-gold transition-colors" size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Segment & Experience */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold ml-1">Segment</label>
                                <div className="relative group/input">
                                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                                    <select
                                        className={inputClasses}
                                        required
                                        value={formData.segments}
                                        onChange={e => setFormData({ ...formData, segments: e.target.value })}
                                    >
                                        <option value="EQUITY_CASH">Equity / Cash</option>
                                        <option value="OPTIONS">Options</option>
                                        <option value="FUTURES">Futures</option>
                                        <option value="COMMODITY">Commodity</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none group-focus-within/input:text-accent-gold transition-colors" size={18} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold ml-1">Experience</label>
                                <div className="relative group/input">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                                    <select
                                        className={inputClasses}
                                        required
                                        value={formData.experienceLevel}
                                        onChange={e => setFormData({ ...formData, experienceLevel: e.target.value as ExperienceLevel })}
                                    >
                                        <option value="BEGINNER">Beginner (0-1 Year)</option>
                                        <option value="INTERMEDIATE">Intermediate (1-3 Years)</option>
                                        <option value="ADVANCED">Advanced (3+ Years)</option>
                                        <option value="EXPERT">Expert (5+ Years)</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none group-focus-within/input:text-accent-gold transition-colors" size={18} />
                                </div>
                            </div>
                        </div>

                        {/* Product */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-gold ml-1">Product Interests</label>
                            <div className="relative group/input">
                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                                <select
                                    className={inputClasses}
                                    required
                                    value={formData.interestedProduct}
                                    onChange={e => setFormData({ ...formData, interestedProduct: e.target.value as InterestedProduct })}
                                >
                                    <option value="PREMIUM_INDICATORS">Premium Indicators</option>
                                    <option value="TRADING_COURSES">Advanced Courses</option>
                                    <option value="MENTORSHIP">Mentorship</option>
                                    <option value="ALL">All Products</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none group-focus-within/input:text-accent-gold transition-colors" size={18} />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 text-red-500 text-center font-bold text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative flex items-center justify-center gap-3 bg-accent-gold text-bg-primary py-5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-accent-gold/20 hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Rocket size={20} fill="currentColor" />}
                                {loading ? 'Processing...' : 'Complete Enrollment'}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-12 px-4">
                        <div className="w-24 h-24 bg-accent-green/10 rounded-full flex items-center justify-center ring-4 ring-accent-green/20 animate-pulse">
                            <ShieldCheck size={48} className="text-accent-green" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-cinzel font-black">Success!</h2>
                            <p className="text-text-secondary leading-relaxed font-medium max-w-sm mx-auto">
                                Thanks for enrolling, <span className="text-text-primary font-bold">{formData.fullName}</span>. Our expert advisors will contact you shortly on your provided phone number.
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="px-10 py-4 bg-accent-gold text-bg-primary rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white transition-all duration-300 shadow-xl shadow-accent-gold/20"
                        >
                            Return Home
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function EnrollmentPage() {
    return (
        <div className="min-h-screen bg-bg-primary">
            <Navigation />

            <main className="pt-32 pb-24 px-6 sm:px-8 bg-[url('/grid-pattern.svg')] relative">
                {/* Background Glow */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent-gold/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-[1400px] mx-auto relative z-10">
                    <Link
                        href="/#courses"
                        className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-gold transition mb-12 uppercase tracking-[0.2em] text-[10px] font-black group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Cancel Enrollment
                    </Link>

                    <Suspense fallback={<div className="text-center text-accent-gold py-24 font-black tracking-widest uppercase">Initializing Secure Enrollment...</div>}>
                        <EnrollmentFormContent />
                    </Suspense>

                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
                        <div className="flex items-center gap-3 saturate-0 opacity-50">
                            <ShieldCheck size={16} className="text-accent-green" /> 256-bit SSL Encrypted
                        </div>
                        <div className="flex items-center gap-3 saturate-0 opacity-50">
                            <MessageCircle size={16} className="text-accent-gold" /> 24/7 Priority Support
                        </div>
                        <div className="flex items-center gap-3 saturate-0 opacity-50">
                            <Zap size={16} className="text-accent-gold" /> Instant Verification
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}
