'use client'

import { useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { RootState } from '@/lib/store'
import {
  BookOpen,
  BarChart3,
  Crown,
  GraduationCap,
  Trophy,
  Clock,
  FileText,
  User
} from 'lucide-react'
import ApiService from '@/services/ApiService'

interface PurchaseCourse {
  courseName: string;
  completionPercentage: number;
  moduleProgress: string;
  totalModules: number;
  completedModules: number;
}

export default function DashboardContent() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [purchaseCounts, setPurchaseCounts] = useState<Record<string, number>>({})
  const [purchaseList, setPurchaseList] = useState<PurchaseCourse[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const fetchData = async () => {
      if (user?.id) {
        try {
          const [counts, list] = await Promise.all([
            ApiService.getDashboardPurchaseCount(user.id),
            ApiService.getDashboardPurchaseList(user.id)
          ])
          setPurchaseCounts(counts)
          setPurchaseList(list)
        } catch (err) {
          console.error('Failed to fetch dashboard data:', err)
        } finally {
          setLoadingStats(false)
        }
      } else {
        setLoadingStats(false)
      }
    }

    fetchData()
  }, [user?.id])

  const stats = [
    {
      icon: <Crown className="w-8 h-8 text-accent-gold" />,
      value: loadingStats ? '...' : String(purchaseCounts.premiumCourseCount || 0),
      label: 'Premium Courses',
    },

    {
      icon: <BarChart3 className="w-8 h-8 text-accent-gold" />,
      value: loadingStats ? '...' : String(purchaseCounts.indicatorCount || 0),
      label: 'Active Indicators',
    },
    {
      icon: <BookOpen className="w-8 h-8 text-accent-gold" />,
      value: loadingStats ? '...' : String(purchaseCounts.courseCount || 0),
      label: 'Courses Enrolled',
    },
  ]

  const activities = [
    { icon: <GraduationCap className="w-6 h-6 text-accent-gold" />, title: 'Completed Lesson', time: '2 hours ago' },
    { icon: <BarChart3 className="w-6 h-6 text-accent-gold" />, title: 'Indicator Signal', time: '5 hours ago' },
    { icon: <Trophy className="w-6 h-6 text-accent-gold" />, title: 'Achievement Unlocked', time: '8 hours ago' },
  ]

  return (
    <main className="p-4 md:p-8 w-full">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="font-cinzel text-2xl md:text-3xl lg:text-4xl font-bold">
            Welcome back,{mounted && user?.firstName ? ` ${user.firstName}` : ''}
          </h1>
          <User aria-hidden="true" className="w-6 h-6 md:w-8 h-8 text-accent-gold" />
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-bg-card border-2 border-border rounded-2xl p-2 md:p-6 hover:border-accent-gold transition flex flex-col group"
          >
            {/* Icon and Label Row */}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-bg-secondary rounded-xl text-accent-gold transform group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="text-accent-gold text-[8px] md:text-sm font-black uppercase tracking-[0.2em] opacity-80 leading-relaxed">
                {stat.label}
              </div>
            </div>

            {/* Centered Value */}
            <div className="text-center">
              <div className="text-6xl md:text-5xl font-bold font-cinzel text-text-primary tracking-wider mb-2">
                {stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        {/* Continue Learning */}
        <div className="bg-bg-card border-2 border-border rounded-2xl p-5 md:p-8 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-text-primary">Continue Learning</h2>
            <Link href="/dashboard/courses" className="text-accent-gold hover:underline text-sm font-semibold hover:translate-x-1 transition-transform inline-block">View All →</Link>
          </div>

          <div className="space-y-6">
            {purchaseList.slice(0, 2).map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-8 h-8 text-accent-gold" />
                </div>

                <div className="flex-1">
                  <div className="font-bold mb-1 md:mb-2 text-text-primary">{item.courseName}</div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm text-text-secondary mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {item.totalModules || 0} Modules
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-4 h-4" /> {item.moduleProgress}
                    </span>
                  </div>

                  <div className="w-full bg-bg-secondary rounded-full h-2 mb-2">
                    <div
                      className="bg-accent-gold rounded-full h-2 transition-all"
                      style={{ width: `${item.completionPercentage}%` }}
                    />
                  </div>

                  <div className="text-xs text-text-secondary">{item.completionPercentage}% Complete</div>
                </div>
              </div>
            ))}

            {purchaseList.length === 0 && !loadingStats && (
              <p className="text-text-secondary text-center py-4 font-medium">No active courses found.</p>
            )}

            {loadingStats && (
              <div className="animate-pulse space-y-4">
                <div className="h-24 bg-bg-secondary rounded-xl" />
                <div className="h-24 bg-bg-secondary rounded-xl" />
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-bg-card border-2 border-border rounded-2xl p-5 md:p-8 shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-text-primary">Recent Activity</h2>

          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-bg-secondary rounded-xl flex items-center justify-center flex-shrink-0">
                  {activity.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm md:text-base mb-1 truncate">
                    {activity.title}
                  </div>
                  <div className="text-[10px] md:text-xs text-text-secondary">
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
