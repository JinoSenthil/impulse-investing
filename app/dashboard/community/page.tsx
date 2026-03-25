'use client'

import DashboardPageWrapper from '@/components/ui/DashboardPageWrapper'
import { Users, MessageSquare, ThumbsUp, TrendingUp, Award, User, Clock } from 'lucide-react'

export default function CommunityPage() {
    const discussions = [
        {
            title: 'Best timeframe for scalping Nifty futures?',
            author: 'TraderPro_99',
            category: 'Strategy Discussion',
            replies: 24,
            likes: 18,
            time: '2 hours ago',
            trending: true
        },
        {
            title: 'How to manage risk in volatile markets',
            author: 'RiskMaster',
            category: 'Risk Management',
            replies: 42,
            likes: 35,
            time: '4 hours ago',
            trending: true
        },
        {
            title: 'My journey from ₹50k to ₹5L in 6 months',
            author: 'SuccessStory',
            category: 'Success Stories',
            replies: 67,
            likes: 89,
            time: '6 hours ago',
            trending: false
        },
        {
            title: 'Options Greeks explained simply',
            author: 'OptionsGuru',
            category: 'Education',
            replies: 31,
            likes: 42,
            time: '8 hours ago',
            trending: false
        },
        {
            title: 'Bank Nifty weekly expiry strategies',
            author: 'WeeklyTrader',
            category: 'Options Trading',
            replies: 28,
            likes: 24,
            time: '10 hours ago',
            trending: false
        }
    ]

    const topContributors = [
        { name: 'MarketMaven', posts: 342, reputation: 4850, badge: 'Expert' },
        { name: 'TechAnalyst', posts: 289, reputation: 4120, badge: 'Pro' },
        { name: 'SwingKing', posts: 256, reputation: 3890, badge: 'Pro' },
        { name: 'DayTraderX', posts: 198, reputation: 2940, badge: 'Advanced' }
    ]

    const categories = [
        { name: 'Strategy Discussion', count: 1245, icon: <TrendingUp className="w-5 h-5" /> },
        { name: 'Market Analysis', count: 892, icon: <MessageSquare className="w-5 h-5" /> },
        { name: 'Options Trading', count: 756, icon: <Award className="w-5 h-5" /> },
        { name: 'Risk Management', count: 634, icon: <Users className="w-5 h-5" /> }
    ]

    return (
        <DashboardPageWrapper title="Community">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    {/* Categories */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {categories.map((cat, idx) => (
                            <div key={idx} className="bg-bg-card border-2 border-border rounded-2xl p-5 md:p-6 hover:border-accent-gold transition cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-accent-gold/10 rounded-xl flex items-center justify-center text-accent-gold group-hover:bg-accent-gold group-hover:text-bg-primary transition flex-shrink-0">
                                        {cat.icon}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold group-hover:text-accent-gold transition text-sm md:text-base truncate">{cat.name}</h3>
                                        <p className="text-xs md:text-sm text-text-secondary">{cat.count} discussions</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Discussions */}
                    <div className="bg-bg-card border-2 border-border rounded-2xl overflow-hidden">
                        <div className="p-5 md:p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-xl md:text-2xl font-bold">Recent Discussions</h2>
                            <button className="w-full sm:w-auto bg-accent-gold text-bg-primary px-6 py-2 rounded-xl font-bold hover:bg-accent-gold/90 transition text-sm">
                                New Discussion
                            </button>
                        </div>
                        <div className="divide-y divide-border">
                            {discussions.map((discussion, idx) => (
                                <div key={idx} className="p-5 md:p-6 hover:bg-bg-secondary transition cursor-pointer group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                {discussion.trending && (
                                                    <TrendingUp className="w-4 h-4 text-accent-gold flex-shrink-0" />
                                                )}
                                                <h3 className="text-base md:text-lg font-bold group-hover:text-accent-gold transition leading-tight truncate">
                                                    {discussion.title}
                                                </h3>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] md:text-xs text-text-secondary">
                                                <span className="flex items-center gap-1.5 font-medium text-text-primary/80">
                                                    <User className="w-3.5 h-3.5" />
                                                    {discussion.author}
                                                </span>
                                                <span className="bg-bg-secondary border border-border px-2 py-0.5 rounded text-[10px] whitespace-nowrap">
                                                    {discussion.category}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {discussion.time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-[10px] md:text-xs">
                                        <span className="flex items-center gap-1.5 text-text-secondary">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            {discussion.replies} replies
                                        </span>
                                        <span className="flex items-center gap-1.5 text-text-secondary">
                                            <ThumbsUp className="w-3.5 h-3.5" />
                                            {discussion.likes} likes
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6 md:space-y-8">
                    {/* Community Stats */}
                    <div className="bg-bg-card border-2 border-border rounded-2xl p-5 md:p-6">
                        <h3 className="text-lg font-bold mb-6">Community Stats</h3>
                        <div className="space-y-5">
                            <div className="flex justify-between items-center">
                                <span className="text-xs md:text-sm text-text-secondary">Total Members</span>
                                <span className="font-bold text-accent-gold text-lg">15,342</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs md:text-sm text-text-secondary">Active Today</span>
                                <span className="font-bold text-accent-green text-lg">2,847</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs md:text-sm text-text-secondary">Total Discussions</span>
                                <span className="font-bold text-lg">4,527</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Contributors */}
                    <div className="bg-bg-card border-2 border-border rounded-2xl p-5 md:p-6">
                        <h3 className="text-lg font-bold mb-6">Top Contributors</h3>
                        <div className="space-y-5">
                            {topContributors.map((contributor, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-accent-gold to-[#c9a532] rounded-full flex items-center justify-center text-bg-primary font-bold text-sm">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm md:text-base truncate">{contributor.name}</div>
                                        <div className="text-[10px] md:text-xs text-text-secondary">{contributor.posts} posts</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="bg-accent-gold/10 text-accent-gold border border-accent-gold/20 px-2 py-0.5 rounded text-[10px] font-bold mb-1">
                                            {contributor.badge}
                                        </div>
                                        <div className="text-[10px] text-text-secondary">{contributor.reputation} pts</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Join Discord CTA */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-accent-gold/10 border-2 border-accent-gold/30 rounded-2xl p-6 md:p-8 text-center">
                        <div className="bg-bg-secondary w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                            <MessageSquare className="w-8 h-8 text-accent-gold" />
                        </div>
                        <h3 className="font-bold text-lg mb-2">Join Our Discord</h3>
                        <p className="text-xs md:text-sm text-text-secondary mb-6 leading-relaxed">
                            Real-time discussions, signals, and support with 5000+ traders.
                        </p>
                        <button className="w-full bg-accent-gold text-bg-primary py-3.5 rounded-xl font-bold hover:bg-accent-gold/90 transition shadow-lg shadow-accent-gold/20">
                            Join Now
                        </button>
                    </div>
                </div>
            </div>
        </DashboardPageWrapper>
    )
}
