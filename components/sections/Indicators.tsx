'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Indicator } from '@/types'
import { getFullImageUrl } from '@/lib/utils'
import { motion } from 'framer-motion'
import ApiService from '@/services/ApiService'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'

export default function Indicators() {
  const { user } = useSelector((state: RootState) => state.auth)
  const userId = user?.id
  console.log(0, 'User ID in Indicators component:', userId)

  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)

  const [itemsPerPage, setItemsPerPage] = useState(1)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setItemsPerPage(3)
      else if (window.innerWidth >= 768) setItemsPerPage(2)
      else setItemsPerPage(1)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // useEffect(() => {
  //   const fetchIndicators = async () => {
  //     try {
  //       let data: Indicator[]

  //       if (userId) {
  //         data = await ApiService.getAllIndicators(userId)
  //       } else {
  //         data = await ApiService.getAllIndicators()
  //       }

  //       const activeIndicators = data.filter(ind => ind.activeStatus)
  //       setIndicators(activeIndicators)
  //     } catch (err) {
  //       console.error('Error fetching indicators:', err)
  //       setError(err instanceof Error ? err.message : 'An error occurred')
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchIndicators()
  // }, [userId])

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const data: Indicator[] = await ApiService.getAllIndicators();

        const activeIndicators = data.filter(ind => ind.activeStatus);
        setIndicators(activeIndicators);
      } catch (err) {
        console.error('Error fetching indicators:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchIndicators();
  }, []);


  const handleNext = useCallback(() => {
    setCurrentIndex(prev =>
      prev >= indicators.length - itemsPerPage ? 0 : prev + 1
    )
  }, [indicators.length, itemsPerPage])

  useEffect(() => {
    if (indicators.length <= itemsPerPage || isHovered) return

    const interval = setInterval(() => {
      handleNext()
    }, 4000)

    return () => clearInterval(interval)
  }, [indicators.length, itemsPerPage, isHovered, handleNext])

  const handlePrev = () => {
    setCurrentIndex(prev =>
      prev === 0 ? Math.max(0, indicators.length - itemsPerPage) : prev - 1
    )
  }

  if (loading) {
    return (
      <section id="indicators" className="py-20 bg-bg-primary">
        <div className="w-[90%] max-w-[1800px] mx-auto px-6 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-text-primary/10 mx-auto mb-8 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="h-80 bg-bg-card rounded-2xl border border-border"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="indicators" className="py-20 bg-bg-primary">
        <div className="w-[90%] max-w-[1800px] mx-auto px-6 text-center">
          <p className="text-red-500">Error loading indicators: {error}</p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="indicators"
      className="py-20 bg-bg-primary overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-[90%] max-w-[1800px] mx-auto px-6 relative z-10">
        <div className="text-center mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-sm text-accent-gold uppercase tracking-[4px] mb-4 font-bold"
          >
            Premium Indicators
          </motion.div>
          <h2 className="font-cinzel text-4xl md:text-6xl font-black mb-8 text-text-primary tracking-tight">
            Trading <span className="text-accent-gold">Indicators</span>
          </h2>
        </div>

        <div className="relative group/slider">
          <button onClick={handlePrev} className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-30 bg-bg-card/80 border border-border p-5 rounded-full backdrop-blur-sm shadow-lg">
            <ChevronLeft className="w-6 h-6 text-text-primary" />
          </button>

          <button onClick={handleNext} className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-30 bg-bg-card/80 border border-border p-5 rounded-full backdrop-blur-sm shadow-lg">
            <ChevronRight className="w-6 h-6 text-text-primary" />
          </button>

          <div className="overflow-hidden py-5 px-4">
            <motion.div className="flex gap-8">
              {indicators.map(indicator => (
                <div
                  key={indicator.id}
                  className="flex-shrink-0 w-full md:w-1/2 lg:w-[31%] bg-bg-card border border-border rounded-3xl overflow-hidden shadow-xl flex flex-col relative"
                >

                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={getFullImageUrl(indicator.imageUrl)}
                      alt={indicator.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-bg-card/90 via-bg-card/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/5 via-transparent to-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Hover Overlay Effect */}
                    <div className="absolute inset-0 bg-accent-gold/0 group-hover:bg-accent-gold/5 transition-all duration-500" />

                    {!indicator.isPurchased && (
                      <div className="absolute top-4 right-4 bg-bg-card/80 border border-border px-4 py-1 rounded-xl text-accent-gold font-black shadow-lg">
                        ₹{indicator.price}
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    {indicator.isPurchased && (
                      <div className="bg-accent-green/10 border border-accent-green/30 text-accent-green px-3 py-1 rounded-lg text-xs font-black mb-3 inline-block w-fit">
                        PURCHASED
                      </div>
                    )}
                    <h3 className="text-text-primary font-bold text-xl mb-2">
                      {indicator.title}
                    </h3>
                    <div
                      className="text-text-secondary text-base mb-6 line-clamp-3 min-h-[4.5rem] relative z-10 font-montserrat"
                      dangerouslySetInnerHTML={{ __html: indicator.description }}
                    />

                    <Link
                      href={
                        indicator.isPurchased
                          ? `/viewindicators/${indicator.id}`
                          : `/indicators/${indicator.id}`
                      }
                      className="w-full py-3 rounded-xl text-center font-bold text-lg flex items-center justify-center gap-2 text-accent-gold border border-accent-gold/20 bg-accent-gold/5 hover:bg-accent-gold/10 transition-colors active:scale-[0.98] mt-auto"
                    >
                      {/* {indicator.isPurchased ? (
                        <>
                          View Details <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          Buy Now <ArrowRight className="w-4 h-4" />
                        </>
                      )} */}
                      <>
                        View Details <ArrowRight className="w-4 h-4" />
                      </>
                    </Link>

                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
