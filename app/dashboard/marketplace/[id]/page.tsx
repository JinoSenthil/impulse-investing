'use client'

import { useParams, useRouter } from 'next/navigation'
import DashboardPageWrapper from '@/components/ui/DashboardPageWrapper'
import {
    ChevronLeft,
    Star,
    Zap,
    Shield,
    BarChart3,
    ArrowRight,
    CheckCircle2,
    PlayCircle,
    Download,
    Lock,
    ShoppingCart
} from 'lucide-react'

interface Feature {
    icon: React.ReactNode;
    title: string;
    desc: string;
}

interface Stat {
    label: string;
    value: string;
}

interface IndicatorDetail {
    name: string;
    price: string;
    rating: number;
    reviews: number;
    winRate: string;
    profitFactor: string;
    drawdown: string;
    description: string;
    longDescription?: string;
    features: Feature[];
    stats?: Stat[];
}

// Mock Data for the details
const indicatorDetails: Record<string, IndicatorDetail> = {
    'quantum-scalper': {
        name: 'Quantum Scalper Pro',
        price: '₹4,999',
        rating: 4.8,
        reviews: 342,
        winRate: '82%',
        profitFactor: '1.95',
        drawdown: '12%',
        description: 'The Quantum Scalper Pro is our flagship high-frequency trading indicator. Built on advanced AI algorithms, it identifies micro-trends in any liquid market, providing you with high-probability entry and exit signals.',
        longDescription: `
            Experience the future of scalping with Quantum Scalper Pro. This isn't just another indicator; it's a complete micro-trend analysis engine. 
            
            By analyzing order flow and momentum in real-time, the Quantum Scalper identifies the exact moment when institutional pressure builds up, allowing you to ride the wave before the rest of the market reacts.
        `,
        features: [
            { icon: <Zap />, title: 'Micro-Trend Detection', desc: 'Finds small but highly profitable trends in 1m to 15m timeframes.' },
            { icon: <BarChart3 />, title: 'Volume Integration', desc: 'Analyzes real volume to confirm breakout signals.' },
            { icon: <Shield />, title: 'Risk Guard', desc: 'Automatically calculates optimal Stop Loss and Take Profit levels.' },
            { icon: <Lock />, title: 'Non-Repaint', desc: 'Once a signal is generated, it never changes or disappears.' }
        ],
        stats: [
            { label: 'Avg Monthly ROI', value: '18.4%' },
            { label: 'Success Rate', value: '82.5%' },
            { label: 'Trade Frequency', value: '15-20 / day' },
            { label: 'Platform', value: 'TradingView' }
        ]
    },
    'momentum-master': {
        name: 'Momentum Master',
        price: '₹2,999',
        rating: 4.6,
        reviews: 128,
        winRate: '76%',
        profitFactor: '1.72',
        drawdown: '15%',
        description: 'Master the swings with our advanced momentum tracking tool. Perfect for intraday and swing traders who want to stay on the right side of the trend.',
        features: [
            { icon: <Zap />, title: 'Multi-Timeframe', desc: 'Syncs momentum trends across multiple timeframes for higher accuracy.' },
            { icon: <BarChart3 />, title: 'Divergence HUD', desc: 'Visually highlights RSI and MACD divergences automatically.' }
        ]
    }
}

export default function IndicatorDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    // Default to Quantum Scalper if ID not found for demo
    const data = indicatorDetails[id] || indicatorDetails['quantum-scalper']

    return (
        <DashboardPageWrapper title="Indicator Details">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-text-secondary hover:text-accent-gold transition mb-6"
            >
                <ChevronLeft className="w-4 h-4" />
                Back to Market Place
            </button>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left: Content */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Hero Section */}
                    <div className="bg-bg-card border-2 border-border rounded-[2rem] p-6 md:p-10">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="w-full md:w-1/3 aspect-square bg-bg-secondary rounded-2xl flex items-center justify-center border border-white/5 relative group overflow-hidden">
                                <Zap className="w-20 h-20 text-accent-gold group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-accent-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="bg-accent-gold text-bg-primary px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                        Best Value
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="text-sm font-bold">{data.rating}</span>
                                        <span className="text-text-secondary text-xs">({data.reviews} reviews)</span>
                                    </div>
                                </div>

                                <h1 className="text-3xl md:text-4xl font-bold mb-4 font-cinzel">{data.name}</h1>
                                <p className="text-text-secondary text-sm md:text-base mb-8 leading-relaxed">
                                    {data.description}
                                </p>

                                <div className="grid grid-cols-3 gap-4 p-4 bg-bg-secondary/50 rounded-2xl border border-white/5">
                                    <div className="text-center">
                                        <div className="text-accent-green font-black text-xl">{data.winRate}</div>
                                        <div className="text-[10px] text-text-secondary uppercase tracking-wider">Win Rate</div>
                                    </div>
                                    <div className="text-center border-x border-white/10">
                                        <div className="text-accent-gold font-black text-xl">{data.profitFactor}</div>
                                        <div className="text-[10px] text-text-secondary uppercase tracking-wider">Profit Factor</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-red-400 font-black text-xl">{data.drawdown}</div>
                                        <div className="text-[10px] text-text-secondary uppercase tracking-wider">Max DD</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description & Proof */}
                    <div className="bg-bg-card border-2 border-border rounded-[2rem] p-6 md:p-10">
                        <h2 className="text-2xl font-bold mb-6 font-cinzel">How it Works</h2>
                        <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed mb-10">
                            {data.longDescription || data.description}
                        </div>

                        {/* Placeholder for Video/Screenshot */}
                        <div className="aspect-video bg-bg-secondary rounded-[2rem] border-2 border-dashed border-border flex flex-col items-center justify-center group cursor-pointer hover:border-accent-gold transition">
                            <div className="w-20 h-20 bg-accent-gold/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition">
                                <PlayCircle className="w-10 h-10 text-accent-gold" />
                            </div>
                            <span className="font-bold text-text-secondary group-hover:text-accent-gold transition">Watch in Action</span>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {data.features?.map((feature, idx: number) => (
                            <div key={idx} className="bg-bg-card border-2 border-border rounded-[2rem] p-8 hover:border-accent-gold transition">
                                <div className="w-12 h-12 bg-bg-secondary rounded-xl flex items-center justify-center text-accent-gold mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Sidebar Checkout */}
                <div className="space-y-8">
                    <div className="bg-bg-card border-2 border-border rounded-[2.5rem] p-8 sticky top-8">
                        <div className="text-center mb-8">
                            <div className="text-sm text-text-secondary mb-2">Lifetime Access</div>
                            <div className="text-5xl font-black text-accent-gold mb-2">{data.price}</div>
                            <div className="text-xs text-accent-green font-bold">Includes All Future Updates</div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <button className="w-full bg-accent-gold text-bg-primary py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-accent-gold/20 hover:scale-[1.02] transition active:scale-[0.98] flex items-center justify-center gap-3">
                                <ShoppingCart className="w-5 h-5" />
                                BUY NOW
                            </button>
                            <button className="w-full bg-bg-secondary text-text-primary py-5 rounded-2xl font-bold text-sm border border-border hover:border-accent-gold transition flex items-center justify-center gap-3">
                                <ArrowRight className="w-5 h-5" />
                                Add to Wishlist
                            </button>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-border">
                            <div className="flex items-center gap-3 text-xs font-bold text-text-secondary">
                                <CheckCircle2 className="w-4 h-4 text-accent-green" />
                                <span>Secured by Stripe Architecture</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-text-secondary">
                                <Download className="w-4 h-4 text-accent-gold" />
                                <span>Instant Setup Guide Included</span>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-10 grid grid-cols-2 gap-4">
                            {data.stats?.map((stat, idx: number) => (
                                <div key={idx} className="bg-bg-secondary p-4 rounded-2xl text-center">
                                    <div className="text-sm font-black mb-1">{stat.value}</div>
                                    <div className="text-[9px] text-text-secondary uppercase tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trust Banner */}
                    <div className="bg-gradient-to-br from-bg-card to-accent-gold/5 border-2 border-border rounded-[2.5rem] p-8">
                        <h4 className="font-bold mb-4">Risk-Free Trading</h4>
                        <p className="text-xs text-text-secondary leading-relaxed mb-6">
                            Not satisfied? We offer a 7-day performance guarantee. If the indicator doesn&apos;t match our backtesting, we&apos;ll refund you.
                        </p>
                        <div className="flex gap-4 opacity-50">
                            <BarChart3 className="w-8 h-8" />
                            <Shield className="w-8 h-8" />
                            <Lock className="w-8 h-8" />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardPageWrapper>
    )
}
