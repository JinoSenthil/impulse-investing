'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { setUser, setLoading, setError } from '@/lib/features/auth/authSlice'
import { RootState } from '@/lib/store'
import ApiService from '@/services/ApiService'

export default function RegisterPage() {
    const router = useRouter()
    const dispatch = useDispatch()
    const { loading, error: authError } = useSelector((state: RootState) => state.auth)

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    // Validation states
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        password: ''
    })
    const [touched, setTouched] = useState({
        name: false,
        email: false,
        phoneNumber: false,
        password: false
    })

    // Email validation regex
    const validateEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        return emailRegex.test(email)
    }

    // Phone number validation (more strict for required field)
    const validatePhoneNumber = (phone: string) => {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/ // International phone format
        return phoneRegex.test(phone.replace(/\s/g, ''))
    }

    // Password validation
    const validatePassword = (password: string) => {
        return password.length >= 6
    }

    // Name validation
    const validateName = (name: string) => {
        return name.trim().length >= 2
    }

    // Validate field and update errors
    const validateField = (field: string, value: string) => {
        switch (field) {
            case 'name':
                if (!value.trim()) return 'Name is required'
                if (!validateName(value)) return 'Name must be at least 2 characters'
                return ''
            case 'email':
                // Email is optional, only validate if provided
                if (email.trim() && !validateEmail(email)) return 'Please enter a valid email address'
                return ''
            case 'phoneNumber':
                if (!value.trim()) return 'Phone number is required'
                if (!validatePhoneNumber(value)) return 'Please enter a valid phone number'
                return ''
            case 'password':
                if (!value) return 'Password is required'
                if (!validatePassword(value)) return 'Password must be at least 6 characters'
                return ''
            default:
                return ''
        }
    }

    // Handle field blur
    const handleBlur = (field: keyof typeof touched) => {
        setTouched(prev => ({ ...prev, [field]: true }))

        // Validate the field
        let value = ''
        switch (field) {
            case 'name': value = name; break
            case 'email': value = email; break
            case 'phoneNumber': value = phoneNumber; break
            case 'password': value = password; break
        }

        const error = validateField(field, value)
        setErrors(prev => ({ ...prev, [field]: error }))
    }

    // Handle field change
    const handleChange = (field: keyof typeof touched, value: string) => {
        switch (field) {
            case 'name': setName(value); break
            case 'email': setEmail(value); break
            case 'phoneNumber': setPhoneNumber(value); break
            case 'password': setPassword(value); break
        }

        // Clear error when user starts typing
        if (touched[field] && errors[field]) {
            const error = validateField(field, value)
            setErrors(prev => ({ ...prev, [field]: error }))
        }
    }

    // Check if form is valid
    const isFormValid = () => {
        return (
            validateName(name) &&
            validatePassword(password) &&
            validatePhoneNumber(phoneNumber) && // Phone number is now required
            (email ? validateEmail(email) : true) // Email remains optional
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Mark all fields as touched
        setTouched({
            name: true,
            email: true,
            phoneNumber: true,
            password: true
        })

        // Validate all fields
        const nameError = validateField('name', name)
        const emailError = validateField('email', email)
        const phoneError = validateField('phoneNumber', phoneNumber)
        const passwordError = validateField('password', password)

        setErrors({
            name: nameError,
            email: emailError,
            phoneNumber: phoneError,
            password: passwordError
        })

        // Check if any errors exist
        if (nameError || emailError || phoneError || passwordError) {
            return
        }

        // Only proceed if form is valid
        if (!isFormValid()) {
            return
        }

        dispatch(setLoading(true))
        dispatch(setError(null))

        // Split name into firstName and lastName
        const nameParts = name.trim().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        try {
            const user = await ApiService.register({
                firstName,
                lastName,
                email: email || null,
                phoneNumber: phoneNumber, // Now required
                passwordHash: password,
                roleId: 2,
                activeStatus: true,
                isEmailVerified: false,
                isPhoneVerified: false,
                isPremium: false
            })
            dispatch(setUser(user))
            router.push('/')
        } catch (err: unknown) {
            console.error('Registration failed:', err)
            const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.'
            dispatch(setError(errorMessage))
        } finally {
            dispatch(setLoading(false))
        }
    }

    return (
        <main className="min-h-screen bg-[#020C0E] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl bg-[#05161A]/80 backdrop-blur-xl border border-green-500/20 rounded-[40px] p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10"
            >
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="relative group mb-6">
                        <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-2xl group-hover:bg-green-500/40 transition-all" />
                        <div className="relative w-20 h-20 bg-[#05161A] border border-green-500/30 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.15)] overflow-hidden">
                            <Image
                                src="/logo2.png"
                                alt="IMPULSE Logo"
                                width={56}
                                height={56}
                                className="object-contain"
                            />
                        </div>
                    </div>
                    <h1 className="font-cinzel text-3xl font-black tracking-[4px] text-green-400 mb-2">
                        IMPULSE
                    </h1>
                    <p className="text-text-secondary/70 text-sm font-medium uppercase tracking-widest">Create Your Identity</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {authError && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-500 text-sm font-bold text-center">
                            {authError}
                        </div>
                    )}

                    {/* Name Field - Full Width */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-green-400/80 uppercase tracking-widest ml-1" htmlFor="name">
                            Name *
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="How should we call you?"
                            value={name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            onBlur={() => handleBlur('name')}
                            maxLength={50}
                            className={`w-full bg-[#0A2228] border ${touched.name && errors.name
                                ? 'border-red-500/50'
                                : 'border-green-500/10'
                                } rounded-2xl px-5 py-4 text-white focus:border-green-500/50 outline-none transition-all placeholder:text-text-secondary/20`}
                        />
                        {touched.name && errors.name && (
                            <div className="flex items-center gap-2 text-red-500 text-xs font-medium ml-1">
                                <span>{errors.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Contact Information Section - 2 Column Grid */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Email Field - Left Column */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-green-400/80 uppercase tracking-widest ml-1" htmlFor="email">
                                    Email Address (Optional)
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    onBlur={() => handleBlur('email')}
                                    maxLength={80}
                                    className={`w-full bg-[#0A2228] border ${touched.email && errors.email
                                        ? 'border-red-500/50'
                                        : 'border-green-500/10'
                                        } rounded-2xl px-5 py-4 text-white focus:border-green-500/50 outline-none transition-all placeholder:text-text-secondary/20`}
                                />
                                {touched.email && errors.email && (
                                    <div className="flex items-center gap-2 text-red-500 text-xs font-medium ml-1">
                                        <span>{errors.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Phone Number Field - Right Column */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-green-400/80 uppercase tracking-widest ml-1" htmlFor="phoneNumber">
                                    Mobile Number *
                                </label>
                                <input
                                    id="phoneNumber"
                                    type="tel"
                                    placeholder="+1 234 567 8900"
                                    value={phoneNumber}
                                    inputMode="numeric"
                                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                    onBlur={() => handleBlur('phoneNumber')}
                                    maxLength={10}
                                    className={`w-full bg-[#0A2228] border ${touched.phoneNumber && errors.phoneNumber
                                        ? 'border-red-500/50'
                                        : 'border-green-500/10'
                                        } rounded-2xl px-5 py-4 text-white focus:border-green-500/50 outline-none transition-all placeholder:text-text-secondary/20`}
                                    onKeyDown={(e) => {
                                        if (!/[0-9]|Backspace|ArrowLeft|ArrowRight|Tab/.test(e.key)) {
                                            e.preventDefault();
                                        }
                                    }}

                                />
                                {touched.phoneNumber && errors.phoneNumber && (
                                    <div className="flex items-center gap-2 text-red-500 text-xs font-medium ml-1">
                                        <span>{errors.phoneNumber}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Password Field - Full Width */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-green-400/80 uppercase tracking-widest ml-1" htmlFor="password">
                            Secure Password *
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                onBlur={() => handleBlur('password')}
                                className={`w-full bg-[#0A2228] border ${touched.password && errors.password
                                    ? 'border-red-500/50'
                                    : 'border-green-500/10'
                                    } rounded-2xl px-5 py-4 text-white focus:border-green-500/50 outline-none transition-all placeholder:text-text-secondary/20`}
                                maxLength={30}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-green-400 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {touched.password && errors.password && (
                            <div className="flex items-center gap-2 text-red-500 text-xs font-medium ml-1">
                                <span>{errors.password}</span>
                            </div>
                        )}
                    </div>

                    {/* Submit Button - Full Width */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-500 text-black font-black py-4 rounded-2xl hover:bg-green-400 transition-all shadow-[0_10px_30px_rgba(34,197,94,0.2)] hover:shadow-[0_15px_40px_rgba(34,197,94,0.3)] transform hover:-translate-y-0.5 active:scale-95 text-base uppercase tracking-wider flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Initialize Account'
                            )}
                        </button>
                    </div>
                </form>

                {/* Links Section - 2 Column Grid for larger screens */}
                <div className="mt-10 text-center space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div className="text-left">
                            <p className="text-text-secondary/60 text-sm font-medium">
                                Already have an account?{' '}
                                <Link href="/login" className="text-green-400 font-bold hover:text-white transition-colors underline decoration-green-500/30 underline-offset-8">
                                    Sign In
                                </Link>
                            </p>
                        </div>

                        <div className="text-right">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-text-secondary/40 text-xs font-black uppercase tracking-[3px] hover:text-green-400 transition-all group justify-end"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
                                Return Home
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </main>
    )
}