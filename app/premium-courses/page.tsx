'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ApiService from '@/services/ApiService';
import { OnlineCourse } from '@/types';
import Pagination from '@/components/ui/Pagination';
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import { getFullImageUrl } from '@/lib/utils'
import GlobalLoading from '@/components/ui/GlobalLoading';

const PremiumCoursesPage = () => {
  const router = useRouter();

  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

  const [courses, setCourses] = useState<OnlineCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<OnlineCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('');

  const itemsPerPage = 6
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let data;

        if (userId) {
          // data = await ApiService.getAllOnlineCourses(userId);
          data = await ApiService.getAllOnlineCourses(userId, undefined, true);

        } else {
          data = await ApiService.getAllOnlineCourses(undefined, undefined, true);
        }

        const publishedCourses = data.filter(c => c.isPublished);
        setCourses(publishedCourses);
        setFilteredCourses(publishedCourses);
      } catch (err) {
        console.error('Failed to fetch online courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
      setCurrentPage(1);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = courses.filter(course => {
      // Search by title
      const titleMatch = course.title.toLowerCase().includes(term);

      // Search by price (exact number or partial)
      const priceMatch = course.price.toString().includes(term);
      const discountPriceMatch = course.discountPrice.toString().includes(term);

      // Search by price range (e.g., "1000-2000")
      if (term.includes('-')) {
        const [minStr, maxStr] = term.split('-').map(str => str.trim());
        const min = parseInt(minStr);
        const max = parseInt(maxStr);

        if (!isNaN(min) && !isNaN(max)) {
          return course.price >= min && course.price <= max ||
            course.discountPrice >= min && course.discountPrice <= max;
        }
      }

      // Search by keywords like "free" or specific amounts
      if (term === 'free') {
        return !course.isPaid || course.price === 0;
      }

      return titleMatch || priceMatch || discountPriceMatch;
    });

    setFilteredCourses(filtered);
    setCurrentPage(1);
  }, [searchTerm, courses]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-[#020C0E] flex items-center justify-center">
  //       <div className="text-green-500 font-cinzel text-2xl animate-pulse">Loading Courses...</div>
  //     </div>
  //   );
  // }

  if (loading) {
    return <GlobalLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-red-500 font-cinzel text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-teal/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-gold/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 pt-20 pb-12 px-8">
        <div className="w-[90%] max-w-[1800px] mx-auto">
          {/* Header */}
          <div className="relative text-center mb-16 rounded-3xl p-10 border border-border overflow-hidden">
            <p className="text-sm uppercase tracking-[0.3em] font-black text-accent-teal mb-6">
              Premium Online Courses
            </p>
            <h1 className="text-3xl md:text-4xl font-black mb-6 bg-gradient-to-r from-accent-teal via-accent-teal to-accent-gold bg-clip-text text-transparent">
              Master Trading with IMPULSE Academy
            </h1>
            <p className="mb-2 text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Comprehensive trading courses designed to transform you into a professional trader
            </p>

            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  onKeyDown={handleKeyDown}
                  placeholder="Search courses by title or price"
                  className="w-full bg-bg-card border-2 border-border rounded-xl py-4 px-6 pr-12 text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent-teal focus:shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all"
                />

                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Clear search"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Courses Grid */}
          {currentCourses.length === 0 ? (
            <div className="text-center text-gray-400 text-xl py-20">
              {searchTerm ? 'No courses found matching your search.' : 'No courses available at the moment.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentCourses.map((course) => {
                // Get full image URL using the utility function
                const imageUrl = getFullImageUrl(course.thumbnailImgUrl || course.coverImage);
                const hasThumbnail = !!imageUrl && imageUrl !== '/noimage.webp';

                return (
                  <div
                    key={course.id}
                    className="group bg-bg-card border border-border rounded-3xl overflow-hidden hover:border-accent-teal transition-all duration-500 shadow-[0_0_30px_rgba(20,184,166,0.15)] hover:shadow-[0_0_50px_rgba(20,184,166,0.3)] cursor-pointer flex flex-col h-full"
                    onClick={() => router.push(`/premium-courses/${course.courseNumber}`)}
                  >
                    {/* Course Image Container - 4:3 Aspect Ratio */}
                    <div className="relative w-full pt-[75%] overflow-hidden"> {/* 4:3 = 75% */}
                      <div className="absolute inset-0">
                        <Image
                          src={hasThumbnail ? imageUrl : "/noimage.webp"}
                          alt={course.title}
                          fill
                          className={`object-cover transition-transform duration-700 group-hover:scale-110 ${!hasThumbnail ? 'opacity-40 saturate-50' : ''
                            }`}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                        {/* Badges */}
                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                          {!course.isPaid && (
                            <span className="bg-accent-teal text-white text-xs font-black px-3 py-1 rounded-full">
                              FREE
                            </span>
                          )}
                          {course.isFeatured && (
                            <span className="bg-accent-gold text-black text-xs font-black px-3 py-1 rounded-full">
                              FEATURED
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-6 flex flex-col flex-1">
                      {/* Course Key and Purchased Status */}
                      <div className="flex items-center justify-between mb-2">
                        {course.courseKey && (
                          <p className="text-xs uppercase tracking-widest text-accent-teal font-bold">
                            {course.courseKey}
                          </p>
                        )}

                        {course.isPurchased && (
                          <span className="inline-block bg-accent-teal/20 text-accent-teal text-xs font-black px-3 py-1 rounded-full border border-accent-teal/40">
                            PURCHASED
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold mb-2 transition-colors line-clamp-2">
                        {course.title}
                      </h3>

                      {/* <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1 px-2 py-0.5 bg-accent-teal/10 border border-accent-teal/20 rounded-md">
                          <Star className="w-3 h-3 text-accent-teal fill-accent-teal" />
                          <span className="text-xs font-bold text-accent-teal">{course.averageRating || 0}</span>
                        </div>
                        {course.totalReviews !== undefined && (
                          <span className="text-[10px] text-text-secondary">({course.totalReviews} reviews)</span>
                        )}
                      </div> */}

                      {/* Description */}
                      <p className="text-text-secondary text-sm mb-4 line-clamp-3 leading-relaxed">
                        {course.shortDescription}
                      </p>

                      {/* Duration */}
                      {/* {course.duration && course.duration !== 'string' && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>{course.duration}</span>
                        </div>
                      )} */}

                      {/* Price */}
                      <div className="flex items-center gap-3 mb-4">
                        {course.discountPrice < course.price ? (
                          <>
                            <span className="text-3xl font-black text-accent-teal">
                              ₹{course.discountPrice.toLocaleString()}
                            </span>
                            <span className="text-lg text-text-secondary line-through">
                              ₹{course.price.toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-3xl font-black text-accent-teal">
                            ₹{course.price.toLocaleString()}
                          </span>
                        )}
                      </div>


                      <button
                        className="mt-auto w-full bg-accent-teal hover:bg-accent-teal/90 text-white font-black py-3 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] active:scale-95"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          router.push(`/premium-courses/${course.courseNumber}`);
                        }}
                      >
                        View Course Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination - Only show if there are multiple pages */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </div>
  );
};

export default PremiumCoursesPage;