// components/sections/News.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Image as ImageIcon, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { NewsItem } from '@/types'
import { getFullImageUrl } from '@/lib/utils'
import ApiService from '@/services/ApiService'

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageIndices, setImageIndices] = useState<{ [key: number]: number }>({})

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await ApiService.getAllNews()

        const publishedNews = data.filter((item: NewsItem) =>
          item.activeStatus && item.newsStatus === "PUBLISHED"
        )

        // Show only latest 3 news
        const latestNews = publishedNews.slice(0, 3)

        setNews(latestNews)

        // Initialize image indices for each news item
        const initialIndices: { [key: number]: number } = {}
        latestNews.forEach((item: NewsItem) => {
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

  // Helper to get image array
  const getImageArray = (imageUrl: string | string[]): string[] => {
    if (!imageUrl) return []
    if (Array.isArray(imageUrl)) return imageUrl
    return [imageUrl]
  }

  // Auto-scroll effect for each news item (cycling images within card)
  useEffect(() => {
    const intervals: { [key: number]: NodeJS.Timeout } = {}

    news.forEach((item) => {
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
  }, [news])

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

  if (loading) {
    return (
      <section id="news" className="py-20 px-6 bg-bg-primary text-text-primary">
        <div className="w-[90%] max-w-[1800px] mx-auto">
          <div className="text-center mb-16">
            <div className="text-sm text-accent-gold uppercase tracking-[4px] mb-4 font-bold">Market Insights</div>
            <h2 className="font-cinzel text-5xl font-bold mb-6 text-text-primary">
              Latest <span className="text-accent-gold">News</span>
            </h2>
            <div className="h-4 w-64 bg-text-primary/10 rounded mx-auto mb-4 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-bg-card border-2 border-border rounded-2xl p-6">
                <div className="h-48 bg-text-primary/10 rounded-lg mb-4 animate-pulse" />
                <div className="h-4 w-32 bg-text-primary/10 rounded mb-4 animate-pulse" />
                <div className="h-6 w-full bg-text-primary/10 rounded mb-3 animate-pulse" />
                <div className="h-12 w-full bg-text-primary/10 rounded mb-4 animate-pulse" />
                <div className="h-4 w-48 bg-text-primary/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="news" className="py-20 bg-bg-primary">
        <div className="w-[90%] max-w-[1800px] mx-auto px-6 text-center">
          <p className="text-red-500">Error loading news: {error}</p>
        </div>
      </section>
    )
  }

  return (
    <section id="news" className="py-20 bg-bg-primary relative overflow-hidden">
      <div className="w-[90%] max-w-[1800px] mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm text-accent-gold uppercase tracking-[4px] mb-4 font-bold"
          >
            Market Insights
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="font-cinzel text-5xl font-bold mb-6 text-text-primary"
          >
            Latest <span className="text-accent-gold">News</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-text-secondary text-lg max-w-[700px] mx-auto font-medium"
          >
            Real-time updates on market trends, indicators, and trading strategies
          </motion.p>
        </div>

        {news.length === 0 ? (
          <div className="text-center text-text-secondary py-20 bg-bg-card rounded-3xl border border-border">
            <div className="text-2xl font-cinzel mb-2">No News Available</div>
            <p>Check back later for the latest market insights.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex justify-end mb-8">
              <Link
                href="/news"
                className="group flex items-center gap-2 text-accent-gold hover:text-white transition-all duration-300 text-sm font-bold uppercase tracking-widest"
              >
                View All News
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {news.map((item, index) => {
                const imageArray = getImageArray(item.imageUrl)
                const currentImageIndex = imageIndices[item.id] || 0
                const currentImage = imageArray[currentImageIndex]
                const hasMultipleImages = imageArray.length > 1

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <Link href={`/news/${item.id}`} className="block h-full">
                      <div className="bg-bg-card border-2 border-border hover:border-accent-gold transition-all duration-500 cursor-pointer h-full flex flex-col shadow-xl hover:shadow-accent-gold/10 rounded-3xl overflow-hidden">
                        {/* Image Section */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden flex-shrink-0">
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
                              <div className="absolute inset-0 bg-gradient-to-t from-bg-card/90 via-bg-card/40 to-transparent" />

                              {hasMultipleImages && (
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
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
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-secondary to-bg-card">
                              <ImageIcon className="w-12 h-12 text-text-secondary/50" />
                            </div>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="p-6 flex flex-col flex-grow">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-base text-accent-gold font-bold">
                              {item.newsCategoryName || 'News'}
                            </span>
                          </div>

                          <h3 className="text-2xl font-bold mb-4 text-text-primary group-hover:text-accent-gold transition line-clamp-2 leading-tight">
                            {item.title}
                          </h3>

                          <div
                            className="text-text-secondary text-base mb-6 leading-relaxed line-clamp-3 min-h-[4.5rem] font-montserrat"
                            dangerouslySetInnerHTML={{ __html: item.shortDescription || item.description }}
                          />

                          <div className="flex items-center justify-between text-sm text-text-secondary pt-4 border-t border-border/50 mt-auto">
                            <span className="text-xs text-text-primary/60 font-medium">
                              {formatDateTime(item.createdDate)}
                            </span>
                            <span className="text-accent-gold group-hover:translate-x-1 transition font-bold">
                              Read More →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}