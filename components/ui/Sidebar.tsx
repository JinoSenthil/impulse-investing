'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getFullImageUrl } from '@/lib/utils'
import {
  Home,
  BookOpen,
  BarChart3,
  CreditCard,
  LogOut,
  User,
  Crown,
  ClipboardCheck,
  X,
  ArrowLeft,
  Sun,
  Moon,
  Star
} from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { logout } from '@/lib/features/auth/authSlice'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/components/providers/ThemeProvider'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const dispatch = useDispatch()
  const router = useRouter()
  const { user } = useSelector((state: RootState) => state.auth)

  const [mounted, setMounted] = useState(false)

  const avatarUrl = mounted && user?.profileImage ? getFullImageUrl(user.profileImage) : ''

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    dispatch(logout())
    router.push('/login')
    onClose()
  }

  const navSections = [
    {
      title: 'MAIN',
      items: [
        { href: '/dashboard', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
        { href: '/dashboard/userprofile', icon: <User className="w-5 h-5" />, label: 'User Profile' },
        { href: '/dashboard/courses', icon: <BookOpen className="w-5 h-5" />, label: 'My Courses' },
        { href: '/dashboard/indicator-enrollments', icon: <BarChart3 className="w-5 h-5" />, label: 'Indicator Enrollments' },
        { href: '/dashboard/course-enrollments', icon: <ClipboardCheck className="w-5 h-5" />, label: 'Course Enrollments' },
        { href: '/dashboard/quizresult', icon: <ClipboardCheck className="w-5 h-5" />, label: 'Quiz Status' },
        { href: '/dashboard/reviews', icon: <Star className="w-5 h-5" />, label: 'My Reviews' },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { href: '/dashboard/billing', icon: <CreditCard className="w-5 h-5" />, label: 'Billing' },
        { href: '/logout', icon: <LogOut className="w-5 h-5" />, label: 'Logout', onClick: handleLogout },
      ]
    }
  ]

  return (
    <aside className={`
      w-[280px] bg-bg-secondary border-r border-white/5 fixed h-screen flex flex-col flex-shrink-0 top-0 left-0 z-50 transition-transform duration-300 ease-in-out custom-scrollbar
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-bg-secondary/50 backdrop-blur-xl sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-text-secondary hover:text-accent-gold transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link href="/" className="font-cinzel text-3xl font-bold tracking-[3px] text-accent-gold hover:opacity-80 transition">
            IMPULSE
          </Link>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-text-secondary hover:text-accent-gold transition p-2 hover:bg-white/5 rounded-xl"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-8 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={(user && `${user.firstName} ${user.lastName}`) || 'User avatar'}
                width={50}
                height={50}
                className="w-[50px] h-[50px] rounded-2xl object-cover shadow-lg"
              />
            ) : (
              <div className="w-[50px] h-[50px] bg-gradient-to-br from-accent-gold to-[#c9a532] rounded-2xl flex items-center justify-center shadow-lg shadow-accent-gold/20">
                <User className="w-6 h-6 text-bg-primary" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-green border-2 border-bg-secondary rounded-full" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="font-bold text-sm truncate">
              <div className="font-bold text-sm truncate min-h-[16px]">
                {!mounted ? (
                  <div className="h-4 w-24 bg-bg-card animate-pulse rounded" />
                ) : user ? (
                  <span className="text-text-primary">{user.firstName}</span>
                ) : (
                  <span className="text-text-primary">Guest User</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-accent-gold">
              <Crown className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {user?.isPremium ? 'Elite' : 'Free Member'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="py-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="mb-6 last:mb-0">
              <div className="text-[10px] text-text-secondary font-black uppercase tracking-[0.2em] px-8 pb-4 opacity-50">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={(e) => {
                        if ('onClick' in item && item.onClick) {
                          item.onClick(e as unknown as React.MouseEvent<HTMLAnchorElement>)
                        }
                        if (window.innerWidth < 1024) onClose()
                      }}
                      className={`group relative flex items-center gap-4 px-8 py-3 transition-all duration-300 ${isActive
                        ? 'text-accent-gold'
                        : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                      {/* Active Bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[4px] h-[20px] bg-accent-gold rounded-r-full shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                      )}

                      <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {item.icon}
                      </div>
                      <span className={`text-sm font-bold tracking-tight transition-all duration-300 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                        {item.label}
                      </span>

                      {/* Subtle Background Hover */}
                      <div className={`absolute inset-0 -z-10 bg-gradient-to-r from-accent-gold/10 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Theme Toggle Footer */}
      <div className="p-6 border-t border-border flex-shrink-0">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 bg-bg-card hover:bg-bg-primary rounded-xl border border-border hover:border-accent-gold transition-all group"
        >
          <div className="flex items-center gap-3">
            {theme === 'dark' ? <Moon className="w-5 h-5 text-accent-gold" /> : <Sun className="w-5 h-5 text-accent-gold" />}
            <span className="text-sm font-bold text-text-primary group-hover:text-accent-gold transition-colors">
              {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-accent-gold' : 'bg-bg-secondary border border-border'}`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>
      </div>
    </aside>
  )
}
