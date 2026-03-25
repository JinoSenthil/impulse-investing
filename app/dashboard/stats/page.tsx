'use client'

import DashboardPageWrapper from '@/components/ui/DashboardPageWrapper'
import { TrendingUp, TrendingDown, Target, DollarSign, BarChart3, Calendar } from 'lucide-react'

export default function TradingStatsPage() {
    const performanceStats = [
        { label: 'Total P&L', value: '+₹1,24,500', change: '+12.4%', trend: 'up', icon: <DollarSign className="w-6 h-6 text-accent-gold" /> },
        { label: 'Win Rate', value: '68%', change: '+5%', trend: 'up', icon: <Target className="w-6 h-6 text-accent-gold" /> },
        { label: 'Total Trades', value: '247', change: '+18', trend: 'up', icon: <BarChart3 className="w-6 h-6 text-accent-gold" /> },
        { label: 'Avg. Return', value: '2.8%', change: '+0.4%', trend: 'up', icon: <TrendingUp className="w-6 h-6 text-accent-gold" /> },
    ]

    const monthlyPerformance = [
        { month: 'Jan', profit: 15200, trades: 42, winRate: 65 },
        { month: 'Feb', profit: 22400, trades: 38, winRate: 71 },
        { month: 'Mar', profit: 18900, trades: 45, winRate: 67 },
        { month: 'Apr', profit: 28500, trades: 52, winRate: 73 },
        { month: 'May', profit: 19800, trades: 40, winRate: 64 },
        { month: 'Jun', profit: 19700, trades: 30, winRate: 69 },
    ]

    const recentTrades = [
        { date: '28 Jan 2026', symbol: 'NIFTY', type: 'LONG', entry: '21,450', exit: '21,680', pnl: '+₹4,600', result: 'win' },
        { date: '27 Jan 2026', symbol: 'BANKNIFTY', type: 'SHORT', entry: '45,320', exit: '45,180', pnl: '+₹2,800', result: 'win' },
        { date: '27 Jan 2026', symbol: 'RELIANCE', type: 'LONG', entry: '2,845', exit: '2,820', pnl: '-₹1,250', result: 'loss' },
        { date: '26 Jan 2026', symbol: 'TCS', type: 'SHORT', entry: '3,920', exit: '3,880', pnl: '+₹3,200', result: 'win' },
        { date: '26 Jan 2026', symbol: 'INFY', type: 'LONG', entry: '1,540', exit: '1,565', pnl: '+₹2,500', result: 'win' },
    ]

    return (
        <DashboardPageWrapper title="Trading Stats">
            {/* Performance Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                {performanceStats.map((stat, idx) => (
                    <div key={idx} className="bg-bg-card border-2 border-border rounded-2xl p-5 md:p-6 hover:border-accent-gold transition">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="bg-bg-secondary p-2 rounded-lg">{stat.icon}</div>
                            <span className="text-xs md:text-sm text-text-secondary uppercase tracking-wider">{stat.label}</span>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold mb-2">{stat.value}</div>
                        <div className={`flex items-center gap-1 text-xs md:text-sm font-semibold ${stat.trend === 'up' ? 'text-accent-green' : 'text-red-400'
                            }`}>
                            {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            {stat.change}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-6">
                {/* Monthly Performance */}
                <div className="lg:col-span-2 bg-bg-card border-2 border-border rounded-2xl p-5 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold mb-6">Monthly Performance</h2>
                    <div className="space-y-6">
                        {monthlyPerformance.map((month, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                                <div className="w-16 text-sm font-bold text-text-secondary">{month.month}</div>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs md:text-sm mb-2">
                                        <span className="text-text-secondary">Profit</span>
                                        <span className="font-bold text-accent-green">+₹{month.profit.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-bg-secondary rounded-full h-2 md:h-3">
                                        <div
                                            className="bg-accent-gold rounded-full h-2 md:h-3 transition-all"
                                            style={{ width: `${(month.profit / 30000) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between sm:block gap-4">
                                    <div className="text-right sm:mb-1">
                                        <div className="text-[10px] md:text-xs text-text-secondary">Win Rate</div>
                                        <div className="text-sm md:text-base font-bold text-accent-gold">{month.winRate}%</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] md:text-xs text-text-secondary">Trades</div>
                                        <div className="text-sm md:text-base font-bold">{month.trades}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                    <div className="bg-bg-card border-2 border-border rounded-2xl p-5 md:p-6 hover:border-accent-gold transition">
                        <h3 className="text-base md:text-lg font-bold mb-4">Best Performing Day</h3>
                        <div className="flex items-center gap-3 mb-3">
                            <Calendar className="w-6 h-6 md:w-8 h-8 text-accent-gold" />
                            <div>
                                <div className="font-bold text-sm md:text-base">15 Apr 2026</div>
                                <div className="text-xs text-text-secondary">Tuesday</div>
                            </div>
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-accent-green">+₹8,450</div>
                    </div>

                    <div className="bg-bg-card border-2 border-border rounded-2xl p-5 md:p-6 hover:border-accent-gold transition">
                        <h3 className="text-base md:text-lg font-bold mb-4">Favorite Instrument</h3>
                        <div className="text-xl md:text-2xl font-bold mb-1">NIFTY</div>
                        <div className="text-xs md:text-sm text-text-secondary mb-3">87 trades</div>
                        <div className="text-accent-green font-bold text-sm md:text-base">72% Win Rate</div>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1 bg-bg-card border-2 border-border rounded-2xl p-5 md:p-6 hover:border-accent-gold transition">
                        <h3 className="text-base md:text-lg font-bold mb-4">Current Streak</h3>
                        <div className="flex items-end gap-3">
                            <div className="text-3xl md:text-4xl font-bold text-accent-gold">5</div>
                            <div className="text-xs md:text-sm text-text-secondary mb-1">Consecutive Wins</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-bg-card border-2 border-border rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-border">
                    <h2 className="text-2xl font-bold">Recent Trades</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-bg-secondary">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-bold text-text-secondary uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-text-secondary uppercase tracking-wider">Symbol</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-text-secondary uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-text-secondary uppercase tracking-wider">Entry</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-text-secondary uppercase tracking-wider">Exit</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-text-secondary uppercase tracking-wider">P&L</th>
                                <th className="px-6 py-4 text-left text-sm font-bold text-text-secondary uppercase tracking-wider">Result</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {recentTrades.map((trade, idx) => (
                                <tr key={idx} className="hover:bg-bg-secondary transition">
                                    <td className="px-6 py-4 text-sm">{trade.date}</td>
                                    <td className="px-6 py-4 font-bold">{trade.symbol}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-md text-xs font-bold ${trade.type === 'LONG'
                                            ? 'bg-accent-green/20 text-accent-green'
                                            : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {trade.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">₹{trade.entry}</td>
                                    <td className="px-6 py-4 text-sm">₹{trade.exit}</td>
                                    <td className={`px-6 py-4 font-bold ${trade.result === 'win' ? 'text-accent-green' : 'text-red-400'
                                        }`}>
                                        {trade.pnl}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${trade.result === 'win'
                                            ? 'bg-accent-green/20 text-accent-green'
                                            : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {trade.result.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardPageWrapper>
    )
}
