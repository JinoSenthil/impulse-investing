'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, User as UserIcon, LogOut, LayoutDashboard, ChevronDown, Crown, LogIn, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { logout } from '@/lib/features/auth/authSlice'
import { usePathname } from 'next/navigation'
import { getFullImageUrl } from '@/lib/utils'
import { useTheme } from '@/components/providers/ThemeProvider'

export default function Navigation() {
    const { theme, toggleTheme } = useTheme()
    const [scrolled, setScrolled] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [activeSection, setActiveSection] = useState('')
    const pathname = usePathname()
    const dispatch = useDispatch()
    const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

    const avatarUrl = mounted && user?.profileImage ? getFullImageUrl(user.profileImage) : ''

    const handleLogout = () => {
        dispatch(logout())
        setIsMenuOpen(false)
    }

    useEffect(() => {
        setMounted(true)

        const handleScroll = () => {
            setScrolled(window.scrollY > 50)

            // Detect active section
            const sections = ['home', 'about', 'introduction', 'features', 'indicators', 'courses', 'news', 'contact']
            const scrollPosition = window.scrollY + 120 // Offset for better detection

            if (window.scrollY < 50) {
                setActiveSection('#home')
                return
            }

            for (const section of sections) {
                const element = document.getElementById(section)
                if (element) {
                    const { offsetTop, offsetHeight } = element
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(`#${section}`)
                        break
                    }
                }
            }
        }

        const handleClickOutside = (e: MouseEvent) => {
            if (isProfileOpen && !(e.target as Element).closest('.profile-dropdown')) {
                setIsProfileOpen(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        window.addEventListener('click', handleClickOutside)

        // Initial check
        handleScroll()

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('click', handleClickOutside)
        }
    }, [isProfileOpen])

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
    }, [isMenuOpen])

    const navLinks = [
        { href: '/#home', label: 'Home', isAnchor: true },
        { href: '/#features', label: 'Features', isAnchor: true },
        { href: '/#indicators', label: 'Products', isAnchor: true },
        { href: '/#courses', label: 'Courses', isAnchor: true },
        { href: '/premium-courses', label: 'Premium Courses', isAnchor: false, isPremium: true },
        { href: '/#news', label: 'News', isAnchor: true },
        { href: '/#about', label: 'About', isAnchor: true },
        { href: '/#contact', label: 'Contact', isAnchor: true },
    ]

    const isActive = (href: string) => {
        // For non-anchor links (like /premium-courses)
        if (!href.includes('#')) {
            return pathname === href
        }

        // For anchor links
        const hash = href.split('#')[1]

        // Special case for home anchor
        if (hash === 'home' || hash === '') {
            return (activeSection === '#home' || activeSection === '') && pathname === '/'
        }

        return activeSection === `#${hash}` && pathname === '/'
    }

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-bg-primary backdrop-blur-xl border-b border-border' : 'bg-transparent'
            }`}>
            <div className="w-[95%] max-w-[1700px] mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                <Link href="/#" className="flex items-center gap-3 group">
                    <Image
                        src="/logo2.png"
                        alt="Logo"
                        width={45}
                        height={45}
                        className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
                        priority
                    />
                    <span className="font-cinzel text-xl sm:text-2xl font-bold tracking-[2px] text-accent-gold transition-colors">
                        IMPULSE
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <ul className="hidden lg:flex gap-6 xl:gap-8 items-center">
                    {navLinks.map((link) => (
                        <li key={link.href}>
                            {link.isPremium ? (
                                <Link
                                    href={link.href}
                                    className={`flex items-center gap-1.5 transition font-bold text-sm group ${isActive(link.href)
                                        ? 'text-accent-gold'
                                        : 'text-accent-teal hover:text-accent-teal/80'
                                        }`}
                                >
                                    <Crown size={16} className="transition-transform group-hover:scale-110" />
                                    {link.label}
                                </Link>
                            ) : link.isAnchor ? (
                                <a
                                    href={link.href}
                                    className={`transition font-bold text-sm ${isActive(link.href)
                                        ? 'text-accent-gold font-bold'
                                        : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                >
                                    {link.label}
                                </a>
                            ) : (
                                <Link
                                    href={link.href}
                                    className={`transition font-bold text-sm ${isActive(link.href)
                                        ? 'text-accent-gold font-bold'
                                        : 'text-text-secondary hover:text-text-primary'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-4">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-xl bg-bg-card border border-border text-text-primary hover:bg-bg-secondary transition-all group relative"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? (
                            <Sun size={18} className="group-hover:rotate-45 transition-transform duration-500" />
                        ) : (
                            <Moon size={18} className="group-hover:-rotate-12 transition-transform duration-500 text-accent-gold" />
                        )}
                    </button>

                    {mounted && (
                        <>
                            {isAuthenticated ? (
                                <div className="relative profile-dropdown">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-3 bg-bg-card hover:bg-bg-secondary p-1.5 pr-4 rounded-full border border-border transition-all group"
                                    >
                                        {avatarUrl ? (
                                            <Image
                                                src={avatarUrl}
                                                alt={(user && `${user.firstName} ${user.lastName}`) || 'User avatar'}
                                                width={36}
                                                height={36}
                                                className="w-9 h-9 rounded-full object-cover shadow-lg"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 bg-accent-gold rounded-full flex items-center justify-center text-bg-primary shadow-lg shadow-accent-gold/20">
                                                <UserIcon size={18} />
                                            </div>
                                        )}
                                        <div className="flex flex-col items-start min-w-0 max-w-[120px]">
                                            <span className="text-xs font-bold text-text-primary truncate w-full">
                                                {user?.firstName} {user?.lastName}
                                            </span>
                                            <span className="text-[10px] text-accent-gold font-black uppercase tracking-wider">
                                                {user?.isPremium ? 'Elite' : 'Member'}
                                            </span>
                                        </div>
                                        <ChevronDown size={14} className={`text-text-secondary transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isProfileOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-56 bg-bg-card border border-border rounded-2xl shadow-2xl overflow-hidden py-1.5"
                                            >
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center gap-3 px-5 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition"
                                                >
                                                    <LayoutDashboard size={16} />
                                                    Dashboard
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-500 hover:bg-red-500/10 transition"
                                                >
                                                    <LogOut size={16} />
                                                    Logout
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="flex items-center gap-2 border border-accent-teal/30 px-6 py-2 rounded-xl text-accent-teal font-bold text-sm hover:bg-accent-teal hover:text-white transition-all shadow-[0_0_15px_rgba(20,184,166,0.1)]"
                                >
                                    <LogIn size={18} />
                                    Login
                                </Link>
                            )}
                        </>
                    )}

                    {!mounted && (
                        <div className="w-24 h-9 bg-bg-card rounded-xl animate-pulse" />
                    )}

                    {/* Mobile Toggle */}
                    <button
                        className="lg:hidden p-2 text-text-primary"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-black/95 backdrop-blur-md z-40 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-screen w-[300px] bg-bg-primary border-l border-border z-50 lg:hidden p-8 flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-4">
                                    <Link href="/" className="flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                                        <Image src="/logo2.png" alt="Logo" width={30} height={30} />
                                        <span className="font-cinzel text-lg font-bold text-accent-gold">IMPULSE</span>
                                    </Link>
                                    <button
                                        onClick={toggleTheme}
                                        className="p-2 rounded-lg bg-bg-card border-border text-text-primary"
                                    >
                                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} className="text-accent-gold" />}
                                    </button>
                                </div>
                                <button onClick={() => setIsMenuOpen(false)} className="text-text-primary">
                                    <X size={24} />
                                </button>
                            </div>

                            <ul className="flex flex-col gap-5 flex-grow font-bold">
                                {navLinks.map((link) => (
                                    <li key={link.href}>
                                        {link.isPremium ? (
                                            <Link
                                                href={link.href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={`text-xl transition font-bold flex items-center gap-2 ${isActive(link.href)
                                                    ? 'text-accent-gold'
                                                    : 'text-accent-teal hover:text-green-400'
                                                    }`}
                                            >
                                                <Crown size={20} />
                                                {link.label}
                                            </Link>
                                        ) : link.isAnchor ? (
                                            <a
                                                href={link.href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={`text-xl transition font-bold block ${isActive(link.href)
                                                    ? 'text-accent-gold font-bold'
                                                    : 'text-text-secondary hover:text-text-primary'
                                                    }`}
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            <Link
                                                href={link.href}
                                                onClick={() => setIsMenuOpen(false)}
                                                className={`text-xl transition font-bold block ${isActive(link.href)
                                                    ? 'text-accent-gold font-bold'
                                                    : 'text-text-secondary hover:text-text-primary'
                                                    }`}
                                            >
                                                {link.label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-auto pt-8 border-t border-border">
                                {mounted && (
                                    <>
                                        {isAuthenticated ? (
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div>
                                                        {avatarUrl ? (
                                                            <Image
                                                                src={avatarUrl}
                                                                alt={(user && `${user.firstName} ${user.lastName}`) || 'User avatar'}
                                                                width={48}
                                                                height={48}
                                                                className="w-12 h-12 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 bg-accent-gold rounded-full flex items-center justify-center text-bg-primary">
                                                                <UserIcon size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-text-primary font-bold">{user?.firstName} {user?.lastName}</p>
                                                        <p className="text-xs text-accent-gold font-black uppercase">{user?.isPremium ? 'Elite' : 'Member'}</p>
                                                    </div>
                                                </div>
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center gap-3 text-lg text-text-secondary hover:text-text-primary py-2"
                                                >
                                                    <LayoutDashboard size={20} />
                                                    Dashboard
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="flex items-center gap-3 text-lg text-red-500 hover:text-red-400 py-2"
                                                >
                                                    <LogOut size={20} />
                                                    Logout
                                                </button>
                                            </div>
                                        ) : (
                                            <Link
                                                href="/login"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="w-full flex justify-center items-center gap-2 border border-accent-teal px-7 py-3 rounded-xl text-accent-teal font-bold text-lg hover:bg-accent-teal hover:text-white transition-all"
                                            >
                                                <LogIn size={20} />
                                                Login
                                            </Link>
                                        )}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </nav>
    )
}
