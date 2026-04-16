'use client';

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'

interface DashboardPageWrapperProps {
    title: string
    children: React.ReactNode
}

export default function DashboardPageWrapper({ title, children }: DashboardPageWrapperProps) {
    const router = useRouter()
    const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (!loading && !isAuthenticated) {
            router.push('/login')
        }
    }, [isAuthenticated, loading, router])

    // During SSR and initial hydration, show minimal content
    if (!mounted) {
        return (
            <main className="p-4 md:p-8 w-full overflow-x-hidden">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-bg-card rounded mb-4"></div>
                    <div className="h-4 w-32 bg-bg-card rounded mb-8"></div>
                </div>
            </main>
        )
    }

    if (loading || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#020C0E] flex items-center justify-center">
                <div className="text-green-500 font-cinzel text-xl animate-pulse">Authenticating Access...</div>
            </div>
        )
    }

    return (
        <main className="p-4 md:p-8 w-full overflow-x-hidden">
            {/* Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex flex-col">
                    <h1 className="font-cinzel text-2xl md:text-3xl lg:text-4xl font-bold">{title}</h1>
                    {user && (
                        <p className="text-text-secondary text-sm mt-1">
                            Welcome back,a <span className="text-accent-gold font-bold">{user.firstName}</span>!
                        </p>
                    )}
                </div>
                {/* <div className="flex gap-3 md:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <button className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-bg-card border border-border rounded-xl flex items-center justify-center hover:border-accent-gold transition">
                        <Search className="w-5 h-5 text-text-secondary" />
                    </button>
                    <button className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-bg-card border border-border rounded-xl flex items-center justify-center hover:border-accent-gold transition relative">
                        <Bell className="w-5 h-5 text-text-secondary" />
                      
                    </button>
                    <button className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-bg-card border border-border rounded-xl flex items-center justify-center hover:border-accent-gold transition">
                        <Star className="w-5 h-5 text-text-secondary" />
                    </button>
                </div> */}
            </div>

            {/* Page Content */}
            <div className="min-h-[60vh]">
                {children}
            </div>
        </main>
    )
}