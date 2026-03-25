'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, MessageSquare, Send, Loader2 } from 'lucide-react'
import ApiService from '@/services/ApiService'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { ContactData, ContactUs } from '@/types'

export default function Contact() {
  const { user } = useSelector((state: RootState) => state.auth)
  console.log("User :", user)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // State for contact cards data
  const [contactCards, setContactCards] = useState<ContactUs[]>([])
  const [cardsLoading, setCardsLoading] = useState(true)

  const [formData, setFormData] = useState<ContactData>({
    name: '',
    email: '',
    mobileNumber: '',
    subject: '',
    message: ''
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})
  const [mobileError, setMobileError] = useState<string>('')

  // Fetch contact cards data on component mount
  useEffect(() => {
    fetchContactCards()
  }, [])

  const fetchContactCards = async () => {
    try {
      setCardsLoading(true)
      const data = await ApiService.getAllContactUs()
      setContactCards(data)
    } catch (err) {
      console.error('Failed to fetch contact cards:', err)
      setError('Failed to load contact information')
    } finally {
      setCardsLoading(false)
    }
  }

  // Function to get appropriate icon for each card
  const getIconForCard = (title: string) => {
    switch (title.toLowerCase()) {
      case 'email us':
        return <Mail className="w-8 h-8 text-accent-gold group-hover:text-accent-red transition-colors duration-300" />
      case 'call us':
        return <Phone className="w-8 h-8 text-accent-gold group-hover:text-accent-red transition-colors duration-300" />
      case 'whatsapp':
        return <MessageSquare className="w-8 h-8 text-accent-gold group-hover:text-accent-red transition-colors duration-300" />
      default:
        return <Mail className="w-8 h-8 text-accent-gold" />
    }
  }

  // Function to render contact details
  const renderContactDetails = (contacts: string[]) => {
    return contacts.map((contact, index) => (
      <p key={index} className="text-accent-gold">
        {contact}
      </p>
    ))
  }

  const validateForm = () => {
    const errors: Record<string, boolean> = {}
    let isValid = true

    // Check for empty required fields
    if (!formData.name.trim()) {
      errors.name = true
      isValid = false
    }
    if (!formData.email.trim()) {
      errors.email = true
      isValid = false
    }
    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = true
      isValid = false
    }
    if (!formData.subject.trim()) {
      errors.subject = true
      isValid = false
    }

    // Validate mobile number
    if (formData.mobileNumber.trim()) {
      if (formData.mobileNumber.length !== 10) {
        setMobileError('Mobile number must be 10 digits')
        isValid = false
      } else {
        setMobileError('')
      }
    }

    setFieldErrors(errors)
    return isValid
  }

  const handleFieldChange = (field: keyof ContactData, value: string) => {
    setFormData({ ...formData, [field]: value })

    // Clear field error when user starts typing
    if (fieldErrors[field] && value.trim()) {
      const newErrors = { ...fieldErrors }
      delete newErrors[field]
      setFieldErrors(newErrors)
    }

    // Clear mobile error when user starts typing
    if (field === 'mobileNumber' && mobileError) {
      setMobileError('')
    }
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
      await ApiService.createContact({
        id: 0,
        name: formData.name,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        subject: formData.subject,
        message: formData.message,
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString()
      })
      setSuccess(true)
      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 5000)

      // Reset form on success
      setFormData({
        name: '',
        email: '',
        mobileNumber: '',
        subject: '',
        message: ''
      })
      // Clear all errors
      setFieldErrors({})
      setMobileError('')
    } catch (err: unknown) {
      console.error('Contact form submission failed:', err)
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-20 px-6 bg-bg-primary relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[-10%] w-[35%] h-[35%] bg-accent-gold/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[20%] right-[-10%] w-[35%] h-[35%] bg-accent-teal/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-[90%] max-w-[1800px] mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="text-sm text-accent-gold uppercase tracking-[4px] mb-4 font-bold">Get in Touch</div>
          <h2 className="font-cinzel text-4xl md:text-6xl font-black mb-8 text-text-primary tracking-tight">
            Contact <span className="text-accent-gold">Us</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-[700px] mx-auto leading-relaxed font-medium">
            We&apos;re here to help you succeed in the markets. Reach out to our dedicated team of experts anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-8">
            {cardsLoading ? (
              // Loading state for cards
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-bg-card border-2 border-border rounded-3xl p-8 animate-pulse"
                >
                  <div className="h-10 w-10 bg-text-primary/10 rounded-xl mb-6"></div>
                  <div className="h-6 bg-text-primary/10 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-text-primary/10 rounded w-full mb-6"></div>
                  <div className="h-4 bg-text-primary/10 rounded w-1/2"></div>
                </div>
              ))
            ) : (
              // Render contact cards from API
              contactCards.map((card) => (
                <div
                  key={card.id}
                  className="group bg-bg-card border-2 border-border rounded-3xl p-8 hover:border-accent-gold/50 transition-all duration-500 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-2xl bg-bg-primary group-hover:bg-accent-gold/10 transition-colors duration-500 shrink-0">
                      {getIconForCard(card.title)}
                    </div>
                    <h3 className="text-2xl font-bold text-text-primary font-cinzel tracking-tight">{card.title}</h3>
                  </div>
                  <p className="text-text-secondary mb-6 text-base leading-relaxed font-medium">{card.shortDescription}</p>
                  <div className="space-y-2 font-montserrat font-bold text-lg">
                    {renderContactDetails(card.contact)}
                  </div>
                </div>
              ))
            )}

            {/* Fallback if no cards are loaded */}
            {!cardsLoading && contactCards.length === 0 && (
              <div className="text-center text-text-secondary py-8 font-medium">
                No contact information available
              </div>
            )}
          </div>

          <div className="bg-bg-card border-2 border-border rounded-[32px] p-8 lg:p-12 shadow-2xl relative overflow-hidden">
            {/* Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Send className="w-32 h-32 text-text-primary" />
            </div>

            <div className="mb-10 relative">
              <h3 className="text-3xl font-black text-text-primary font-cinzel mb-4 tracking-tight">Send <span className="text-accent-gold">Message</span></h3>
              <p className="text-text-secondary font-medium">Have a specific inquiry? Drop us a line below.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Success/Error Messages */}
              {success && (
                <div className="bg-green-500/10 border border-green-500/50 rounded-2xl p-4 text-green-600 text-center font-bold">
                  Message sent successfully! We will get back to you soon.
                </div>
              )}
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 rounded-2xl p-4 text-red-500 text-center font-bold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-accent-gold mb-3 ml-1">Name *</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    maxLength={50}
                    className={`w-full bg-bg-primary border-2 rounded-2xl px-5 py-4 focus:outline-none transition-all duration-300 placeholder:text-text-secondary/30 text-text-primary font-semibold ${fieldErrors.name
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-border focus:border-accent-gold'
                      }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-accent-gold mb-3 ml-1">Email *</label>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    maxLength={60}
                    className={`w-full bg-bg-primary border-2 rounded-2xl px-5 py-4 focus:outline-none transition-all duration-300 placeholder:text-text-secondary/30 text-text-primary font-semibold ${fieldErrors.email
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-border focus:border-accent-gold'
                      }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-accent-gold mb-3 ml-1">Mobile Number *</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={formData.mobileNumber}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) {
                        handleFieldChange('mobileNumber', val);
                      }
                    }}
                    className={`w-full bg-bg-primary border-2 rounded-2xl px-5 py-4 focus:outline-none transition-all duration-300 placeholder:text-text-secondary/30 text-text-primary font-semibold ${fieldErrors.mobileNumber || mobileError
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-border focus:border-accent-gold'
                      }`}
                    maxLength={10}
                    pattern="[0-9]{10}"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-accent-gold mb-3 ml-1">Subject *</label>
                  <input
                    type="text"
                    placeholder="What's this about?"
                    value={formData.subject}
                    onChange={(e) => handleFieldChange('subject', e.target.value)}
                    maxLength={200}
                    className={`w-full bg-bg-primary border-2 rounded-2xl px-5 py-4 focus:outline-none transition-all duration-300 placeholder:text-text-secondary/30 text-text-primary font-semibold ${fieldErrors.subject
                      ? 'border-red-500/50 focus:border-red-500'
                      : 'border-border focus:border-accent-gold'
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-accent-gold mb-3 ml-1">Message</label>
                <textarea
                  rows={4}
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={(e) => handleFieldChange('message', e.target.value)}
                  maxLength={500}
                  className={`w-full bg-bg-primary border-2 rounded-2xl px-5 py-4 focus:outline-none transition-all duration-300 resize-none placeholder:text-text-secondary/30 text-text-primary font-semibold ${fieldErrors.message
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-border focus:border-accent-gold'
                    }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full group relative flex items-center justify-center gap-3
                  bg-accent-gold text-white
                  py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em]
                  shadow-xl
                  transition-all duration-300 ease-out
                  hover:shadow-2xl hover:shadow-accent-gold/20
                  hover:-translate-y-0.5
                  hover:bg-accent-gold/90
                  active:scale-[0.98]
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}