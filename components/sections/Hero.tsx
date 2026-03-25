'use client';

import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import ApiService, { parseArrayResponse } from '@/services/ApiService';
import { HomePageData } from '@/types';
import Link from 'next/link';

export default function Hero() {
  const [heroData, setHeroData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const data = await ApiService.getHomePageData();
        const list = parseArrayResponse<HomePageData>(data);
        const activeData = list.find(item => item.activeStatus);
        setHeroData(activeData || null);
      } catch (err) {
        console.error('Failed to fetch hero data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-accent-gold font-cinzel text-xl animate-pulse font-bold">Loading...</div>
      </section>
    )
  }

  if (!heroData) return null

  // Use API data
  const title = heroData.title
  const point1 = heroData.point1
  const point2 = heroData.point2
  const point3 = heroData.point3
  const description = heroData.shortDescription

  return (
    <section id="home" className="min-h-screen flex items-center px-6 sm:px-8 pt-32 sm:pt-36 pb-20 bg-gradient-to-br from-bg-primary to-bg-secondary relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(201,149,31,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(201,149,31,0.03)_1px,transparent_1px)] bg-[length:30px_30px] sm:bg-[length:50px_50px] z-0" />

      <div className="w-[90%] max-w-[1800px] mx-auto text-center relative z-10">
        <h1 className="font-cinzel text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[6px] sm:tracking-[10px] md:tracking-[12px] text-accent-gold mb-4 drop-shadow-sm leading-none">
          {title}
        </h1>

        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-accent-gold/50" />
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-accent-teal" />
          <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-accent-gold/50" />
        </div>

        <div className="font-cinzel text-lg sm:text-2xl md:text-3xl tracking-[2px] sm:tracking-[4px] text-accent-teal font-black mb-6 sm:mb-10 uppercase">
          {point1} <span className="text-accent-gold">•</span> {point2} <span className="text-accent-gold">•</span> {point3}
        </div>

        <p className="text-base sm:text-lg md:text-xl text-text-secondary max-w-[800px] mx-auto mb-10 leading-relaxed px-4 font-medium">
          {description}
        </p>

        <div className="flex flex-col items-center gap-6 sm:gap-10">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full px-8 sm:px-0 max-w-md sm:max-w-none">
            <Link
              href="/#indicators"
              className="
              inline-flex p-12  group relative items-center justify-center gap-3
              bg-accent-teal text-white
              py-5 rounded-2xl font-black text-base uppercase tracking-[0.2em]
              transition-all duration-300 ease-out
              hover:shadow-2xl hover:shadow-accent-teal/40
              hover:-translate-y-0.5
              hover:bg-accent-teal/90
              hover:scale-105
              active:scale-[0.98] "
            >
              Explore Indicators
            </Link>
            <Link
              href="/#courses"
              className="
              inline-flex p-12 group relative items-center justify-center gap-3
              bg-transparent text-accent-teal border-2 border-accent-teal
              py-5 rounded-2xl font-black text-base uppercase tracking-[0.2em]
              transition-all duration-300 ease-out
              hover:bg-accent-teal hover:text-white
              hover:shadow-xl hover:shadow-accent-teal/30
              hover:-translate-y-0.5
              hover:scale-105
              active:scale-[0.98]"
            >
              View Courses
            </Link>
          </div>

          <div className="animate-bounce opacity-40 hidden sm:block mt-4">
            <div className="w-5 h-8 border-2 border-accent-gold rounded-full flex justify-center p-1">
              <div className="w-1 h-1.5 bg-accent-gold rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
