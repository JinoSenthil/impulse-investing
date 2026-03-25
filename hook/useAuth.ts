// hooks/useAuth.ts
'use client'

import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export const useAuth = (redirectTo = '/login') => {
    const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.push(redirectTo)
        }
    }, [isAuthenticated, redirectTo, router])

    return { user, isAuthenticated }
}