'use client'

import DashboardPageWrapper from '@/components/ui/DashboardPageWrapper'
import Link from 'next/link'
import { Star, Zap, Crown } from 'lucide-react'

export default function MarketplacePage() {
    const products = [
        {
            id: 'quantum-scalper',
            name: 'Quantum Scalper Pro',
            category: 'Indicator',
            price: '₹4,999',
            rating: 4.8,
            reviews: 342,
            description: 'Advanced scalping indicator with AI-powered entry signals',
            features: ['Real-time alerts', 'Multi-timeframe', '95% accuracy'],
            badge: 'Bestseller',
            badgeColor: 'bg-accent-gold'
        },
        {
            id: 'options-mastery',
            name: 'Options Greeks Mastery',
            category: 'Course',
            price: '₹12,999',
            rating: 4.9,
            reviews: 156,
            description: 'Complete guide to options trading with Greeks analysis',
            features: ['12 weeks', '45 lessons', 'Live sessions'],
            badge: 'New',
            badgeColor: 'bg-accent-green'
        },
        {
            id: 'volume-elite',
            name: 'Volume Profile Elite',
            category: 'Indicator',
            price: '₹6,999',
            rating: 4.7,
            reviews: 289,
            description: 'Professional volume analysis tool for institutional trading',
            features: ['POC detection', 'Value areas', 'Auto levels'],
            badge: 'Premium',
            badgeColor: 'bg-purple-500'
        },
        {
            id: 'algo-bootcamp',
            name: 'Algo Trading Bootcamp',
            category: 'Course',
            price: '₹24,999',
            rating: 5.0,
            reviews: 98,
            description: 'Build and deploy your own algorithmic trading systems',
            features: ['16 weeks', 'Python coding', 'Live deployment'],
            badge: 'Premium',
            badgeColor: 'bg-purple-500'
        },
        {
            id: 'money-tracker',
            name: 'Smart Money Tracker',
            category: 'Indicator',
            price: '₹8,999',
            rating: 4.9,
            reviews: 421,
            description: 'Track institutional money flow and dark pool activity',
            features: ['FII/DII data', 'Block deals', 'Bulk trades'],
            badge: 'Trending',
            badgeColor: 'bg-red-500'
        },
        {
            id: 'risk-pro',
            name: 'Risk Management Pro',
            category: 'Course',
            price: '₹7,999',
            rating: 4.8,
            reviews: 234,
            description: 'Master position sizing and portfolio risk management',
            features: ['6 weeks', '28 lessons', 'Excel tools'],
            badge: 'Popular',
            badgeColor: 'bg-blue-500'
        }
    ]

    const categories = ['All', 'Indicators', 'Courses', 'Tools', 'Bundles']

    return (
        <DashboardPageWrapper title="Market Place">
            {/* Category Filter */}
            <div className="flex gap-3 mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {categories.map((cat, idx) => (
                    <button
                        key={idx}
                        className={`flex-shrink-0 px-5 md:px-6 py-2 rounded-xl text-sm md:text-base font-semibold transition ${idx === 0
                            ? 'bg-accent-gold text-bg-primary'
                            : 'bg-bg-card border-2 border-border hover:border-accent-gold'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, idx) => (
                    <div key={idx} className="bg-bg-card border-2 border-border rounded-2xl p-5 md:p-6 hover:border-accent-gold transition group flex flex-col relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <h3 className="text-lg md:text-xl font-bold group-hover:text-accent-gold transition truncate">{product.name}</h3>
                                    <span className={`${product.badgeColor} text-white px-2 py-0.5 rounded-md text-[10px] md:text-xs font-bold whitespace-nowrap`}>
                                        {product.badge}
                                    </span>
                                </div>
                                <span className="text-xs md:text-sm text-text-secondary uppercase tracking-tight">{product.category}</span>
                            </div>
                        </div>

                        <div className="text-2xl font-bold text-accent-gold mb-3">{product.price}</div>

                        <p className="text-text-secondary mb-4 text-xs md:text-sm line-clamp-2">{product.description}</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {product.features.slice(0, 3).map((feature, fidx) => (
                                <span key={fidx} className="bg-bg-secondary px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold">
                                    {feature}
                                </span>
                            ))}
                        </div>

                        <div className="mt-auto pt-4 border-t border-border">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3 h-3 md:w-4 md:h-4 ${i < Math.floor(product.rating)
                                                    ? 'text-yellow-500 fill-yellow-500'
                                                    : 'text-text-secondary'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs md:text-sm font-bold">{product.rating}</span>
                                </div>
                                <Link
                                    href={`/indicators/${product.id}`}
                                    className="flex-1 sm:flex-none bg-accent-gold text-bg-primary px-4 md:px-6 py-2 rounded-xl text-sm md:text-base font-bold hover:bg-accent-gold/90 transition shadow-lg shadow-accent-gold/20 flex items-center justify-center gap-2"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Premium Bundle CTA */}
            <div className="mt-12 bg-gradient-to-br from-purple-500/10 via-accent-gold/10 to-transparent border-2 border-accent-gold/30 rounded-2xl p-6 md:p-10">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                    <div className="flex-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-bg-secondary p-3 rounded-2xl">
                                <Crown className="w-8 h-8 md:w-10 md:h-10 text-accent-gold" />
                            </div>
                            <h3 className="text-2xl md:text-3xl font-bold">Premium All-Access Bundle</h3>
                        </div>
                        <p className="text-text-secondary mb-6 text-sm md:text-base max-w-2xl">Get unlimited access to all indicators and courses with our most comprehensive trading package ever.</p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-2">
                            {[
                                'All premium indicators',
                                'Unlimited course access',
                                'Priority support & updates',
                                'Exclusive webinars',
                                'Discord Nitro access',
                                'Personal coaching session'
                            ].map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm md:text-base text-text-primary/90">
                                    <Zap className="w-4 h-4 text-accent-gold flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-full lg:w-auto bg-bg-card/50 backdrop-blur-sm border border-white/5 rounded-3xl p-6 md:p-8 text-center flex flex-col items-center">
                        <div className="text-sm text-text-secondary line-through mb-1">₹99,999</div>
                        <div className="text-4xl md:text-5xl font-bold text-accent-gold mb-6">₹49,999</div>
                        <button className="w-full bg-accent-gold text-bg-primary px-10 py-4 rounded-xl font-bold hover:bg-accent-gold/90 transition shadow-lg shadow-accent-gold/20 text-lg">
                            Get Bundle Now
                        </button>
                    </div>
                </div>
            </div>
        </DashboardPageWrapper>
    )
}
