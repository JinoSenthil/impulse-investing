// app/news/[newsid]/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import ApiService from '@/services/ApiService'
import { NewsItem } from '@/types'
import { Image as ImageIcon, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { getFullImageUrl } from '@/lib/utils'
import { motion } from 'framer-motion'
import GlobalLoading from '@/components/ui/GlobalLoading'

export default function NewsDetailsPage() {
  const params = useParams()
  const newsid = params?.newsid

  const [categoryNews, setCategoryNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentNews, setCurrentNews] = useState<NewsItem | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(1)
  const [isHovered, setIsHovered] = useState(false)
  const [featuredImageIndex, setFeaturedImageIndex] = useState(0)
  const [carouselImageIndices, setCarouselImageIndices] = useState<{ [key: number]: number }>({})

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

  // Helper to get image array
  const getImageArray = (imageUrl: string | string[]): string[] => {
    if (!imageUrl) return []
    if (Array.isArray(imageUrl)) return imageUrl
    return [imageUrl]
  }

  useEffect(() => {
    const fetchNewsByCategory = async () => {
      try {
        if (!newsid) return

        setLoading(true)

        const clickedNews = await ApiService.getNewsById(Number(newsid))

        if (!clickedNews) {
          throw new Error('News not found')
        }

        setCurrentNews(clickedNews)
        setFeaturedImageIndex(0)

        const categoryId = clickedNews.newsCategoryId

        if (!categoryId) {
          throw new Error('No category found for this news')
        }
        const newsInCategory = await ApiService.getAllNews({
          newsCategoryId: categoryId,
          newsStatus: "PUBLISHED"
        })

        const activeNews = newsInCategory.filter(item => item.activeStatus)
        setCategoryNews(activeNews)
        
        // Initialize carousel indices for other articles
        const initialIndices: { [key: number]: number } = {}
        activeNews.forEach((item: NewsItem) => {
          if (item.id !== clickedNews.id) {
            const imageArray = getImageArray(item.imageUrl)
            if (imageArray.length > 1) {
              initialIndices[item.id] = 0
            }
          }
        })
        setCarouselImageIndices(initialIndices)
      } catch (err) {
        console.error('Failed to fetch news:', err)
        setError(err instanceof Error ? err.message : 'Failed to load news details')
      } finally {
        setLoading(false)
      }
    }

    fetchNewsByCategory()
  }, [newsid])

  // Auto-scroll for featured image
  useEffect(() => {
    if (!currentNews) return
    
    const featuredImageArray = getImageArray(currentNews.imageUrl)
    if (featuredImageArray.length <= 1) return

    const interval = setInterval(() => {
      setFeaturedImageIndex((prev) => (prev + 1) % featuredImageArray.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [currentNews])

  // Auto-scroll for carousel items
  useEffect(() => {
    const intervals: { [key: number]: NodeJS.Timeout } = {}
    
    categoryNews.forEach((item) => {
      if (item.id !== currentNews?.id) {
        const imageArray = getImageArray(item.imageUrl)
        if (imageArray.length > 1) {
          intervals[item.id] = setInterval(() => {
            setCarouselImageIndices(prev => ({
              ...prev,
              [item.id]: ((prev[item.id] || 0) + 1) % imageArray.length
            }))
          }, 3000)
        }
      }
    })
    
    return () => {
      Object.values(intervals).forEach(interval => clearInterval(interval))
    }
  }, [categoryNews, currentNews])

  const otherArticles = categoryNews.filter(item => item.id !== currentNews?.id)

  // Auto-slide functionality for carousel
  useEffect(() => {
    if (otherArticles.length <= itemsPerPage || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const totalSlides = Math.max(1, Math.ceil(otherArticles.length / itemsPerPage));
        if (prev >= totalSlides - 1) return 0;
        return prev + 1;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [otherArticles, itemsPerPage, isHovered]);

  const totalSlides = Math.max(1, Math.ceil(otherArticles.length / itemsPerPage));

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

  const showPrevArrow = currentIndex > 0;
  const showNextArrow = currentIndex < totalSlides - 1 && otherArticles.length > itemsPerPage;

  const truncateText = (html: string, limit = 100) => {
    const text = html.replace(/<[^>]*>/g, '');
    return text.length > limit ? text.slice(0, limit) + '...' : text;
  };

  const getTransformValue = () => {
    if (itemsPerPage === 1) {
      return `-${currentIndex * 100}%`;
    }
    const percentage = (currentIndex * 100) / itemsPerPage;
    return `-${percentage}%`;
  };

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
    return <GlobalLoading />;
  }

  if (error || !currentNews) {
    return (
      <div className="min-h-screen bg-[#020C0E] flex flex-col items-center justify-center text-white gap-4">
        <h1 className="text-2xl font-bold text-red-500">
          {error || 'News Not Found'}
        </h1>
        <Link href="/#news" className="text-accent-gold hover:underline">
          Return to News
        </Link>
      </div>
    )
  }

  const featuredImageArray = getImageArray(currentNews.imageUrl)
  const currentFeaturedImage = featuredImageArray[featuredImageIndex]
  const hasMultipleFeaturedImages = featuredImageArray.length > 1

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
            href="/#news"
            className="flex items-center gap-2 text-text-secondary hover:text-green-400 transition-colors font-semibold group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to All News</span>
          </Link>

          <div className="text-center">
            <h1 className="text-lg font-bold text-accent-gold">IMPULSE TRADING ACADEMY</h1>
          </div>

          <Link
            href="/"
            className="text-text-secondary hover:text-green-500 font-semibold text-sm"
          >
            Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 w-full mx-auto pt-8">
        {/* Featured Article Section */}
        <div className="mb-16">
          <div className="w-[90%] max-w-[1800px] mx-auto px-6">
            {/* Heading Section */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-sm text-accent-gold uppercase tracking-[4px] font-bold">
                  {currentNews.newsCategoryName || 'Market Insights'}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-accent-gold/50" />
                <span className="text-text-secondary text-sm">
                  {formatDateTime(currentNews.createdDate)}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white font-cinzel leading-tight max-w-5xl">
                {currentNews.title}
              </h1>
            </div>

            {/* Featured Content Grid - Image and Short Description */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-start">
              <div className="w-full">
                <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                  {currentFeaturedImage && currentFeaturedImage !== "string" ? (
                    <>
                      <Image
                        fill
                        src={getFullImageUrl(currentFeaturedImage)}
                        alt={currentNews.title}
                        className="object-cover transition-opacity duration-500"
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      
                      {/* Image Indicators for featured image */}
                      {hasMultipleFeaturedImages && (
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                          {featuredImageArray.map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-1 rounded-full transition-all duration-300 ${
                                idx === featuredImageIndex 
                                  ? 'w-5 bg-accent-gold' 
                                  : 'w-1.5 bg-white/40'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-bg-card rounded-2xl flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-text-secondary/50" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center h-full">
                {currentNews.shortDescription && (
                  <div className="relative">
                    <div className="absolute -left-6 top-0 bottom-0 w-1 bg-accent-gold/20 rounded-full" />
                    <p className="text-xl text-accent-gold font-medium leading-relaxed italic pl-6">
                      &quot;{currentNews.shortDescription}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Full Description Section */}
            <div className="max-w-5xl">
              <div
                className="prose prose-invert prose-lg max-w-none text-text-secondary text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: currentNews.description }}
              />
            </div>
          </div>
        </div>

        {/* More from this Category Section */}
        {otherArticles.length > 0 && (
          <div
            className="w-[90%] max-w-[1800px] mx-auto px-6"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <h2 className="text-2xl font-bold mb-8 text-accent-gold border-b border-accent-gold/30 pb-3 font-cinzel">
              More from this Category
            </h2>

            <div className="relative group/slider">
              {/* Previous Arrow */}
              {showPrevArrow && (
                <button
                  onClick={handlePrev}
                  className="absolute left-[-20px] lg:left-[-40px] top-1/2 -translate-y-1/2 z-30 bg-white/5 hover:bg-accent-gold border border-white/10 hover:border-accent-gold p-5 rounded-full backdrop-blur-xl flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group-hover/slider:opacity-100 opacity-0 group-hover/slider:translate-x-0 -translate-x-4"
                  aria-label="Previous news"
                >
                  <ChevronLeft className="w-6 h-6 text-white group-hover:text-bg-primary" />
                </button>
              )}

              {/* Next Arrow */}
              {showNextArrow && (
                <button
                  onClick={handleNext}
                  className="absolute right-[-20px] lg:right-[-40px] top-1/2 -translate-y-1/2 z-30 bg-white/5 hover:bg-accent-gold border border-white/10 hover:border-accent-gold p-5 rounded-full backdrop-blur-xl flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group-hover/slider:opacity-100 opacity-0 group-hover/slider:translate-x-0 translate-x-4"
                  aria-label="Next news"
                >
                  <ChevronRight className="w-6 h-6 text-white group-hover:text-bg-primary" />
                </button>
              )}

              <div className="overflow-hidden py-5 px-4">
                <motion.div
                  className="flex gap-8"
                  animate={{
                    x: getTransformValue()
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                    bounce: 0.1
                  }}
                >
                  {otherArticles.map((item) => {
                    const imageArray = getImageArray(item.imageUrl)
                    const currentCarouselIndex = carouselImageIndices[item.id] || 0
                    const currentImage = imageArray[currentCarouselIndex]
                    const hasMultipleImages = imageArray.length > 1
                    
                    return (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-full md:w-[calc((100%-32px)/2)] lg:w-[calc((100%-70px)/3)]"
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
                            <div className="bg-bg-card border-2 border-border hover:border-accent-gold transition-all duration-300 group cursor-pointer h-full flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] rounded-[10px] overflow-hidden">
                              {/* Image Section with AutoScroll */}
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
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#051113]/90 via-[#051113]/40 to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/5 via-transparent to-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute inset-0 bg-accent-gold/0 group-hover:bg-accent-gold/5 transition-all duration-500" />
                                    
                                    {/* Image Indicators */}
                                    {hasMultipleImages && (
                                      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                                        {imageArray.map((_, idx) => (
                                          <div
                                            key={idx}
                                            className={`h-1 rounded-full transition-all duration-300 ${
                                              idx === currentCarouselIndex 
                                                ? 'w-5 bg-accent-gold' 
                                                : 'w-1.5 bg-white/40'
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-[#0C2D2A] to-[#05161A] flex items-center justify-center">
                                    <ImageIcon className="w-12 h-12 text-text-secondary/50" />
                                  </div>
                                )}
                              </div>

                              {/* Content section */}
                              <div className="p-6 flex flex-col flex-grow">
                                <div className="flex items-center justify-between mb-3">
                                  <span className="text-sm text-accent-gold font-semibold truncate">
                                    {item.newsCategoryName || 'News'}
                                  </span>
                                </div>

                                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-accent-gold transition line-clamp-2 leading-tight">
                                  {item.title}
                                </h3>

                                <div className="mb-5 flex-grow">
                                  <p className="text-text-secondary line-clamp-3 leading-relaxed">
                                    {truncateText(item.shortDescription || item.description, 150)}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between text-sm text-text-secondary pt-4 border-t border-border/50 mt-auto">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-[11px] text-white/60">
                                      {formatDateTime(item.createdDate)}
                                    </span>
                                  </div>
                                  <span className="text-accent-gold group-hover:translate-x-1 transition whitespace-nowrap">
                                    Read More →
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </Link>
                      </div>
                    )
                  })}
                </motion.div>
              </div>

              {/* Pagination Indicators */}
              {totalSlides > 1 && (
                <div className="flex justify-center items-center gap-3 mt-8">
                  {Array.from({ length: totalSlides }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`transition-all duration-500 ease-out rounded-full ${currentIndex === i
                        ? 'bg-accent-gold w-10 h-1.5'
                        : 'bg-white/10 hover:bg-white/30 w-3 h-1.5 hover:w-5'
                        }`}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center mt-16">
        <p className="text-text-secondary text-sm font-medium">
          &copy; {new Date().getFullYear()} IMPULSE TRADING ACADEMY.
        </p>
      </footer>
    </div>
  )
}