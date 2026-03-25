'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { NewsItem } from '@/types'
import { getFullImageUrl } from '@/lib/utils'
import ApiService from '@/services/ApiService'

export default function News() {
  const [, setNewsItems] = useState<NewsItem[]>([])
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const [itemsPerPage, setItemsPerPage] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setItemsPerPage(3);
      else if (window.innerWidth >= 768) setItemsPerPage(2);
      else setItemsPerPage(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await ApiService.getAllNews()

        const publishedNews = data.filter((item: NewsItem) =>
          item.activeStatus && item.newsStatus === "PUBLISHED"
        )

        setNewsItems(publishedNews)
        setNews(publishedNews)
      } catch (err) {
        console.error('Error fetching news:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  // Calculate total slides
  const totalSlides = Math.max(1, Math.ceil(news.length / itemsPerPage));

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev >= totalSlides - 1) return prev;
      return prev + 1;
    });
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev <= 0) return prev;
      return prev - 1;
    });
  }, []);

  useEffect(() => {
    if (news.length <= itemsPerPage || isHovered) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(interval);
  }, [news, itemsPerPage, isHovered, handleNext]);

  const showPrevArrow = currentIndex > 0;
  const showNextArrow = currentIndex < totalSlides - 1 && news.length > itemsPerPage;



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

          <div className="flex justify-center gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full md:w-[calc((100%-32px)/2)] lg:w-[calc((100%-64px)/3)] bg-bg-card border-2 border-border rounded-2xl p-6">
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
    <section
      id="news"
      className="py-20 bg-bg-primary relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-[90%] max-w-[1800px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-sm text-accent-gold uppercase tracking-[4px] mb-4 font-bold">Market Insights</div>
          <h2 className="font-cinzel text-5xl font-bold mb-6 text-text-primary">
            Latest <span className="text-accent-gold">News</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-[700px] mx-auto font-medium">
            Real-time updates on market trends, indicators, and trading strategies
          </p>
        </div>

        {news.length === 0 ? (
          <div className="text-center text-text-secondary py-20 bg-bg-card rounded-3xl border border-border">
            <div className="text-2xl font-cinzel mb-2">No News Available</div>
            <p>Check back later for the latest market insights.</p>
          </div>
        ) : (
          <div className="relative group/slider">
            {/* Previous Arrow - Only show when not at start */}
            {showPrevArrow && (
              <button
                onClick={handlePrev}
                className="absolute left-[-20px] lg:left-[-40px] top-1/2 -translate-y-1/2 z-30 bg-bg-card/80 hover:bg-accent-gold border border-border hover:border-accent-gold p-5 rounded-full backdrop-blur-xl flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group-hover/slider:opacity-100 opacity-0 group-hover/slider:translate-x-0 -translate-x-4"
                aria-label="Previous news"
              >
                <ChevronLeft className="w-6 h-6 text-text-primary group-hover:text-bg-primary" />
              </button>
            )}

            {/* Next Arrow - Only show when not at end */}
            {showNextArrow && (
              <button
                onClick={handleNext}
                className="absolute right-[-20px] lg:right-[-40px] top-1/2 -translate-y-1/2 z-30 bg-bg-card/80 hover:bg-accent-gold border border-border hover:border-accent-gold p-5 rounded-full backdrop-blur-xl flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group-hover/slider:opacity-100 opacity-0 group-hover/slider:translate-x-0 translate-x-4"
                aria-label="Next news"
              >
                <ChevronRight className="w-6 h-6 text-text-primary group-hover:text-bg-primary" />
              </button>
            )}

            <div className="overflow-hidden py-5 px-0">
              <motion.div
                className="flex -mx-4"
                animate={{
                  x: `-${currentIndex * (100 / itemsPerPage)}%`
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 25,
                  bounce: 0.1
                }}
              >
                {news.map((item) => (
                  <div
                    key={item.id}
                    className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4"
                  >
                    <Link
                      href={`/news/${item.id}`}
                      className="block h-full"
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        viewport={{ once: true }}
                        className="h-full"
                      >
                        {/* Use flex-col and h-full - height will be determined by sibling cards */}
                        <div className="bg-bg-card border-2 border-border hover:border-accent-gold transition-all duration-500 group cursor-pointer h-full flex flex-col shadow-xl hover:shadow-accent-gold/10 rounded-3xl overflow-hidden">

                          {/* Image Section - Fixed Height (always same) */}
                          {item.imageUrl && item.imageUrl !== "string" ? (
                            <div className="relative aspect-[4/3] w-full overflow-hidden flex-shrink-0 border-b border-border">
                              <Image
                                src={getFullImageUrl(item.imageUrl)}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />

                              {/* Gradient Overlays */}
                              <div className="absolute inset-0 bg-gradient-to-t from-bg-card/90 via-bg-card/40 to-transparent" />
                              <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/5 via-transparent to-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                              {/* Hover Overlay */}
                              <div className="absolute inset-0 bg-accent-gold/0 group-hover:bg-accent-gold/5 transition-all duration-500 flex items-center justify-center">
                              </div>
                            </div>
                          ) : (
                            <div className="h-64 w-full bg-gradient-to-br from-bg-secondary to-bg-card rounded-t-3xl flex items-center justify-center border-b border-border flex-shrink-0">
                              <ImageIcon className="w-12 h-12 text-text-secondary/50" />
                            </div>
                          )}

                          {/* Content section - Remove fixed min-heights, let flex handle it */}
                          <div className="p-6 flex flex-col flex-grow">
                            {/* Category and Status */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-base text-accent-gold font-bold truncate">
                                {item.newsCategoryName || 'News'}
                              </span>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 text-text-primary group-hover:text-accent-gold transition line-clamp-2 leading-tight">
                              {item.title}
                            </h3>

                            <div
                              className="text-text-secondary text-base mb-6 leading-relaxed line-clamp-3 min-h-[4.5rem] relative z-10 font-montserrat"
                              dangerouslySetInnerHTML={{ __html: item.shortDescription || item.description }}
                            />


                            <div className="flex items-center justify-between text-sm text-text-secondary pt-4 border-t border-border/50 mt-auto">

                              <div className="flex flex-col gap-1">


                                <span className="text-xs text-text-primary/60 font-medium">
                                  {formatDateTime(item.createdDate)}
                                </span>
                              </div>

                              <span className="text-accent-gold group-hover:translate-x-1 transition whitespace-nowrap font-bold">
                                Read More →
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Pagination Indicators */}
            {totalSlides > 1 && (
              <div className="flex justify-center items-center gap-3 mt-10">
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`transition-all duration-500 ease-out rounded-full ${currentIndex === i
                      ? 'bg-accent-gold w-10 h-1.5'
                      : 'bg-text-primary/10 hover:bg-text-primary/30 w-3 h-1.5 hover:w-5'
                      }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}