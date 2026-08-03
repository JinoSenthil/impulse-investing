'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChevronRight, Clock, Lock, PlayCircle, Trophy, Zap } from 'lucide-react';
import { CompetitionCourse } from '@/types';
import { getFullImageUrl, stripHtmlToPlainText } from '@/lib/utils';

interface CompetitionCourseOverviewProps {
  course: CompetitionCourse;
  isPurchased: boolean;
}

export default function CompetitionCourseOverview({
  course,
  isPurchased,
}: CompetitionCourseOverviewProps) {
  const modules = [...(course.competitionModule || [])]
    .filter(module => module.activeStatus !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const isFreeCourse = course.accessType === 'FREE' || !course.isPaid;

  return (
    <main className="min-h-screen bg-bg-primary px-4 pb-16 pt-24 text-text-primary sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href="/premium-courses"
          className="mb-8 inline-flex items-center gap-2 font-semibold text-text-secondary transition hover:text-accent-teal"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Courses
        </Link>

        <section className="mb-10 overflow-hidden rounded-3xl border border-border bg-bg-card p-6 shadow-2xl sm:p-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent-gold/15 px-4 py-2 text-sm font-black uppercase tracking-wider text-accent-gold">
            <Trophy className="h-4 w-4" />
            Competition Course
          </div>
          <div
            className="font-cinzel text-3xl font-black text-accent-teal sm:text-5xl [&_h1]:m-0 [&_h2]:m-0 [&_h3]:m-0"
            dangerouslySetInnerHTML={{ __html: course.title }}
          />
          <div
            className="mt-4 max-w-3xl text-lg leading-relaxed text-text-secondary"
            dangerouslySetInnerHTML={{ __html: course.shortDescription || course.description }}
          />
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-border bg-bg-secondary px-4 py-2">
              {modules.length} module{modules.length === 1 ? '' : 's'}
            </span>
            <span className="rounded-full border border-border bg-bg-secondary px-4 py-2">
              {course.duration || 'Self paced'}
            </span>
            {course.bonusXp != null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent-teal/15 px-4 py-2 font-bold text-accent-teal">
                <Zap className="h-4 w-4" /> {course.bonusXp} bonus XP
              </span>
            )}
          </div>
        </section>

        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-[0.25em] text-accent-gold">Competition path</p>
          <h2 className="mt-2 text-2xl font-black sm:text-3xl">Choose a module</h2>
        </div>

        {modules.length === 0 ? (
          <div className="rounded-2xl border border-border bg-bg-card p-10 text-center text-text-secondary">
            No competition modules are available yet.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module, index) => {
              const sessions = module.moduleSession?.filter(session => session.activeStatus !== false) || [];
              const moduleImage = getFullImageUrl(
                module.thumbnailImgUrl ||
                module.imageUrl ||
                module.coverImage ||
                sessions[0]?.competitionLessons?.[0]?.url ||
                course.thumbnailImgUrl,
              );
              const canOpen =
                isFreeCourse ||
                isPurchased ||
                module.isAccess ||
                module.isPreview === true ||
                sessions.some(session => session.isPreview === true || session.isAccess);
              const hasImage = Boolean(moduleImage);
              const card = (
                <article className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-bg-card transition ${
                  canOpen
                    ? 'border-border hover:-translate-y-1 hover:border-accent-teal/60 hover:shadow-[0_18px_50px_rgba(20,184,166,0.12)]'
                    : 'border-border/60 opacity-70'
                }`}>
                  <div className="relative w-full overflow-hidden pt-[75%]">
                    <div className="absolute inset-0">
                      {hasImage ? (
                        <Image
                          src={moduleImage}
                          alt={`${stripHtmlToPlainText(module.title)} module`}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-accent-teal/10 text-4xl font-black text-accent-teal">
                          {index + 1}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute right-4 top-4 z-10">
                        {canOpen ? (
                          <PlayCircle className="h-7 w-7 text-white drop-shadow transition group-hover:scale-110" />
                        ) : (
                          <Lock className="h-7 w-7 text-white/80 drop-shadow" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-black">{stripHtmlToPlainText(module.title)}</h3>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-text-secondary">
                      <span className="inline-flex items-center gap-1 rounded-full bg-bg-secondary px-3 py-1.5">
                        <PlayCircle className="h-4 w-4" /> {sessions.length} sessions
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-bg-secondary px-3 py-1.5">
                        <Clock className="h-4 w-4" /> {module.duration || 'Self paced'}
                      </span>
                      {module.xpPoints != null && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent-gold/15 px-3 py-1.5 font-bold text-accent-gold">
                          <Zap className="h-4 w-4" /> {module.xpPoints} XP
                        </span>
                      )}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-6 font-bold text-accent-teal">
                      <span>{canOpen ? 'View sessions' : 'Locked'}</span>
                      {canOpen && <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />}
                    </div>
                  </div>
                </article>
              );

              return canOpen ? (
                <Link
                  key={module.id}
                  href={`/premium-courses/${course.courseNumber}/competition/${module.id}`}
                >
                  {card}
                </Link>
              ) : (
                <div key={module.id}>{card}</div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
