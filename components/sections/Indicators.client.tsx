'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Indicator } from '@/types'
import { getFullImageUrl } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'

export default function IndicatorsClient({ indicators }: { indicators: Indicator[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
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

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) =>
      prev >= indicators.length - itemsPerPage ? 0 : prev + 1
    )
  }, [indicators.length, itemsPerPage])

  useEffect(() => {
    if (indicators.length <= itemsPerPage || isHovered) return
    const interval = setInterval(handleNext, 4000)
    return () => clearInterval(interval)
  }, [indicators.length, itemsPerPage, isHovered, handleNext])

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, indicators.length - itemsPerPage) : prev - 1
    )
  }

  if (!indicators.length) {
    return (
      <section id="indicators" className="py-20 bg-[#0d1f23] text-center text-white">
        Marketplace Empty
      </section>
    )
  }

  return (
  <section
      id="indicators"
      className="py-24 bg-[#0d1f23] overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-gold/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-gold/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-[90%] max-w-[1800px] mx-auto px-6 relative z-10">
        <div className="text-center mb-20 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-sm text-accent-gold uppercase tracking-[5px] mb-4 font-bold"
          >
            Premium Indicators
          </motion.div>
          <h2 className="font-cinzel text-4xl md:text-6xl font-black mb-8 text-white tracking-tight text-center">
            Trading <span className="text-accent-gold">Indicators</span>
          </h2>
          <p className="text-text-secondary text-base md:text-xl max-w-[700px] mx-auto mb-6 leading-relaxed">
            Harness institutional-grade algorithms designed to dominate the markets with surgical precision.
          </p>
          <div className="inline-block px-8 py-2 border-y border-accent-gold/30 text-2xl font-black text-accent-gold tracking-[3px] uppercase">
            Marketplace
          </div>
        </div>

        <div className="relative group/slider">
          {/* Navigation Arrows - Premium Glass Style */}
          <button
            onClick={handlePrev}
            className="absolute left-[-20px] lg:left-[-40px] top-1/2 -translate-y-1/2 z-30 bg-white/5 hover:bg-accent-gold border border-white/10 hover:border-accent-gold p-5 rounded-full backdrop-blur-xl flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group-hover/slider:opacity-100 opacity-0 group-hover/slider:translate-x-0 -translate-x-4"
            aria-label="Previous indicator"
          >
            <ChevronLeft className="w-6 h-6 text-white group-hover:text-bg-primary" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-[-20px] lg:right-[-40px] top-1/2 -translate-y-1/2 z-30 bg-white/5 hover:bg-accent-gold border border-white/10 hover:border-accent-gold p-5 rounded-full backdrop-blur-xl flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 group-hover/slider:opacity-100 opacity-0 group-hover/slider:translate-x-0 translate-x-4"
            aria-label="Next indicator"
          >
            <ChevronRight className="w-6 h-6 text-white group-hover:text-bg-primary" />
          </button>

          <div className="overflow-hidden py-10 px-4">
            <motion.div
              className="flex gap-8"
              animate={{
                x: `calc(-${currentIndex * (100 / itemsPerPage)}% - ${currentIndex * (itemsPerPage > 1 ? 32 : 0)}px)`
              }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              {indicators.length > 0 ? indicators.map((indicator) => (
                <div
                  key={indicator.id}
                  className="flex-shrink-0 w-full md:w-[calc((100%-32px)/2)] lg:w-[calc((100%-64px)/3)] bg-[#051113] border border-white/5 rounded-3xl overflow-hidden hover:border-accent-gold/40 transition-all duration-500 flex flex-col group shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] relative"
                >
                  {/* Gold Shine Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-accent-gold/0 via-accent-gold/5 to-accent-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  <div className="relative h-64 w-full overflow-hidden">
                    <Image
                      src={getFullImageUrl(indicator.imageUrl) || `/course${(indicator.id % 4) + 1}.png`}
                      alt={indicator.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Glass Price Tag */}
                    <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-xl px-5 py-2 rounded-2xl border border-white/20 text-accent-gold font-black text-lg shadow-2xl z-20">
                      ₹{indicator.price}
                    </div>
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#051113] via-[#051113]/20 to-transparent opacity-80" />
                  </div>

                  <div className="p-8 flex flex-col flex-grow relative z-10">
                    <h3 className="font-cinzel text-2xl font-bold mb-4 text-white group-hover:text-accent-gold transition-colors leading-tight line-clamp-2">
                      {indicator.title}
                    </h3>
                    <div className="text-text-secondary text-base mb-8 flex-grow leading-relaxed line-clamp-4 h-[96px] overflow-hidden" dangerouslySetInnerHTML={{ __html: indicator.description }} />

                    <div className="flex items-center gap-4 mt-auto">
                      <Link
                        href={`/indicators/${indicator.id}`}
                        className="flex-1 bg-gradient-to-r from-accent-gold via-[#e5c158] to-[#c5a059] text-bg-primary py-4 rounded-2xl font-black hover:brightness-110 transition-all duration-300 text-center shadow-[0_10px_20px_rgba(212,175,55,0.2)] active:scale-95 relative overflow-hidden group/btn"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          Buy Now <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                        </span>
                        {/* Shimmer Effect */}
                        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover/btn:animate-[shimmer_2s_infinite]" />
                      </Link>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="w-full text-center text-text-secondary py-20 bg-white/5 rounded-3xl border border-white/10">
                  <div className="text-2xl font-cinzel mb-2">Marketplace Empty</div>
                  <p>New algorithmic tools are currently being refined.</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Pagination Indicators - Professional Style */}
          <div className="flex justify-center items-center gap-3 mt-12">
            {Array.from({ length: Math.max(0, indicators.length - itemsPerPage + 1) }).map((_, i) => (
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
        </div>
      </div>

      {/* CSS for Shimmer Animation */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            left: 200%;
          }
        }
      `}</style>
    </section>
  )
}
