'use client';

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import ApiService from '@/services/ApiService'
import { Course } from '@/types'
import { getFullImageUrl } from '@/lib/utils'
import GlobalLoading from '../ui/GlobalLoading';

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Responsive items per page
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
    const fetchCourses = async () => {
      try {
        const data = await ApiService.getAllCourses();
        const activeCourses = data.filter(c => c.activeStatus);
        setCourses(activeCourses);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Auto-scroll logic - stops at end and beginning
  const handleNext = useCallback(() => {
    const maxIndex = Math.max(0, courses.length - itemsPerPage);
    setCurrentIndex((prev) => {
      // Stop at the end - don't scroll past the last card
      if (prev >= maxIndex) {
        return prev; // Stay at the end, don't wrap around
      }
      return prev + 1;
    });
  }, [courses.length, itemsPerPage]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => {
      // Stop at the beginning - don't scroll before the first card
      if (prev <= 0) {
        return 0; // Stay at the start, don't wrap around
      }
      return prev - 1;
    });
  }, []);

  useEffect(() => {
    // Don't auto-scroll if:
    // 1. No courses or courses fit in view
    // 2. User is hovering
    // 3. We're at the end of the scroll
    const maxIndex = Math.max(0, courses.length - itemsPerPage);
    if (courses.length <= itemsPerPage || isHovered || currentIndex >= maxIndex) return;

    const interval = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(interval);
  }, [courses, itemsPerPage, isHovered, currentIndex, handleNext]);

  if (loading) {
    return <GlobalLoading />;
  }

  if (error) {
    return (
      <section id="courses" className="py-20 bg-bg-primary">
        <div className="w-[90%] max-w-[1800px] mx-auto text-center">
          <h2 className="text-red-500 text-xl font-cinzel">{error}</h2>
        </div>
      </section>
    );
  }

  // Calculate if navigation buttons should be disabled
  const maxIndex = Math.max(0, courses.length - itemsPerPage);
  const isAtStart = currentIndex === 0;
  const isAtEnd = currentIndex >= maxIndex;

  return (
    <section
      id="courses"
      className="py-20 bg-bg-primary overflow-hidden relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-accent-gold/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-gold/5 blur-[120px] rounded-full" />
      </div>

      <div className="w-[90%] max-w-[1800px] mx-auto text-center px-6 relative z-10">
        <div className="text-center mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-sm text-accent-gold uppercase tracking-[4px] mb-4 font-bold"
          >
            Expert Education
          </motion.div>
          <h2 className="font-cinzel text-4xl md:text-6xl font-black mb-8 text-text-primary tracking-tight">
            Trading <span className="text-accent-gold">Courses</span>
          </h2>
          <p className="text-text-secondary text-base md:text-xl max-w-[700px] mx-auto leading-relaxed">
            Comprehensive programs designed by professional traders to elevate your skills to an institutional level.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center text-text-secondary text-xl py-20 bg-bg-card rounded-3xl border border-border glass-panel">
            <div className="text-2xl font-cinzel mb-2">Coming Soon</div>
            <p>Our educational curriculum is being curated for excellence.</p>
          </div>
        ) : (
          <div className="relative group/slider">
            {/* Navigation Arrows - Premium Glass Style */}
            <button
              onClick={handlePrev}
              disabled={isAtStart}
              className={`absolute left-[-20px] lg:left-[-40px] top-1/2 -translate-y-1/2 z-30 bg-bg-card/80 border border-border p-5 rounded-full backdrop-blur-xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover/slider:opacity-100 opacity-0 group-hover/slider:translate-x-0 -translate-x-4
                ${isAtStart 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-accent-gold hover:border-accent-gold hover:scale-110 active:scale-95'
                }`}
              aria-label="Previous course"
            >
              <ChevronLeft className={`w-6 h-6 ${isAtStart ? 'text-text-secondary' : 'text-text-primary group-hover:text-bg-primary'}`} />
            </button>

            <button
              onClick={handleNext}
              disabled={isAtEnd}
              className={`absolute right-[-20px] lg:right-[-40px] top-1/2 -translate-y-1/2 z-30 bg-bg-card/80 border border-border p-5 rounded-full backdrop-blur-xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover/slider:opacity-100 opacity-0 group-hover/slider:translate-x-0 translate-x-4
                ${isAtEnd 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-accent-gold hover:border-accent-gold hover:scale-110 active:scale-95'
                }`}
              aria-label="Next course"
            >
              <ChevronRight className={`w-6 h-6 ${isAtEnd ? 'text-text-secondary' : 'text-text-primary group-hover:text-bg-primary'}`} />
            </button>

            <div className="overflow-hidden py-5 px-0">
              <motion.div
                className="flex -mx-4"
                animate={{
                  x: `-${currentIndex * (100 / itemsPerPage)}%`
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
              >
                {courses.map((course) => {
                  const imageUrl = getFullImageUrl(course.coverImage);
                  const hasThumbnail = !!imageUrl && course.coverImage !== 'string';

                  return (
                    <div
                      key={course.id}
                      className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4"
                    >
                      <div className="bg-bg-card border-2 border-border rounded-[40px] relative group hover:border-accent-gold/40 transition-all duration-500 shadow-xl flex flex-col text-left overflow-hidden h-full">
                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-accent-gold/0 via-accent-gold/5 to-accent-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border-b border-border shadow-2xl group-hover:border-accent-gold/40 transition-all duration-500 z-10">
                          <Image
                            src={hasThumbnail ? imageUrl : "/noimage.webp"}
                            alt={course.title}
                            fill
                            className={`object-cover transition-transform duration-700 group-hover:scale-110 ${!hasThumbnail ? 'opacity-40 saturate-50' : ''}`}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />

                          {/* Gradient Overlays */}
                          <div className="absolute inset-0 bg-gradient-to-t from-bg-card/90 via-bg-card/40 to-transparent" />
                          <div className="absolute inset-0 bg-gradient-to-r from-accent-gold/5 via-transparent to-accent-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                          {/* Hover Overlay Effect */}
                          <div className="absolute inset-0 bg-accent-gold/0 group-hover:bg-accent-gold/5 transition-all duration-500" />
                        </div>

                        <div className="p-6 flex flex-col flex-grow">
                          {/* Title & Description */}
                          <h3 className="text-xl md:text-xl font-bold mb-4 text-text-primary group-hover:text-accent-gold transition-colors line-clamp-2 min-h-[4rem] relative z-10">
                            {course.title}
                          </h3>

                          <div
                            className="text-text-secondary text-base mb-6 leading-relaxed max-w-[95%] line-clamp-3 min-h-[4.5rem] relative z-10"
                            dangerouslySetInnerHTML={{
                              __html: course.shortDescription || course.description,
                            }}
                          />

                          <div className="flex items-center gap-4 mt-auto w-full">
                            <Link
                              href={`/courses/${course.id}`}
                              className="flex-1 bg-gradient-to-r from-accent-gold via-[#e5c158] to-[#c5a059] 
                             text-white py-4 rounded-2xl font-black text-lg
                             hover:brightness-110 transition-all duration-300
                             text-center shadow-[0_10px_20px_rgba(212,175,55,0.2)]
                             active:scale-95 relative overflow-hidden group/btn hover:scale-[1.02]"
                            >
                              <span className="relative z-10 flex items-center justify-center gap-2">
                                View Details
                                <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                              </span>

                              {/* Shimmer Effect */}
                              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover/btn:animate-[shimmer_2s_infinite]" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </motion.div>
            </div>

            {/* Pagination Indicators - Professional Style */}
            <div className="flex justify-center items-center gap-3 mt-8">
              {Array.from({ length: Math.max(0, courses.length - itemsPerPage + 1) }).map((_, i) => (
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
          </div>
        )}
      </div>

      {/* Global CSS for Shimmer Animation */}
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