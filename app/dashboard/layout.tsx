'use client'

import { useState } from 'react'
import Sidebar from '@/components/ui/Sidebar'
import { Menu } from 'lucide-react'
import Link from 'next/link'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-bg-primary">
            {/* Mobile Header */}
            <header className="lg:hidden h-20 border-b border-white/5 bg-bg-secondary/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-[60]">
                <Link href="/" className="font-cinzel text-2xl font-bold tracking-[2px] text-accent-gold hover:opacity-80 transition">
                    IMPULSE
                </Link>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-text-secondary hover:text-accent-gold hover:bg-white/5 rounded-xl transition"
                >
                    <Menu className="w-8 h-8" />
                </button>
            </header>

            <div className="flex">
                {/* Backdrop for mobile */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <div className="flex-1 w-full lg:ml-[280px]">
                    {children}
                </div>
            </div>
        </div>
    )
}
