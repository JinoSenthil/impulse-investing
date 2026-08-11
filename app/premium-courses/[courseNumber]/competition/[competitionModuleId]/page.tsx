'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { ArrowLeft, CheckCircle, Lock, PlayCircle, Zap } from 'lucide-react';
import ApiService from '@/services/ApiService';
import GlobalLoading from '@/components/ui/GlobalLoading';
import { CompetitionCourse, CompetitionModule } from '@/types';
import { RootState } from '@/lib/store';
import { getFullImageUrl, stripHtmlToPlainText } from '@/lib/utils';

export default function CompetitionModulePage() {
  const params = useParams();
  const router = useRouter();
  const courseNumber = params.courseNumber as string;
  const competitionModuleId = Number(params.competitionModuleId);
  const userId = useSelector((state: RootState) => state.auth.user?.id);
  const [course, setCourse] = useState<CompetitionCourse | null>(null);
  const [module, setModule] = useState<CompetitionModule | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadModule = async () => {
      try {
        const data = await ApiService.getPurchaseDetails(courseNumber, userId);
        const foundCourse = data.competitionCourse?.[0];
        const foundModule = foundCourse?.competitionModule?.find(item => item.id === competitionModuleId);

        if (!foundCourse || !foundModule) {
          throw new Error('Competition module not found');
        }

        const sessions = foundModule.moduleSession || [];
        const canAccessModule =
          data.isPurchased ||
          foundModule.isPreview === true ||
          foundModule.isAccess === true ||
          sessions.some(session => session.isPreview === true || session.isAccess === true);

        if (!canAccessModule) {
          throw new Error('This competition module is locked');
        }

        if (!cancelled) {
          setCourse(foundCourse);
          setModule(foundModule);
          setIsPurchased(data.isPurchased);
        }
      } catch (loadError) {
        console.error('Failed to load competition module:', loadError);
        if (!cancelled) setError('Competition module not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadModule();
    return () => {
      cancelled = true;
    };
  }, [competitionModuleId, courseNumber, userId]);

  const sessions = useMemo(
    () => [...(module?.moduleSession || [])]
      .filter(session => session.activeStatus !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    [module],
  );

  const firstLessonImage = sessions
    .flatMap(session => session.competitionLessons || [])
    .find(lesson => lesson.activeStatus !== false && lesson.url)?.url;

  const moduleImage = getFullImageUrl(
    module?.thumbnailImgUrl ||
    module?.imageUrl ||
    module?.coverImage ||
    firstLessonImage ||
    course?.thumbnailImgUrl ||
    course?.coverImage,
  );
  const isExamplePlaceholder = /^https?:\/\/(?:www\.)?example\.com(?:\/|$)/i.test(moduleImage || '');
  const hasThumbnail = Boolean(moduleImage) && moduleImage !== '/noimage.webp' && !isExamplePlaceholder;

  if (loading) return <GlobalLoading />;

  if (error || !course || !module) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-primary text-text-primary">
        <h1 className="text-2xl font-black text-red-500">{error || 'Competition module not found'}</h1>
        <Link href={`/premium-courses/${courseNumber}`} className="font-bold text-accent-teal hover:underline">
          Return to course
        </Link>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-bg-primary text-text-primary">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-accent-green/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-accent-teal/5 blur-[120px]" />
      </div>

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-bg-primary/95 px-6 pb-6 pt-4 shadow-2xl backdrop-blur-xl">
        <div className="mx-auto flex w-[90%] max-w-[1800px] items-center justify-between">
          <Link
            href={`/premium-courses/${courseNumber}`}
            className="group flex items-center gap-2 font-semibold text-text-secondary transition-colors hover:text-accent-teal"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back to competition</span>
          </Link>

          <div className="text-center">
            <h1 className="font-cinzel text-lg font-bold tracking-[2px] text-accent-teal sm:text-xl">
              Module Details
            </h1>
          </div>

          <Link href="/" className="text-sm font-semibold text-text-secondary hover:text-accent-teal">
            Home
          </Link>
        </div>
      </header>

      <div className="relative z-10 px-8 pb-12 pt-20">
        <div className="mx-auto w-[90%] max-w-[1800px]">
          <div className="relative mb-16 overflow-hidden rounded-3xl border border-border p-10 text-center">
            {hasThumbnail && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={moduleImage}
                  alt={stripHtmlToPlainText(module.title)}
                  fill
                  className="object-cover opacity-20"
                  sizes="100vw"
                  priority
                  quality={50}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/90 via-bg-primary/70 to-bg-primary/95" />
              </div>
            )}

            <div className="relative z-10">
              <p className="mb-6 text-sm font-black uppercase tracking-[0.3em] text-accent-teal">
                Competition Module
              </p>

              <h2 className="mb-6 bg-gradient-to-r from-accent-teal via-accent-teal to-accent-gold bg-clip-text font-cinzel text-3xl font-black text-transparent md:text-5xl">
                {stripHtmlToPlainText(module.title)}
              </h2>

              <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-text-secondary">
                Open any session you have access to and earn XP along the way.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-text-secondary">
                <span className="rounded-full border border-border bg-bg-secondary px-4 py-2">
                  {sessions.length} session{sessions.length === 1 ? '' : 's'}
                </span>
                <span className="rounded-full border border-border bg-bg-secondary px-4 py-2">
                  {module.duration || 'Self paced'}
                </span>
                {module.xpPoints != null && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-gold/15 px-4 py-2 font-bold text-accent-gold">
                    <Zap className="h-4 w-4" /> {module.xpPoints} XP
                  </span>
                )}
              </div>
            </div>
          </div>

          {sessions.length > 0 ? (
            <div id="module-sessions-section" className="mb-16">
              <div className="mb-12 text-center">
                <h4 className="mb-6 font-cinzel text-4xl font-bold">
                  Module Sessions
                </h4>
                <p className="mx-auto max-w-[600px] text-lg text-text-secondary">
                  Free preview and granted sessions are ready to open
                </p>

                <div className="mt-4 flex flex-col items-center justify-center gap-4 text-sm text-text-secondary sm:flex-row">
                  <div className="rounded-lg border border-border bg-bg-secondary px-4 py-2">
                    Total Sessions: <span className="font-bold text-accent-teal">{sessions.length}</span>
                  </div>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {sessions.map((session, index) => {
                  const isCompleted =
                    session.isCompleted === true ||
                    session.isSessionCompleted === true ||
                    session.isTestCompleted === true;
                  const isUnlocked =
                    isPurchased || session.isAccess === true || session.isPreview === true;
                  const label = isCompleted
                    ? 'REVIEW SESSION'
                    : isUnlocked
                      ? session.isPreview === true
                        ? 'FREE PREVIEW'
                        : 'VIEW LESSON'
                      : 'LOCKED';
                  const sessionHref = `/premium-courses/${courseNumber}/competition/${module.id}/${session.id}`;

                  return (
                    <div
                      key={session.id}
                      className={`relative rounded-2xl p-6 text-center transition-all duration-300 ${
                        isUnlocked
                          ? isCompleted
                            ? 'border-2 border-border bg-bg-card shadow-[0_0_20px_rgba(20,184,166,0.1)]'
                            : 'cursor-pointer border-2 border-accent-teal bg-bg-card shadow-[0_0_30px_rgba(20,184,166,0.15)] hover:shadow-[0_0_50px_rgba(20,184,166,0.25)]'
                          : 'border-2 border-border bg-bg-card/40 opacity-60 shadow-[0_0_20px_rgba(0,0,0,0.1)]'
                      }`}
                    >
                      {session.isPreview === true && !isCompleted && (
                        <span className="absolute right-3 top-3 rounded-full bg-accent-teal px-3 py-1 text-[10px] font-black tracking-wider text-white">
                          FREE
                        </span>
                      )}

                      {isCompleted && (
                        <span className="absolute right-3 top-3 rounded-full border border-accent-gold/30 bg-accent-gold/20 px-3 py-1 text-[10px] font-black tracking-wider text-accent-gold">
                          COMPLETED
                        </span>
                      )}

                      <div
                        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${
                          isCompleted
                            ? 'bg-accent-gold/10 text-accent-gold'
                            : isUnlocked
                              ? 'bg-accent-teal/10 text-accent-teal shadow-[0_0_20px_rgba(20,184,166,0.1)]'
                              : 'bg-bg-secondary text-text-secondary'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6" />
                        ) : isUnlocked ? (
                          <PlayCircle className="h-6 w-6" />
                        ) : (
                          <Lock className="h-6 w-6" />
                        )}
                      </div>

                      <h2 className="mb-1 text-3xl font-bold text-text-primary">
                        {index + 1}
                      </h2>

                      <p className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm text-text-secondary">
                        {session.sessionName || `Session ${index + 1}`}
                      </p>

                      <p className="mb-4 text-xs text-text-secondary/60">
                        {session.competitionLessons?.length || 0} Lesson
                        {(session.competitionLessons?.length || 0) === 1 ? '' : 's'}
                      </p>

                      {session.sessionXpPoints != null && (
                        <div className="mb-3 inline-flex items-center gap-1 rounded-full bg-accent-gold/15 px-3 py-1.5 text-xs font-black text-accent-gold">
                          <Zap className="h-3.5 w-3.5" />
                          {session.sessionXpPoints} XP
                        </div>
                      )}

                      <div className="mb-3 text-xs">
                        {session.isPreview === true ? (
                          <span className="text-accent-teal">✓ Free Preview</span>
                        ) : session.isAccess === true || isPurchased ? (
                          isCompleted ? (
                            <span className="text-accent-teal">✓ Session Completed</span>
                          ) : (
                            <span className="text-accent-gold">Session Pending</span>
                          )
                        ) : (
                          <span className="text-text-secondary">Access Required</span>
                        )}
                      </div>

                      {isUnlocked && !isCompleted ? (
                        <button
                          type="button"
                          onClick={() => router.push(sessionHref)}
                          className="w-full rounded-lg bg-accent-teal px-4 py-3 font-black text-white shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all hover:bg-accent-teal/90 hover:shadow-[0_0_25px_rgba(20,184,166,0.5)]"
                        >
                          {label}
                        </button>
                      ) : isCompleted ? (
                        <button
                          type="button"
                          onClick={() => router.push(sessionHref)}
                          className="w-full rounded-lg border border-accent-gold/40 bg-accent-gold/20 px-4 py-3 font-black text-accent-gold transition-all hover:bg-accent-gold/30"
                        >
                          Review Session
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full cursor-not-allowed rounded-lg bg-bg-secondary px-4 py-3 font-black text-text-secondary/40"
                        >
                          {label}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-bg-card p-10 text-center text-text-secondary">
              No sessions are available in this module.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
