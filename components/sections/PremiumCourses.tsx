
'use client';

import Link from 'next/link';
import React from 'react';

interface CourseLevel {
  id: number;
  title: string;
  completed: boolean;
  progress: number;
}

const PremiumCoursesComponent: React.FC = () => {
  const courseLevels: CourseLevel[] = [
    { id: 1, title: 'Stock Basics', completed: false, progress: 0 },
    { id: 2, title: 'Trading Psychology', completed: false, progress: 0 },
    { id: 3, title: 'Level 3', completed: false, progress: 0 },
    { id: 4, title: 'Level 4', completed: false, progress: 0 },
    { id: 5, title: 'Level 5', completed: false, progress: 0 },
    { id: 6, title: 'Level 6', completed: false, progress: 0 },
    { id: 7, title: 'Level 7', completed: false, progress: 0 },
    { id: 8, title: 'Level 8', completed: false, progress: 0 },
    { id: 9, title: 'Level 9', completed: false, progress: 0 },
    { id: 10, title: 'Level 10', completed: false, progress: 0 },
    { id: 11, title: 'Level 11', completed: false, progress: 0 },
    { id: 12, title: 'Level 12', completed: false, progress: 0 },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-teal/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-gold/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 pt-32 pb-12 px-8 text-center">
        <div className="w-[90%] max-w-[1800px] mx-auto">
          <p className='text-sm uppercase tracking-[0.3em] font-black text-accent-gold mb-6'>100 Levels of Trading Mastery</p>
          <h1 className="text-3xl md:text-6xl font-black mb-6 bg-gradient-to-r from-accent-teal via-accent-gold to-accent-teal bg-clip-text text-transparent font-cinzel leading-tight tracking-tight">
            Master Trading with
          </h1>

          <h1 className="text-3xl md:text-6xl font-black mb-10 bg-gradient-to-r from-accent-gold via-accent-teal to-accent-gold bg-clip-text text-transparent font-cinzel leading-tight tracking-tight">
            Hulk Scalper King Academy
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            தமிழில் பங்குச்சந்தை கற்றுக்கொள்ளுங்கள். 100 levels, 1000+ pages of content, and comprehensive quizzes to transform you into a professional trader.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
            <button className="bg-accent-teal text-white font-black py-5 px-12 rounded-2xl text-base hover:bg-accent-teal/90 transition-all transform hover:scale-[1.02] shadow-xl shadow-accent-teal/20 active:scale-[0.98]">
              Start Free Demo (Level 1)
            </button>

            <button className="border-2 border-accent-gold text-accent-gold font-black py-5 px-12 rounded-2xl text-base hover:bg-accent-gold hover:text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              All Levels
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 pb-20 pt-16">
        <div className="w-[90%] max-w-[1800px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-cinzel text-5xl font-bold mb-6 text-text-primary">
              Course <span className="text-accent-gold">Levels</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-[600px] mx-auto font-medium">
              Complete each level with 100% quiz score to unlock the next
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {courseLevels.map((level) => {
              const isLocked = level.id > 2

              return (
                <div
                  key={level.id}
                  className={`relative rounded-3xl p-8 text-center transition-all duration-300 group
        ${!isLocked
                      ? 'bg-bg-card border-2 border-accent-teal/30 shadow-xl hover:border-accent-teal shadow-accent-teal/5'
                      : 'bg-bg-card/40 border-2 border-border opacity-60 grayscale'
                    }`}
                >
                  {/* FREE badge */}
                  {level.id === 1 && (
                    <span className="absolute top-4 right-4 bg-accent-gold text-white text-[10px] font-black px-3 py-1 rounded-full tracking-widest shadow-lg">
                      FREE
                    </span>
                  )}

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300
          ${!isLocked
                        ? 'bg-bg-primary text-accent-teal shadow-lg group-hover:bg-accent-teal group-hover:text-white'
                        : 'bg-bg-secondary text-text-secondary'
                      }`}
                  >
                    <svg
                      className="w-8 h-8"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {/* Level Number */}
                  <h3 className="text-4xl font-black text-text-primary mb-2 font-cinzel">
                    {level.id}
                  </h3>

                  {/* Title */}
                  <p className="text-sm text-text-secondary mb-8 font-bold uppercase tracking-widest">
                    {level.title}
                  </p>

                  {!isLocked && (
                    <Link
                      href={`/premium-courses/level-${level.id}`}
                      className="block w-full bg-accent-teal text-white font-black py-4 px-4 rounded-xl transition-all text-center no-underline shadow-lg hover:shadow-accent-teal/30 hover:bg-accent-teal/90 active:scale-95"
                    >
                      Start Level {level.id}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumCoursesComponent;