'use client'

import { useState } from 'react'
import { Rocket, User, Phone, Globe, BarChart2, Layers, Briefcase, Zap, Loader2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import ApiService from '@/services/ApiService'
import { EnrollmentData, MarketType, TradingType, ExperienceLevel, InterestedProduct } from '@/types'

export default function Enrollment() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Add state for validation errors
  const [validationErrors, setValidationErrors] = useState<{
    fullName: string;
    mobileNumber: string;
  }>({
    fullName: '',
    mobileNumber: ''
  })

  const [formData, setFormData] = useState<EnrollmentData>({
    fullName: '',
    mobileNumber: '',
    marketType: 'INDIAN_MARKET',
    tradingType: 'INTRADAY',
    segments: 'EQUITY_CASH',
    experienceLevel: 'BEGINNER',
    interestedProduct: 'PREMIUM_INDICATORS',
    activeStatus: true,
    courseId: 0,
    createdById: user?.id || 0
  })

  // Validate mobile number
  const validateMobileNumber = (mobile: string): string => {
    if (!mobile) return 'Mobile number is required'
    if (mobile.length !== 10) return 'Mobile number must be 10 digits'
    if (!/^\d+$/.test(mobile)) return 'Mobile number must contain only digits'
    return ''
  }

  // Validate name
  const validateName = (name: string): string => {
    if (!name.trim()) return 'Full name is required'
    if (name.trim().length < 2) return 'Name must be at least 2 characters'
    return ''
  }

  // Clear specific validation error when field changes
  const handleNameChange = (value: string) => {
    setFormData({ ...formData, fullName: value })
    if (validationErrors.fullName) {
      const error = validateName(value)
      setValidationErrors(prev => ({ ...prev, fullName: error }))
    }
  }

  const handleMobileChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    if (numericValue.length <= 10) {
      setFormData({ ...formData, mobileNumber: numericValue })
      if (validationErrors.mobileNumber) {
        const error = validateMobileNumber(numericValue)
        setValidationErrors(prev => ({ ...prev, mobileNumber: error }))
      }
    }
  }

  // Validate all fields before submission
  const validateForm = (): boolean => {
    const nameError = validateName(formData.fullName)
    const mobileError = validateMobileNumber(formData.mobileNumber)
    
    setValidationErrors({
      fullName: nameError,
      mobileNumber: mobileError
    })

    return !nameError && !mobileError
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await ApiService.addEnrollment({
        ...formData,
        createdById: user?.id || 0
      })
      setSuccess(true)
      // Reset form on success
      setFormData({
        fullName: '',
        mobileNumber: '',
        marketType: 'INDIAN_MARKET',
        tradingType: 'INTRADAY',
        segments: 'EQUITY_CASH',
        experienceLevel: 'BEGINNER',
        interestedProduct: 'PREMIUM_INDICATORS',
        activeStatus: true,
        courseId: 0,
        createdById: user?.id || 0
      })
      // Clear validation errors on success
      setValidationErrors({
        fullName: '',
        mobileNumber: ''
      })
    } catch (err: unknown) {
      console.error('Enrollment failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="enroll" className="py-24 px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="text-sm text-accent-gold uppercase tracking-[4px] mb-4 font-bold">Get Started</div>
          <h2 className="font-cinzel text-5xl md:text-6xl font-black mb-8">
            Enroll <span className="text-accent-gold">Today</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-[700px] mx-auto leading-relaxed">
            Fill out the form below and our team will contact you with the best trading solutions tailored to your needs.
          </p>
        </div>

        <div className="max-w-[900px] mx-auto">
          <div className="bg-bg-card border-2 border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
            {/* Form Header */}
            <div className="text-center mb-12">
              <div className="inline-flex p-4 bg-accent-gold/10 rounded-2xl mb-6 ring-1 ring-accent-gold/20">
                <Rocket className="w-10 h-10 text-accent-gold" />
              </div>
              <h3 className="text-3xl font-bold mb-3 font-cinzel">Enrollment Form</h3>
              <p className="text-text-secondary font-medium">Complete the form and get instant access to our premium trading tools</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {success && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-2xl p-6 text-green-400 text-center font-bold">
                  Registration Successful! Our team will contact you shortly.
                </div>
              )}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-6 text-red-500 text-center font-bold">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-accent-gold ml-1">Full Name  <span className="relative -top-1 ">*</span></label>
                  <div className="relative group/input">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className={`w-full bg-bg-secondary border-2 rounded-2xl px-12 py-4 focus:outline-none transition-all duration-300 placeholder:text-text-secondary/50 font-medium
                        ${validationErrors.fullName 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-border focus:border-accent-gold'
                        }`}
                     
                      value={formData.fullName}
                      maxLength={50}
                      onChange={(e) => handleNameChange(e.target.value)}
                    />
                  </div>
                  {/* {validationErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1 ml-1">{validationErrors.fullName}</p>
                  )} */}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-accent-gold ml-1">Phone Number <span className="relative -top-1"> *</span></label>
                  <div className="relative group/input">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      className={`w-full bg-bg-secondary border-2 rounded-2xl px-12 py-4 focus:outline-none transition-all duration-300 placeholder:text-text-secondary/50 font-medium
                        ${validationErrors.mobileNumber 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-border focus:border-accent-gold'
                        }`}
                 
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={formData.mobileNumber}
                      onChange={(e) => handleMobileChange(e.target.value)}
                    />
                  </div>
                  {/* {validationErrors.mobileNumber ? (
                    <p className="text-red-500 text-xs mt-1 ml-1">{validationErrors.mobileNumber}</p>
                  ) : (
                    <p className="text-text-secondary/60 text-xs mt-1 ml-1">Enter 10-digit mobile number</p>
                  )} */}
                </div>

                {/* Market */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-accent-gold ml-1">Select Market <span className="relative -top-1">*</span></label>
                  <div className="relative group/input">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                    <select
                      className="w-full bg-bg-secondary border-2 border-border rounded-2xl px-12 py-4 focus:border-accent-gold focus:outline-none transition-all duration-300 appearance-none font-medium text-text-primary uppercase text-sm tracking-widest"
                      value={formData.marketType}
                      onChange={(e) => setFormData({ ...formData, marketType: e.target.value as MarketType })}
                    >
                      <option value="INDIAN_MARKET">Indian Market</option>
                      <option value="GLOBAL_MARKET">Global Market</option>
                    </select>
                  </div>
                </div>

                {/* Style */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-accent-gold ml-1">Trading Style <span className="relative -top-1">*</span></label>
                  <div className="relative group/input">
                    <BarChart2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                    <select
                      className="w-full bg-bg-secondary border-2 border-border rounded-2xl px-12 py-4 focus:border-accent-gold focus:outline-none transition-all duration-300 appearance-none font-medium text-text-primary uppercase text-sm tracking-widest"
                      value={formData.tradingType}
                      onChange={(e) => setFormData({ ...formData, tradingType: e.target.value as TradingType })}
                    >
                      <option value="INTRADAY">Intraday</option>
                      <option value="SCALPING">Scalping</option>
                      <option value="SWING">Swing</option>
                      <option value="INVESTING">Investing</option>
                    </select>
                  </div>
                </div>

                {/* Segment */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-accent-gold ml-1">Market Segment <span className="relative -top-1 ">*</span></label>
                  <div className="relative group/input">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                    <select
                      className="w-full bg-bg-secondary border-2 border-border rounded-2xl px-12 py-4 focus:border-accent-gold focus:outline-none transition-all duration-300 appearance-none font-medium text-text-primary uppercase text-sm tracking-widest"
                      value={formData.segments}
                      onChange={(e) => setFormData({ ...formData, segments: e.target.value })}
                    >
                      <option value="EQUITY_CASH">Equity / Cash</option>
                      <option value="OPTIONS">Options</option>
                      <option value="FUTURES">Futures</option>
                      <option value="COMMODITY">Commodity</option>
                    </select>
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-accent-gold ml-1">Experience Level <span className="relative -top-1">*</span></label>
                  <div className="relative group/input">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                    <select
                      className="w-full bg-bg-secondary border-2 border-border rounded-2xl px-12 py-4 focus:border-accent-gold focus:outline-none transition-all duration-300 appearance-none font-medium text-text-primary uppercase text-sm tracking-widest"
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as ExperienceLevel })}
                    >
                      <option value="BEGINNER">Beginner (0-1 Year)</option>
                      <option value="INTERMEDIATE">Intermediate (1-3 Years)</option>
                      <option value="ADVANCED">Advanced (3+ Years)</option>
                      <option value="EXPERT">Expert (5+ Years)</option>
                    </select>
                  </div>
                </div>

                {/* Product */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-accent-gold ml-1">Interested Product <span className="relative -top-1 ">*</span></label>
                  <div className="relative group/input">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within/input:text-accent-gold transition-colors" />
                    <select
                      className="w-full bg-bg-secondary border-2 border-border rounded-2xl px-12 py-4 focus:border-accent-gold focus:outline-none transition-all duration-300 appearance-none font-medium text-text-primary uppercase text-sm tracking-widest"
                      value={formData.interestedProduct}
                      onChange={(e) => setFormData({ ...formData, interestedProduct: e.target.value as InterestedProduct })}
                    >
                      <option value="PREMIUM_INDICATORS">Premium Indicators</option>
                      <option value="TRADING_COURSES">Advanced Courses</option>
                      <option value="MENTORSHIP">Personal Mentorship</option>
                      <option value="ALL">Complete Suite (All)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="
                  w-full group relative flex items-center justify-center gap-3
                  bg-accent-gold text-bg-primary
                  py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em]
                  shadow-xl shadow-accent-gold/20
                  transition-all duration-300 ease-out
                  hover:shadow-2xl hover:shadow-accent-gold/40
                  hover:-translate-y-0.5
                  hover:bg-accent-gold/90
                  active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Rocket className="w-5 h-5" />
                  )}
                  {loading ? 'Submitting...' : 'Submit Enrollment Application'}
                </button>
              </div>
            </form>
          </div>

          {/* Trust Footer */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-text-secondary">
            <span className="flex items-center gap-2 saturate-0 opacity-50"><Zap className="w-4 h-4" /> Instant Response</span>
            <span className="flex items-center gap-2 saturate-0 opacity-50"><Layers className="w-4 h-4" /> Personalized Plan</span>
            <span className="flex items-center gap-2 saturate-0 opacity-50"><Briefcase className="w-4 h-4" /> Expert Advisory</span>
          </div>
        </div>
      </div>
    </section>
  )
}