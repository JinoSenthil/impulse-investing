// app/news/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Image as ImageIcon, ArrowLeft, ArrowRight, Home } from 'lucide-react'
import { motion } from 'framer-motion'
import { NewsItem } from '@/types'
import { getFullImageUrl } from '@/lib/utils'
import ApiService from '@/services/ApiService'
import GlobalLoading from '@/components/ui/GlobalLoading'

export default function NewsListingPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageIndices, setImageIndices] = useState<{ [key: number]: number }>({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await ApiService.getAllNews()

        const publishedNews = data.filter((item: NewsItem) =>
          item.activeStatus && item.newsStatus === "PUBLISHED"
        )

        setNews(publishedNews)

        // Initialize image indices for each news item
        const initialIndices: { [key: number]: number } = {}
        publishedNews.forEach((item: NewsItem) => {
          const imageArray = getImageArray(item.imageUrl)
          if (imageArray.length > 1) {
            initialIndices[item.id] = 0
          }
        })
        setImageIndices(initialIndices)
      } catch (err) {
        console.error('Error fetching news:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  // Pagination logic
  const totalPages = Math.ceil(news.length / itemsPerPage)
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentNewsItems = news.slice(indexOfFirstItem, indexOfLastItem)

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Helper to get image array
  const getImageArray = (imageUrl: string | string[]): string[] => {
    if (!imageUrl) return []
    if (Array.isArray(imageUrl)) return imageUrl
    return [imageUrl]
  }

  // Auto-scroll effect for each news item
  useEffect(() => {
    const intervals: { [key: number]: NodeJS.Timeout } = {}

    currentNewsItems.forEach((item) => {
      const imageArray = getImageArray(item.imageUrl)
      if (imageArray.length > 1) {
        intervals[item.id] = setInterval(() => {
          setImageIndices(prev => ({
            ...prev,
            [item.id]: ((prev[item.id] || 0) + 1) % imageArray.length
          }))
        }, 3000)
      }
    })

    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval))
    }
  }, [currentNewsItems])

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) return <GlobalLoading />

  return (
    <div className="min-h-screen bg-[#020C0E] text-white">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-gold/5 blur-[120px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#05161A]/80 backdrop-blur-xl border-b border-green-500/10 px-6 py-4 shadow-2xl">
        <div className="w-[90%] max-w-[1800px] mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-text-secondary hover:text-green-400 transition-colors font-semibold group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>

          <div className="text-center">
            <h1 className="text-lg font-bold text-accent-gold tracking-[2px]">IMPULSE TRADING ACADEMY</h1>
          </div>

          <Link
            href="/"
            className="text-text-secondary hover:text-green-500 font-semibold p-2 rounded-full hover:bg-white/5 transition-all"
          >
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-[90%] max-w-[1800px] mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-accent-gold uppercase tracking-[4px] mb-4 font-bold"
          >
            Market Insights
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-cinzel text-5xl md:text-6xl font-bold mb-6 text-white"
          >
            Global <span className="text-accent-gold">News</span> Feed
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="h-1 w-24 bg-accent-gold mx-auto mb-6 rounded-full"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-text-secondary text-lg max-w-[700px] mx-auto font-medium"
          >
            Stay updated with the latest market trends, economic shifts, and trading strategies from our experts.
          </motion.p>
        </div>

        {error ? (
          <div className="text-center py-20 bg-bg-card/50 rounded-3xl border border-red-500/20 backdrop-blur-sm">
            <p className="text-red-400 text-xl">Error loading news: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all font-bold"
            >
              Try Again
            </button>
          </div>
        ) : news.length === 0 ? (
          <div className="text-center text-text-secondary py-20 bg-bg-card/30 rounded-3xl border border-white/5 backdrop-blur-sm shadow-2xl">
            <div className="text-2xl font-cinzel mb-2">No News Available</div>
            <p>Check back later for the latest market insights.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 min-h-[800px] items-start">
              {currentNewsItems.map((item, index) => {
                const imageArray = getImageArray(item.imageUrl)
                const currentImageIndex = imageIndices[item.id] || 0
                const currentImage = imageArray[currentImageIndex]
                const hasMultipleImages = imageArray.length > 1

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index % 3) * 0.1 }}
                  >
                    <Link href={`/news/${item.id}`} className="group block h-full">
                      <div className="bg-[#05161A] border-2 border-white/5 hover:border-accent-gold/50 transition-all duration-500 cursor-pointer h-full flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-accent-gold/10 rounded-3xl overflow-hidden group">

                        {/* Image Section */}
                        <div className="relative aspect-[16/10] w-full overflow-hidden flex-shrink-0">
                          {currentImage && currentImage !== "string" ? (
                            <>
                              <Image
                                src={getFullImageUrl(currentImage)}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                unoptimized
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-[#05161A] via-transparent to-transparent opacity-60" />

                              {hasMultipleImages && (
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                                  {imageArray.map((_, idx) => (
                                    <div
                                      key={idx}
                                      className={`h-1 transition-all duration-300 ${idx === currentImageIndex ? 'w-5 bg-accent-gold' : 'w-1.5 bg-white/40'
                                        } rounded-full`}
                                    />
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-secondary to-[#05161A]">
                              <ImageIcon className="w-12 h-12 text-white/20" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4">
                            <span className="px-3 py-1 bg-accent-gold/90 text-bg-primary text-xs font-black uppercase tracking-wider rounded-lg shadow-lg">
                              {item.newsCategoryName || 'News'}
                            </span>
                          </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-8 flex flex-col flex-grow">
                          <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-accent-gold transition line-clamp-2 leading-tight font-cinzel">
                            {item.title}
                          </h3>

                          <div
                            className="text-text-secondary text-base mb-8 leading-relaxed line-clamp-3 min-h-[4.5rem] font-montserrat opacity-80"
                            dangerouslySetInnerHTML={{ __html: item.shortDescription || item.description }}
                          />

                          <div className="flex items-center justify-between text-sm text-text-secondary pt-6 border-t border-white/5 mt-auto">
                            <div className="flex flex-col">

                              <span className="text-xs text-white/70 font-bold">
                                {formatDateTime(item.createdDate)}
                              </span>
                            </div>
                            <span className="flex items-center gap-2 text-accent-gold font-black tracking-wider text-xs group-hover:gap-4 transition-all duration-300">
                              Read More
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-20">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${currentPage === 1
                    ? 'text-white/20 cursor-not-allowed'
                    : 'text-accent-gold hover:bg-accent-gold/10'
                    }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`w-12 h-12 rounded-xl font-bold transition-all duration-300 ${currentPage === i + 1
                        ? 'bg-accent-gold text-bg-primary shadow-lg shadow-accent-gold/20'
                        : 'text-white/60 hover:bg-white/5 border border-white/5'
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${currentPage === totalPages
                    ? 'text-white/20 cursor-not-allowed'
                    : 'text-accent-gold hover:bg-accent-gold/10'
                    }`}
                >
                  Next
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center mt-12 bg-[#01080A]">
        <h2 className="text-accent-gold font-cinzel font-bold tracking-widest mb-4">IMPULSE TRADING ACADEMY</h2>
        <p className="text-text-secondary text-sm font-medium opacity-60">
          &copy; {new Date().getFullYear()} Master the Art of Trading. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
