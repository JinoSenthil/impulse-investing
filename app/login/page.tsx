'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Eye, EyeOff, Phone } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { setUser, setLoading, setError } from '@/lib/features/auth/authSlice'
import { RootState } from '@/lib/store'
import ApiService from '@/services/ApiService'

const validatePassword = (password: string) => {
    return password.length >= 6
}

// Validate mobile number - must be exactly 10 digits
const validateMobile = (phoneOrEmail: string) => {
    const cleaned = phoneOrEmail.replace(/\D/g, '')
    return /^\d{10}$/.test(cleaned)
}

function LoginContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectPath = searchParams.get('redirect') || '/'
    const dispatch = useDispatch()
    const { loading, error: authError } = useSelector((state: RootState) => state.auth)

    const [phoneOrEmail, setMobile] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    // Validation states
    const [errors, setErrors] = useState({
        phoneOrEmail: '',
        password: ''
    })
    const [touched, setTouched] = useState({
        phoneOrEmail: false,
        password: false
    })

    const handleMobileChange = (value: string) => {
        // Only allow digits and limit to 10 characters
        const cleaned = value.replace(/\D/g, '')
        setMobile(cleaned.slice(0, 10))
    }

    // Validate field and update errors
    const validateField = (field: string, value: string) => {
        switch (field) {
            case 'phoneOrEmail':
                if (!value.trim()) return 'Mobile number is required'
                if (!validateMobile(value.trim())) {
                    return 'Please enter a valid 10-digit mobile number'
                }
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
            case 'phoneOrEmail': value = phoneOrEmail; break
            case 'password': value = password; break
        }

        const error = validateField(field, value)
        setErrors(prev => ({ ...prev, [field]: error }))
    }

    // Handle field change
    const handleChange = (field: keyof typeof touched, value: string) => {
        switch (field) {
            case 'phoneOrEmail': handleMobileChange(value); break
            case 'password': setPassword(value); break
        }

        // Clear Redux auth error when user starts typing
        if (authError) {
            dispatch(setError(null))
        }

        // Clear local validation error when user starts typing
        if (touched[field] && errors[field]) {
            const error = validateField(field, value)
            setErrors(prev => ({ ...prev, [field]: error }))
        }
    }

    // Check if form is valid
    const isFormValid = () => {
        return validateMobile(phoneOrEmail) && validatePassword(password)
    }

    interface ApiError extends Error {
        response?: {
            status?: number
            data?: {
                message?: string
                errors?: Record<string, string[]>
            }
        }
        message: string
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        dispatch(setError(null))

        setTouched({
            phoneOrEmail: true,
            password: true
        })
        const mobileError = validateField('phoneOrEmail', phoneOrEmail)
        const passwordError = validateField('password', password)

        setErrors({
            phoneOrEmail: mobileError,
            password: passwordError
        })

        if (mobileError || passwordError) {
            return
        }

        if (!isFormValid()) {
            return
        }

        dispatch(setLoading(true))

        try {
            // Clean mobile number - remove any non-digit characters
            const cleanedMobile = phoneOrEmail.replace(/\D/g, '')

            // Call API with mobile only
            const user = await ApiService.login({
                phoneOrEmail: cleanedMobile,
                password
            })

            dispatch(setUser(user))
            router.push(redirectPath)
        } catch (err: unknown) {
            console.error('Login failed:', err)

            // Handle API errors
            if (err instanceof Error) {
                const errorResponse = err as ApiError

                // Check for specific error messages from backend
                if (errorResponse.response?.data?.message) {
                    dispatch(setError(errorResponse.response.data.message))
                }
                else if (errorResponse.response?.status === 401) {
                    dispatch(setError('Invalid mobile number or password. Please check your credentials.'))
                }
                else if (errorResponse.response?.status === 400) {
                    dispatch(setError('Invalid mobile number format. Please enter a valid 10-digit number.'))
                }
                else if (errorResponse.response?.status === 404) {
                    dispatch(setError('Account not found. Please check your details or sign up.'))
                }
                else if (errorResponse.message?.toLowerCase().includes('network')) {
                    dispatch(setError('Network error. Please check your internet connection.'))
                }
                else {
                    dispatch(setError('Login failed. Please check your details.'))
                }
            } else {
                // Generic error for unexpected cases
                dispatch(setError('An unexpected error occurred. Please try again.'))
            }
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
                className="w-full max-w-[480px] bg-[#05161A]/80 backdrop-blur-xl border border-green-500/20 rounded-[40px] p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10"
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
                    <p className="text-text-secondary/70 text-sm font-medium uppercase tracking-widest">Master Your Future</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {authError && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-500 text-sm font-bold text-center">
                            {authError}
                        </div>
                    )}

                    {/* Mobile Number Field */}
                    <div className="space-y-2">
                        <label className="text-xs font-black text-green-400/80 uppercase tracking-widest ml-1" htmlFor="phoneOrEmail">
                            Mobile Number *
                        </label>
                        <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2">
                                <Phone size={20} className="text-green-400/70" />
                            </div>
                            <input
                                id="phoneOrEmail"
                                type="tel"
                                placeholder="1234567890"
                                value={phoneOrEmail}
                                onChange={(e) => handleChange('phoneOrEmail', e.target.value)}
                                onBlur={() => handleBlur('phoneOrEmail')}
                                maxLength={10}
                                className={`w-full bg-[#0A2228] border ${touched.phoneOrEmail && errors.phoneOrEmail
                                    ? 'border-red-500/50'
                                    : 'border-green-500/10'
                                    } rounded-2xl pl-14 pr-5 py-4 text-white focus:border-green-500/50 outline-none transition-all placeholder:text-text-secondary/20`}
                            />
                        </div>
                        {touched.phoneOrEmail && errors.phoneOrEmail && (
                            <div className="flex items-center gap-2 text-red-500 text-xs font-medium ml-1">
                                <span>{errors.phoneOrEmail}</span>
                            </div>
                        )}
                        <p className="text-text-secondary/40 text-xs ml-1 mt-1">
                            Enter your 10-digit mobile number
                        </p>
                    </div>

                    {/* Password Field */}
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-500 text-black font-black py-4 rounded-2xl hover:bg-green-400 transition-all shadow-[0_10px_30px_rgba(34,197,94,0.2)] hover:shadow-[0_15px_40px_rgba(34,197,94,0.3)] transform hover:-translate-y-0.5 active:scale-95 text-base uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Authenticating...
                            </>
                        ) : (
                            'Authorize Access'
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center space-y-8">
                    <p className="text-text-secondary/60 text-sm font-medium">
                        {"Don't have an account?"}{' '}
                        <Link href="/register" className="text-green-400 font-bold hover:text-white transition-colors underline decoration-green-500/30 underline-offset-8">
                            Initialize Account
                        </Link>
                    </p>

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-text-secondary/40 text-xs font-black uppercase tracking-[3px] hover:text-green-400 transition-all group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
                        Return Home
                    </Link>
                </div>
            </motion.div>
        </main>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020C0E] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    )
}