'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardPageWrapper from '@/components/ui/DashboardPageWrapper'
import { User, Mail, Phone, LockKeyhole, Edit2, Save, X, ArrowLeft, Loader2, Eye, EyeOff, Trash2, Camera } from 'lucide-react'
import Link from 'next/link'
import ApiService from '@/services/ApiService'
import { useRouter } from 'next/navigation'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/lib/store'
import { setUser } from '@/lib/features/auth/authSlice'
import Image from 'next/image'
import GlobalLoading from '@/components/ui/GlobalLoading'
import { User as ApiUser } from '@/types'
import { getFullImageUrl } from '@/lib/utils'

export default function UserProfilePage() {
    const [profile, setProfile] = useState<ApiUser | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        phoneNumber: '',
        passwordHash: '',
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const router = useRouter()
    const { user } = useSelector((state: RootState) => state.auth)
    const dispatch = useDispatch()
    const userId = user?.id

    // Validation functions
    const validateEmail = (email: string) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        return emailRegex.test(email)
    }

    // Phone number validation - exactly 10 digits
    const validatePhoneNumber = (phone: string) => {
        const phoneRegex = /^\d{10}$/
        return phoneRegex.test(phone)
    }

    // Password validation - minimum 8 characters
    const validatePassword = (password: string) => {
        return password.length >= 8
    }

    const fetchUserProfile = useCallback(async () => {
        try {
            if (userId) {
                const data = await ApiService.getUserById(userId)
                setProfile(data)
                setFormData({
                    email: data.email || '',
                    firstName: data.firstName || '',
                    phoneNumber: data.phoneNumber || '',
                    passwordHash: data.passwordHash || '',
                })
                // sync global auth store so sidebar/navigation show correct image
                try {
                    dispatch(setUser(data as ApiUser))
                } catch (e) {
                    console.warn('Failed to dispatch setUser on fetchUserProfile', e)
                }
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err)
            setError('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }, [userId, dispatch])

    useEffect(() => {
        if (!userId) {
            router.push('/login')
            return
        }
        fetchUserProfile()
    }, [userId, router, fetchUserProfile])

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target

        if (name === 'phoneNumber') {
            // Allow only digits and limit to 10 characters
            const numericValue = value.replace(/\D/g, '').slice(0, 10)
            setFormData(prev => ({
                ...prev,
                [name]: numericValue
            }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }))
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file')
                return
            }

            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB')
                return
            }

            setSelectedFile(file)

            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
            setError('')
        }
    }

    const handleDeleteImage = async () => {
        if (!profile?.profileImage) return

        try {
            setDeleting(true)
            setError('')

            // Get the profile image path
            const imagePath = profile.profileImage

            const pathToDelete = imagePath;
            console.log('Deleting image with path:', pathToDelete);

            // Call API to delete image using the new direct method
            await ApiService.deleteImageOnlyDirect(pathToDelete)

            console.log('Image deleted successfully from server');

            // Update profile to remove image
            const updatedUserData: Partial<ApiUser> = {
                ...profile,
                profileImage: '', // Clear the profile image
                modifiedDate: new Date().toISOString(),
            }

            const updatedData = await ApiService.updateUser(userId!, updatedUserData)
            setProfile(updatedData)
            // Update auth store so sidebar/navigation reflect new image immediately
            try {
                dispatch(setUser(updatedData as ApiUser))
            } catch (e) {
                console.warn('Failed to update auth store after deleting image', e)
            }
            setSuccess('Image deleted successfully!')
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            console.error('Failed to delete image:', err)
            setError('Failed to delete image. Please try again.')
        } finally {
            setDeleting(false)
        }
    }

    const handleRemoveNewImage = () => {
        setSelectedFile(null)
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
            setPreviewUrl(null)
        }
        setError('')
    }

    const handleEditClick = () => {
        if (profile) {
            setFormData({
                email: profile.email || '',
                firstName: profile.firstName || '',
                phoneNumber: profile.phoneNumber || '',
                passwordHash: profile.passwordHash || '',
            })
        }
        setIsEditing(true)
        setError('')
        setSuccess('')
        setSelectedFile(null)
        setPreviewUrl(null)
    }

    const handleCancelClick = () => {
        setIsEditing(false)
        setError('')
        setSuccess('')
        setSelectedFile(null)
        setPreviewUrl(null)
        if (profile) {
            setFormData({
                email: profile.email || '',
                firstName: profile.firstName || '',
                phoneNumber: profile.phoneNumber || '',
                passwordHash: profile.passwordHash || '',
            })
        }
    }

    // FIXED: Using ApiService.uploadImageOnly
    const handleUploadImage = async (): Promise<string | undefined> => {
        if (!selectedFile) return profile?.profileImage || undefined

        try {
            setUploading(true)

            console.log('Uploading file:', selectedFile.name)

            // Use ApiService.uploadImageOnly - it now returns the URL string directly
            const response = await ApiService.uploadImageOnly(selectedFile)
            console.log('Upload response:', response)

            // Return the direct URL string
            return response

        } catch (err) {
            console.error('Upload failed:', err)
            // Re-throw with a user-friendly message
            throw new Error('Failed to upload image. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    // FIXED: Save handler with proper image handling using ApiService
    const handleSaveClick = async () => {
        if (!userId || !profile) {
            setError('User not found')
            return
        }

        // Clear previous errors
        setError('')

        // Validation
        if (!formData.firstName.trim()) {
            setError('Name is required')
            return
        }

        if (!validateEmail(formData.email)) {
            setError('Please enter a valid email address (e.g., name@example.com)')
            return
        }

        // Phone number validation - exactly 10 digits
        if (!formData.phoneNumber.trim()) {
            setError('Phone number is required')
            return
        }
        if (!validatePhoneNumber(formData.phoneNumber)) {
            setError('Phone number must be exactly 10 digits')
            return
        }

        // Password validation - minimum 8 characters
        if (!formData.passwordHash.trim()) {
            setError('Password is required')
            return
        }
        if (!validatePassword(formData.passwordHash)) {
            setError('Password must be at least 8 characters long')
            return
        }

        setUpdating(true)

        try {
            let profileImageUrl = profile.profileImage

            // Upload new image if selected
            if (selectedFile) {
                try {
                    const uploadedImageUrl = await handleUploadImage()
                    if (uploadedImageUrl) {
                        const oldImageUrl = profileImageUrl
                        profileImageUrl = uploadedImageUrl
                        console.log('Image uploaded successfully:', uploadedImageUrl)

                        // Delete old image if it exists and is different from the new one
                        if (oldImageUrl && oldImageUrl !== uploadedImageUrl && oldImageUrl !== '') {
                            console.log('Deleting old image with path:', oldImageUrl)
                            // Use the new direct method, don't let delete failure block profile update
                            await ApiService.deleteImageOnlyDirect(oldImageUrl).catch(err => {
                                console.warn('Failed to delete old image:', err)
                            })
                        }
                    }
                } catch (uploadErr) {
                    setError(uploadErr instanceof Error ? uploadErr.message : 'Failed to upload image. Your profile was not updated.')
                    setUpdating(false)
                    return
                }
            }

            // Prepare user data for update
            const updatedUserData = {
                id: Number(userId),
                roleId: profile.roleId || 2,
                email: formData.email,
                passwordHash: formData.passwordHash,
                firstName: formData.firstName,
                lastName: profile.lastName || '',
                phoneNumber: formData.phoneNumber,
                profileImage: profileImageUrl || '',
                dateOfBirth: profile.dateOfBirth,
                gender: profile.gender || null,
                isEmailVerified: profile.isEmailVerified || false,
                isPhoneVerified: profile.isPhoneVerified || false,
                isPremium: profile.isPremium || false,
                activeStatus: profile.activeStatus !== undefined ? profile.activeStatus : true,
                lastLoginAt: profile.lastLoginAt,
                createdDate: profile.createdDate || new Date().toISOString(),
                modifiedDate: new Date().toISOString(),
            }

            console.log('Updating user with data:', updatedUserData)

            // Update user profile using ApiService
            const updatedData = await ApiService.updateUser(userId, updatedUserData)

            setProfile(updatedData)
            // Update auth store so sidebar/navigation reflect new data immediately
            try {
                dispatch(setUser(updatedData as ApiUser))
            } catch (e) {
                console.warn('Failed to update auth store after profile save', e)
            }
            setIsEditing(false)
            setSelectedFile(null)
            setPreviewUrl(null)
            setSuccess('Profile updated successfully!')

            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            console.error('Failed to update profile:', err)
            setError('Failed to update profile. Please try again.')
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <DashboardPageWrapper title="My Profile">
                <div className="flex justify-center items-center py-20">
                    <GlobalLoading />
                </div>
            </DashboardPageWrapper>
        )
    }

    const displayImage = previewUrl || (profile?.profileImage ? getFullImageUrl(profile.profileImage) : null)

    return (
        <DashboardPageWrapper title="My Profile">
            {/* Header */}
            <div className="mb-6 bg-bg-card border-2 border-border rounded-2xl p-4 sm:p-5 flex items-center justify-between transition">
                <Link
                    href="/dashboard"
                    className="group inline-flex items-center gap-2 text-text-secondary hover:text-accent-gold text-sm font-semibold transition"
                >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back to Dashboard
                </Link>

                {!isEditing ? (
                    <button
                        onClick={handleEditClick}
                        className="group inline-flex items-center gap-2 px-5 py-2.5 bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20 border border-accent-gold/30 rounded-xl font-bold text-sm transition-all duration-300"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleCancelClick}
                            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 rounded-xl font-bold text-sm transition-all duration-300"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveClick}
                            disabled={updating || uploading || deleting}
                            className="group inline-flex items-center gap-2 px-5 py-2.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/30 rounded-xl font-bold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updating || uploading || deleting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {uploading ? 'Uploading...' : deleting ? 'Deleting...' : 'Saving...'}
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Messages */}
            {success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-500 text-sm">
                    {success}
                </div>
            )}
            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm">
                    {error}
                </div>
            )}

            {/* Profile Content */}
            <div className="bg-bg-card border-2 border-border rounded-2xl p-8">
                {/* Profile Image Section - Redesigned with side-by-side layout */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
                    {/* Image Display */}
                    <div className="relative w-28 h-28 flex-shrink-0">
                        {displayImage ? (
                            <div className="relative w-full h-full">
                                <Image
                                    src={displayImage}
                                    alt={profile?.firstName || 'User'}
                                    fill
                                    className="rounded-full object-cover border-4 border-accent-gold/30"
                                    unoptimized={displayImage.startsWith('http') || displayImage.startsWith('data:')}
                                    priority
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full rounded-full bg-accent-gold/20 border-4 border-accent-gold/30 flex items-center justify-center">
                                <User className="w-14 h-14 text-accent-gold" />
                            </div>
                        )}
                    </div>

                    {/* Action Buttons Column */}
                    {isEditing && (
                        <div className="flex flex-col gap-3">
                            {/* Upload Button */}
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="profile-image-upload"
                                    disabled={uploading || deleting}
                                />
                                <label
                                    htmlFor="profile-image-upload"
                                    className={`inline-flex items-center gap-2 px-4 py-2.5 bg-accent-gold/10 text-accent-gold hover:bg-accent-gold/20 border border-accent-gold/30 rounded-xl font-medium text-sm transition-all duration-300 cursor-pointer ${(uploading || deleting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Camera className="w-4 h-4" />
                                    {previewUrl ? 'Change Image' : 'Upload Image'}
                                </label>
                            </div>

                            {/* Delete Button - Show for existing image or new selection */}
                            {(profile?.profileImage || previewUrl) && (
                                <div>
                                    {previewUrl ? (
                                        <button
                                            onClick={handleRemoveNewImage}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 rounded-xl font-medium text-sm transition-all duration-300"
                                            disabled={uploading || deleting}
                                        >
                                            <X className="w-4 h-4" />
                                            Remove Image
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleDeleteImage}
                                            disabled={deleting}
                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 rounded-xl font-medium text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {deleting ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Deleting...
                                                </>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete Image
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* First Name */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                            <User className="w-4 h-4" />
                            Name <span className="text-red-500">*</span>
                        </label>
                        <div className={`w-full p-4 bg-bg-secondary/50 border-2 ${isEditing ? 'border-accent-gold/30 focus-within:border-accent-gold' : 'border-border'} rounded-xl transition-colors`}>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                className={`w-full bg-transparent text-text-primary outline-none ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                                placeholder="Enter your first name"
                                maxLength={50}
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                            <Phone className="w-4 h-4" />
                            Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className={`w-full p-4 bg-bg-secondary/50 border-2 ${isEditing ? 'border-accent-gold/30 focus-within:border-accent-gold' : 'border-border'} rounded-xl transition-colors`}>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                pattern="[0-9]*"
                                inputMode="numeric"
                                className={`w-full bg-transparent text-text-primary outline-none ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                                placeholder="Enter 10-digit phone number"
                                maxLength={10}
                            />
                        </div>
                        {isEditing && formData.phoneNumber.length > 0 && formData.phoneNumber.length < 10 && (
                            <p className="text-xs text-amber-500 mt-1">Phone number must be 10 digits</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Email - Now Editable */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                            <Mail className="w-4 h-4" />
                            Email Address (optional)
                        </label>
                        <div className={`w-full p-4 bg-bg-secondary/50 border-2 ${isEditing ? 'border-accent-gold/30 focus-within:border-accent-gold' : 'border-border'} rounded-xl transition-colors`}>
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                className={`w-full bg-transparent text-text-primary outline-none ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                                placeholder={isEditing ? "Enter your email address" : "Email address"}
                                maxLength={80}
                            />
                        </div>
                        {isEditing && formData.email && !validateEmail(formData.email) && (
                            <p className="text-xs text-amber-500 mt-1">Please enter a valid email address</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                            <LockKeyhole className="w-4 h-4" />
                            Password <span className="text-red-500">*</span>
                        </label>
                        <div className={`w-full p-4 bg-bg-secondary/50 border-2 ${isEditing ? 'border-accent-gold/30 focus-within:border-accent-gold' : 'border-border'} rounded-xl flex items-center transition-colors`}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="passwordHash"
                                value={formData.passwordHash}
                                onChange={handleInputChange}
                                readOnly={!isEditing}
                                maxLength={20}
                                className={`w-full bg-transparent text-text-primary outline-none ${!isEditing && 'cursor-not-allowed opacity-70'}`}
                                placeholder={isEditing ? "Enter at least 8 characters" : "••••••••"}
                            />
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="ml-2 text-text-secondary hover:text-accent-gold transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            )}
                        </div>
                        {isEditing && formData.passwordHash && formData.passwordHash.length < 8 && (
                            <p className="text-xs text-amber-500 mt-1">Password must be at least 8 characters</p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardPageWrapper>
    )
}