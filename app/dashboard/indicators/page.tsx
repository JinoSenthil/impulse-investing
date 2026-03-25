'use client'

import { useState, useEffect } from 'react'
import DashboardPageWrapper from '@/components/ui/DashboardPageWrapper'
import { Activity, CheckCircle2, AlertCircle, FileText, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { IndicatorPurchase } from '@/types'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import ApiService from '@/services/ApiService'
import Pagination from '@/components/ui/Pagination'
import GlobalLoading from '@/components/ui/GlobalLoading'

export default function MyIndicatorsPage() {
    const [indicatorPurchases, setIndicatorPurchases] = useState<IndicatorPurchase[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    const { user } = useSelector((state: RootState) => state.auth)
    const userId = user?.id

    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 6

    useEffect(() => {
        if (!userId) return

        const fetchIndicatorPurchases = async () => {
            try {
                setLoading(true)

                const purchases = await ApiService.getAllIndicatorPurchases(userId, 'SUCCESS')
                setIndicatorPurchases(purchases || [])
                setError(null)
            } catch (err) {
                console.error('Failed to fetch indicator purchases:', err)
           
            } finally {
                setLoading(false)
            }
        }

        fetchIndicatorPurchases()
    }, [userId])

    const totalPages = Math.ceil(indicatorPurchases.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentIndicators = indicatorPurchases.slice(startIndex, startIndex + itemsPerPage)

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount)
    }

    const totalInvestment = indicatorPurchases.reduce((sum, purchase) => sum + purchase.amount, 0)

    const stats = [
        { 
            label: 'Active Indicators', 
            value: indicatorPurchases.length.toString(), 
            icon: <Activity className="w-6 h-6 text-accent-gold" />,
            description: 'Successfully purchased'
        },
        { 
            label: 'Total Investment', 
            value: formatCurrency(totalInvestment),
            icon: <TrendingUp className="w-6 h-6 text-accent-gold" />,
            description: 'Total spent on indicators'
        },
        { 
            label: 'Latest Purchase', 
            value: indicatorPurchases.length > 0 
                ? formatDate(indicatorPurchases[indicatorPurchases.length - 1].purchaseDate)
                : 'N/A',
            icon: <CheckCircle2 className="w-6 h-6 text-accent-gold" />,
            description: 'Most recent activation'
        },
    ]

    if (loading) {
      return <GlobalLoading />;
    }

    if (error) {
        return (
            <DashboardPageWrapper title="My Indicators">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-text-secondary mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="bg-accent-gold text-bg-primary px-6 py-2 rounded-xl font-bold hover:bg-accent-gold/90 transition"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </DashboardPageWrapper>
        )
    }

    if (indicatorPurchases.length === 0) {
        return (
            <DashboardPageWrapper title="My Indicators">
                <div className="bg-bg-card border-2 border-dashed border-border rounded-3xl p-12 text-center">
                    <div className="w-16 h-16 bg-bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-8 h-8 text-text-secondary opacity-50" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                        No Indicators Yet
                    </h3>
                    <p className="text-text-secondary mb-8 max-w-sm mx-auto">
                        You have not purchased any indicators yet. Start your trading journey by exploring our catalog.
                    </p>
                    <Link
                        href="/#indicators"
                        className="bg-accent-gold text-bg-primary px-8 py-3 rounded-xl font-bold hover:bg-accent-gold/90 transition"
                    >
                        Browse Indicators
                    </Link>
                </div>
            </DashboardPageWrapper>
        )
    }

    return (
        <DashboardPageWrapper title="My Indicators">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-bg-card border-2 border-border rounded-2xl p-5 md:p-6 hover:border-accent-gold transition">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="bg-bg-secondary p-3 rounded-xl">{stat.icon}</div>
                            <div>
                                <span className="text-xs md:text-sm text-text-secondary uppercase tracking-wider">{stat.label}</span>
                                <p className="text-xs text-accent-gold/70 mt-1">{stat.description}</p>
                            </div>
                        </div>
                        <div className="text-2xl md:text-2xl font-bold">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl md:text-2xl font-bold">Active Indicators</h2>
                   
                </div>
                
                {currentIndicators.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {currentIndicators.map((purchase, idx) => (
                                <div key={idx} className="bg-bg-card border-2 border-border rounded-2xl p-6 hover:border-accent-gold transition group">
                                    {/* Status Badge */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-xs text-text-secondary">
                                                Purchased Date: {formatDate(purchase.purchaseDate)}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-accent-gold">
                                            {formatCurrency(purchase.amount)}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="text-lg font-bold mb-2 line-clamp-1">{purchase.title}</h3>
                                        <p className="text-sm text-text-secondary line-clamp-2">
                                            {purchase.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Component */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </>
                ) : (
                    <div className="bg-bg-card border-2 border-dashed border-border rounded-3xl p-12 text-center">
                        <div className="w-16 h-16 bg-bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-text-secondary opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No Indicators on This Page</h3>
                        <p className="text-text-secondary mb-8 max-w-sm mx-auto">
                            No indicators found for the selected page. Please check other pages.
                        </p>
                    </div>
                )}
            </div>

            {/* CTA Section */}
            {indicatorPurchases.length > 0 && (
                <div className="mt-8 bg-gradient-to-r from-accent-gold/10 to-transparent border-2 border-accent-gold/30 rounded-2xl p-6 md:p-8 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl md:text-2xl font-bold mb-2">Need More Indicators?</h3>
                        <p className="text-text-secondary text-sm md:text-base">Explore our catalog for premium trading indicators</p>
                    </div>
                    <Link
                        href="/#indicators" 
                        className="w-full md:w-auto bg-accent-gold text-bg-primary px-8 py-3 rounded-xl font-bold hover:bg-accent-gold/90 transition"
                    >
                        Browse Catalog
                    </Link>
                </div>
            )}
        </DashboardPageWrapper>
    )
}