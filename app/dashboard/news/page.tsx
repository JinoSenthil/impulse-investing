'use client'

import DashboardPageWrapper from '@/components/ui/DashboardPageWrapper'
import { Newspaper, TrendingUp, Clock, ExternalLink } from 'lucide-react'
import Image from 'next/image'

export default function NewsPage() {
    const featuredNews = {
        title: 'Nifty Hits All-Time High: What Analysts Are Saying',
        summary: 'Indian benchmark indices reached record levels today as strong corporate earnings and positive global cues drove investor sentiment. Market experts weigh in on sustainability.',
        source: 'Economic Times',
        time: '2 hours ago',
        category: 'Market Update',
        image: '/images/news-featured.png'
    }

    const newsArticles = [
        {
            title: 'RBI Maintains Repo Rate at 6.5%, Signals Cautious Stance',
            summary: 'The Reserve Bank of India kept interest rates unchanged in its latest monetary policy review...',
            source: 'Bloomberg',
            time: '3 hours ago',
            category: 'Policy',
            trending: true
        },
        {
            title: 'IT Stocks Rally on Strong Q4 Earnings Guidance',
            summary: 'Major IT companies reported better-than-expected quarterly results, driving sector gains...',
            source: 'Moneycontrol',
            time: '5 hours ago',
            category: 'Sector Focus',
            trending: false
        },
        {
            title: 'FII Inflows Hit ₹12,000 Cr This Week Amid Global Optimism',
            summary: 'Foreign institutional investors continue to pour money into Indian equities...',
            source: 'CNBC TV18',
            time: '6 hours ago',
            category: 'Market Flow',
            trending: true
        },
        {
            title: 'Crude Oil Prices Surge 4% on Middle East Tensions',
            summary: 'Global oil prices jumped sharply following geopolitical developments in the region...',
            source: 'Reuters',
            time: '8 hours ago',
            category: 'Commodities',
            trending: false
        },
        {
            title: 'Banking Stocks Under Pressure After Asset Quality Concerns',
            summary: 'Several banking stocks declined today as investors worried about rising NPAs...',
            source: 'Financial Express',
            time: '10 hours ago',
            category: 'Banking',
            trending: false
        },
        {
            title: 'Rupee Strengthens to 82.45 Against Dollar on Export Boost',
            summary: 'The Indian rupee appreciated against the US dollar amid strong export data...',
            source: 'Business Standard',
            time: '12 hours ago',
            category: 'Currency',
            trending: false
        }
    ]

    const trendingTopics = [
        'Nifty ATH',
        'RBI Policy',
        'IT Earnings',
        'FII Inflows',
        'Crude Oil',
        'Bank Stocks',
        'Rupee Movement'
    ]

    return (
        <DashboardPageWrapper title="Market News">
            {/* Market Quick Summary - Static Grid like Dashboard stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {[
                    { label: 'NIFTY 50', value: '21,680', change: '+1.2%', up: true },
                    { label: 'BANK NIFTY', value: '45,320', change: '+0.8%', up: true },
                    { label: 'SENSEX', value: '71,450', change: '+1.1%', up: true },
                    { label: 'INDIA VIX', value: '14.25', change: '-2.3%', up: false },
                    { label: 'GOLD', value: '62,450', change: '+0.4%', up: true },
                    { label: 'CRUDE OIL', value: '78.45', change: '-1.2%', up: false },
                ].map((item, idx) => (
                    <div key={idx} className="bg-bg-card border-2 border-border rounded-2xl p-4 hover:border-accent-gold transition">
                        <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">{item.label}</div>
                        <div className="text-base font-bold mb-1">{item.value}</div>
                        <div className={`text-xs font-bold ${item.up ? 'text-accent-green' : 'text-red-400'}`}>
                            {item.change}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Main News Content */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    {/* Featured News */}
                    <div className="bg-bg-card border-2 border-border rounded-2xl overflow-hidden group hover:border-accent-gold transition">
                        <div className="aspect-video w-full relative">
                            <Image
                                src="/images/news-featured.png"
                                alt="Featured News"
                                fill
                                className="object-cover transition group-hover:scale-105 duration-500"
                            />
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className="bg-accent-gold text-bg-primary px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-lg">
                                    Featured
                                </span>
                                <span className="bg-bg-primary/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold border border-white/10">
                                    {featuredNews.category}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 md:p-8">
                            <h2 className="text-xl md:text-3xl font-bold mb-4 group-hover:text-accent-gold transition font-cinzel">
                                {featuredNews.title}
                            </h2>
                            <p className="text-sm md:text-base text-text-secondary mb-6 leading-relaxed line-clamp-3">
                                {featuredNews.summary}
                            </p>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-border">
                                <div className="flex items-center gap-6 text-xs md:text-sm text-text-secondary">
                                    <span className="font-bold text-accent-gold">{featuredNews.source}</span>
                                    <span className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {featuredNews.time}
                                    </span>
                                </div>
                                <button className="flex items-center gap-2 bg-bg-secondary border border-border px-6 py-2.5 rounded-xl text-sm font-bold hover:border-accent-gold transition group/btn">
                                    Full Article
                                    <ExternalLink className="w-4 h-4 transition group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* News Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {newsArticles.map((article, idx) => (
                            <div key={idx} className="bg-bg-card border-2 border-border hover:border-accent-gold rounded-2xl p-6 transition flex flex-col group">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-bold text-accent-gold uppercase tracking-wider">
                                        {article.category}
                                    </span>
                                    {article.trending && (
                                        <div className="flex items-center gap-1 text-accent-green">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase">Trending</span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold mb-3 group-hover:text-accent-gold transition font-cinzel leading-tight">
                                    {article.title}
                                </h3>
                                <p className="text-sm text-text-secondary mb-6 line-clamp-2 leading-relaxed">
                                    {article.summary}
                                </p>
                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
                                    <div className="flex items-center gap-3 text-[10px] font-semibold text-text-secondary">
                                        <span>{article.source}</span>
                                        <span className="flex items-center gap-1 opacity-60">
                                            <Clock className="w-3.5 h-3.5" />
                                            {article.time}
                                        </span>
                                    </div>
                                    <button className="text-accent-gold hover:underline text-xs font-bold flex items-center gap-1">
                                        Read
                                        <ExternalLink className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6 md:space-y-8">
                    {/* Trending Sidebar */}
                    <div className="bg-bg-card border-2 border-border rounded-2xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp className="w-6 h-6 text-accent-gold" />
                            <h3 className="text-xl font-bold font-cinzel">Trending</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {trendingTopics.map((topic, idx) => (
                                <button
                                    key={idx}
                                    className="px-3 py-1.5 rounded-lg bg-bg-secondary border border-border text-[10px] md:text-xs font-bold hover:border-accent-gold transition"
                                >
                                    #{topic}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Market - Live Feel */}
                    <div className="bg-bg-card border-2 border-border rounded-2xl p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold font-cinzel">Quick Watch</h3>
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 bg-accent-green rounded-full animate-pulse" />
                                <span className="text-[10px] font-bold text-accent-green uppercase">Live</span>
                            </div>
                        </div>
                        <div className="space-y-5">
                            {[
                                { name: 'Reliance', price: '₹2,845', change: '+2.4%', up: true },
                                { name: 'HDFC Bank', price: '₹1,432', change: '-0.8%', up: false },
                                { name: 'TCS', price: '₹3,980', change: '+1.1%', up: true },
                                { name: 'Infosys', price: '₹1,560', change: '+0.5%', up: true },
                            ].map((stock, idx) => (
                                <div key={idx} className="flex items-center justify-between group cursor-pointer hover:bg-bg-secondary p-2 -m-2 rounded-xl transition">
                                    <div>
                                        <div className="font-bold text-sm tracking-tight">{stock.name}</div>
                                        <div className="text-[9px] text-text-secondary font-bold uppercase">NSE</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-sm">{stock.price}</div>
                                        <div className={`text-[10px] font-bold ${stock.up ? 'text-accent-green' : 'text-red-400'}`}>
                                            {stock.change}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 text-xs font-bold text-accent-gold hover:underline">
                            View All Markets →
                        </button>
                    </div>

                    {/* Subscription Card */}
                    <div className="bg-gradient-to-br from-accent-gold/10 to-transparent border-2 border-accent-gold/30 rounded-2xl p-6 md:p-8 text-center">
                        <Newspaper className="w-10 h-10 text-accent-gold mx-auto mb-4" />
                        <h3 className="text-lg font-bold mb-2">Daily Market Digest</h3>
                        <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                            Stay ahead with curative analysis sent directly to your inbox.
                        </p>
                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-xs focus:border-accent-gold outline-none"
                            />
                            <button className="w-full bg-accent-gold text-bg-primary py-2.5 rounded-xl font-bold text-xs hover:opacity-90 transition">
                                Subscribe Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardPageWrapper>
    )
}
