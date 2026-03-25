'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  MessageCircle,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import ApiService from '@/services/ApiService'

import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { Enrollment } from '@/types'

export default function Demo() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    location: '',
    message: '',
  })

  const [fieldErrors, setFieldErrors] = useState({
    fullName: false,
    mobileNumber: false,
    location: false,
    message: false,
  })

  const [phoneError, setPhoneError] = useState<string | null>(null)

  const [hasBooked, setHasBooked] = useState(false)
  const [checkingBooking, setCheckingBooking] = useState(false)

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const checkExistingBooking = async () => {
      if (!user?.id) return

      try {
        setCheckingBooking(true)
        const enrollments = await ApiService.getAllIndicatorEnrollments({
          userId: user.id,
          enrollment: 'BOOK_FOR_DEMO'
        })

        if (enrollments && enrollments.length > 0) {
          setHasBooked(true)
        }
      } catch (err) {
        console.error('Failed to check existing bookings:', err)
      } finally {
        setCheckingBooking(false)
      }
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        mobileNumber: user.phoneNumber || ''
      }))
      checkExistingBooking()
    }
  }, [user])

  const validatePhone = (phone: string) => {
    if (phone.length === 0) return 'Phone number is required'
    if (phone.length !== 10) return 'Phone number must be 10 digits'
    if (!/^\d+$/.test(phone)) return 'Phone number must contain only digits'
    return null
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: false }))
    }

    // Special handling for phone validation
    if (field === 'mobileNumber') {
      const phoneError = validatePhone(value)
      setPhoneError(phoneError)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (hasBooked) return

    // Reset all errors
    setError(null)
    setPhoneError(null)

    // Validate all fields
    const newFieldErrors = {
      fullName: !formData.fullName.trim(),
      mobileNumber: !formData.mobileNumber.trim(),
      location: !formData.location.trim(),
      message: !formData.message.trim(),
    }

    // Validate phone specifically
    const phoneValidationError = validatePhone(formData.mobileNumber)

    // Set all errors at once
    setFieldErrors(newFieldErrors)
    setPhoneError(phoneValidationError)

    // Check if there are any errors
    const hasFieldErrors = Object.values(newFieldErrors).some(error => error)
    const hasPhoneValidationError = phoneValidationError !== null

    if (hasFieldErrors || hasPhoneValidationError) {
      // If there are errors, don't submit
      console.log('Please fill in all required fields correctly.')
      return
    }

    // If no errors, proceed with submission
    setLoading(true)
    setSuccess(false)
    console.log('Form Data Submitted:', formData)

    try {
      // Call Indicator Enrollment API
      await ApiService.createIndicatorEnrollment({
        id: 0,
        indicatorId: null,
        createdById: user?.id || 0,
        fullName: formData.fullName,
        mobileNumber: formData.mobileNumber,
        location: formData.location,
        message: formData.message,
        enrollment: 'BOOK_FOR_DEMO' as Enrollment,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        activeStatus: true
      })

      // On success
      setSuccess(true)
      setHasBooked(true)
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 5000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      id="demo"
      className="relative min-h-screen bg-bg-primary text-text-primary px-8 py-16 md:py-20 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block mb-4 px-6 py-2 rounded-full bg-accent-gold/10 border border-accent-gold/40 text-accent-gold text-xs font-black tracking-widest">
            LIMITED TIME OFFER
          </span>

          <h3 className="font-cinzel text-xl md:text-3xl lg:text-4xl font-black mb-4 text-text-primary">
            BOOK YOUR
            <span className="font-cinzel text-2xl md:text-5xl font-bold uppercase tracking-[3px] text-accent-gold select-none drop-shadow-sm ml-2">
              2-DAY FREE
            </span>
            INDICATOR DEMO
          </h3>

          <p className="text-text-secondary max-w-[700px] mx-auto text-base font-medium">
            Experience the power of our premium trading indicators for 48 hours.
            Fill out the form below to get started!
          </p>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center justify-center">
          {/* Form */}
          <div className="bg-bg-card border-2 border-border rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-xl">

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black tracking-widest text-text-primary uppercase">
                  <User className="w-5 h-5 text-accent-gold" />
                  Full Name
                  <span className="text-accent-gold"> *</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Full Name"
                    className={`w-full bg-bg-primary border-2 rounded-2xl px-5 py-4 focus:border-accent-gold outline-none transition placeholder-text-secondary/50 text-text-primary font-semibold ${fieldErrors.fullName ? 'border-red-500/50 focus:border-red-500' : 'border-border focus:border-accent-gold'}`}
                    value={formData.fullName}
                    maxLength={50}
                    onChange={(e) =>
                      handleInputChange('fullName', e.target.value)
                    }
                    disabled={hasBooked}

                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black tracking-widest text-text-primary uppercase">
                  <Phone className="w-5 h-5 text-accent-gold" />
                  Phone Number
                  <span className="text-accent-gold"> *</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className={`w-full bg-bg-primary border-2 rounded-2xl px-5 py-4 outline-none transition placeholder-text-secondary/50 text-text-primary font-semibold ${fieldErrors.mobileNumber || phoneError ? 'border-red-500/50 focus:border-red-500' : 'border-border focus:border-accent-gold'}`}
                    value={formData.mobileNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      handleInputChange('mobileNumber', val)
                    }}
                    disabled={hasBooked}

                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black tracking-widest text-text-primary uppercase">
                  <MapPin className="w-5 h-5 text-accent-gold" />
                  Location / City
                  <span className="text-accent-gold"> *</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Your Location"
                    className={`w-full bg-bg-primary border-2 rounded-2xl px-5 py-4 focus:border-accent-gold outline-none transition placeholder-text-secondary/50 text-text-primary font-semibold ${fieldErrors.location ? 'border-red-500/50 focus:border-red-500' : 'border-border focus:border-accent-gold'}`}
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange('location', e.target.value)
                    }
                    disabled={hasBooked}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black tracking-widest text-text-primary uppercase">
                  <MessageCircle className="w-5 h-5 text-accent-gold" />
                  Message
                  <span className="text-accent-gold"> *</span>
                </label>
                <div className="relative">
                  <textarea
                    placeholder="Tell us about your trading experience..."
                    rows={3}
                    className={`w-full bg-bg-primary border-2 rounded-2xl px-5 py-4 focus:border-accent-gold outline-none transition placeholder-text-secondary/50 text-text-primary font-semibold resize-none ${fieldErrors.message ? 'border-red-500/50 focus:border-red-500' : 'border-border focus:border-accent-gold'}`}
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange('message', e.target.value)
                    }
                    disabled={hasBooked}
                  />
                </div>
              </div>

              {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
              {success && <p className="text-accent-green text-xs font-bold">Successfully booked! We will contact you soon.</p>}
              {hasBooked && !success && <p className="text-accent-gold text-xs font-bold">You have already booked a demo. The admin team will contact you soon.</p>}

              {/* Button */}
              <button
                type="submit"
                disabled={loading || !user || hasBooked || checkingBooking}
                className="w-full flex items-center justify-center gap-3 bg-accent-gold text-white py-5 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition shadow-xl"
              >
                {loading || checkingBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                {loading || checkingBooking ? 'Processing...' : (!isMounted || !user ? 'Login to Book Demo' : (hasBooked ? 'Demo Already Booked' : 'Book My Free Demo'))}
              </button>
            </form>


            {/* Trust points */}
            <div className="mt-8 text-center text-text-secondary text-sm font-medium">
              <span>We respect your privacy. No spam, ever.</span>
            </div>

          </div>

          {/* Image + Details */}
          <div className="space-y-6">
            <div className="relative rounded-3xl border-2 border-border bg-bg-card p-4 shadow-2xl max-w-lg overflow-hidden">
              <Image
                src="/course3.png"
                alt="Indicator Demo"
                width={500}
                height={333}
                className="rounded-2xl object-cover w-full h-auto opacity-90"
                priority
              />
            </div>

            {/* What You Get */}
            <div className="bg-bg-card border-2 border-border rounded-3xl p-6 shadow-xl">
              <h4 className="text-lg font-black mb-4 text-accent-gold">
                What You Get in the Demo:
              </h4>

              <ul className="space-y-3 text-text-secondary text-sm font-bold">
                {[
                  'Full access to Hulk Scalper V3 Indicator',
                  'Real-time buy/sell signals for 48 hours',
                  'Personal onboarding call with our expert',
                  'Access to exclusive Telegram community',
                  'No payment required - 100% Free trial',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-gold mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}