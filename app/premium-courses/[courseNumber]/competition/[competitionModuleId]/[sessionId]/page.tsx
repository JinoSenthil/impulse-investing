'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Headphones,
  Lock,
  Trophy,
  Youtube,
} from 'lucide-react';
import ApiService from '@/services/ApiService';
import GlobalLoading from '@/components/ui/GlobalLoading';
import {
  CompetitionCourse,
  CompetitionLesson,
  CompetitionModule,
  CourseTest,
  ModuleSession,
  UserTest,
} from '@/types';
import { RootState } from '@/lib/store';
import { getFullImageUrl, stripHtmlToPlainText } from '@/lib/utils';

type ContentTab = 'read' | 'audio' | 'video';

const formatElapsedTime = (totalSeconds: number) => {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return [hours, minutes, remainingSeconds]
    .map(value => value.toString().padStart(2, '0'))
    .join(':');
};

const getYouTubeEmbedUrl = (link: string | null) => {
  if (!link) return '';

  try {
    const url = new URL(link);
    const host = url.hostname.replace(/^www\./, '');
    let videoId = '';

    if (host === 'youtu.be') {
      videoId = url.pathname.split('/').filter(Boolean)[0] || '';
    } else if (host === 'youtube.com' || host === 'm.youtube.com') {
      videoId = url.searchParams.get('v') || '';
      if (!videoId) {
        const parts = url.pathname.split('/').filter(Boolean);
        if (['embed', 'shorts', 'live'].includes(parts[0])) videoId = parts[1] || '';
      }
    }

    return /^[\w-]{11}$/.test(videoId) ? `https://www.youtube.com/embed/${videoId}` : '';
  } catch {
    return '';
  }
};

export default function CompetitionSessionPage() {
  const params = useParams();
  const router = useRouter();
  const courseNumber = params.courseNumber as string;
  const competitionModuleId = Number(params.competitionModuleId);
  const sessionId = Number(params.sessionId);
  const userId = useSelector((state: RootState) => state.auth.user?.id);

  const [course, setCourse] = useState<CompetitionCourse | null>(null);
  const [module, setModule] = useState<CompetitionModule | null>(null);
  const [session, setSession] = useState<ModuleSession | null>(null);
  const [test, setTest] = useState<CourseTest | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CompetitionLesson | null>(null);
  const [visitedLessons, setVisitedLessons] = useState<Set<number>>(new Set());
  const [contentTab, setContentTab] = useState<ContentTab>('read');
  const [view, setView] = useState<'study' | 'quiz'>('study');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [quizStarted, setQuizStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [elapsedTime, setElapsedTime] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<UserTest | null>(null);
  const [quizError, setQuizError] = useState('');
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState(false);
  const [showTabLeaveConfirm, setShowTabLeaveConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [quizExpired, setQuizExpired] = useState(false);
  const quizStartedAt = useRef<number | null>(null);
  const tabSwitchCountRef = useRef(0);
  const submissionInProgressRef = useRef(false);

  const sessionsHref = `/premium-courses/${courseNumber}/competition/${competitionModuleId}`;

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        const data = await ApiService.getPurchaseDetails(courseNumber, userId);
        const foundCourse = data.competitionCourse?.[0];
        const foundModule = foundCourse?.competitionModule?.find(item => item.id === competitionModuleId);
        const foundSession = foundModule?.moduleSession?.find(item => item.id === sessionId);
        const isFreeCourse = foundCourse?.accessType === 'FREE' || foundCourse?.isPaid === false;
        const canAccess =
          data.isPurchased ||
          isFreeCourse ||
          foundSession?.isAccess ||
          foundSession?.isPreview === true;

        if (!foundCourse || !foundModule || !foundSession) {
          throw new Error('Competition session not found');
        }
        if (!canAccess) {
          throw new Error('This competition session is locked');
        }

        const lessons = [...(foundSession.competitionLessons || [])]
          .filter(lesson => lesson.activeStatus !== false)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        const foundTest =
          data.test?.find(item =>
            item.competitionModuleId === foundModule.id &&
            item.moduleSessionId === foundSession.id
          ) || null;

        if (!cancelled) {
          setCourse(foundCourse);
          setModule(foundModule);
          setSession({ ...foundSession, competitionLessons: lessons });
          setSelectedLesson(lessons[0] || null);
          setTest(foundTest);
        }
      } catch (loadError) {
        console.error('Failed to load competition session:', loadError);
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : 'Competition session not found');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadSession();
    return () => {
      cancelled = true;
    };
  }, [competitionModuleId, courseNumber, sessionId, userId]);

  useEffect(() => {
    if (!selectedLesson) return;
    setVisitedLessons(previous => new Set(previous).add(selectedLesson.id));
    setContentTab('read');
  }, [selectedLesson]);

  useEffect(() => {
    if (view === 'study') {
      setQuizStarted(false);
      setShowTabSwitchWarning(false);
      setShowTabLeaveConfirm(false);
      tabSwitchCountRef.current = 0;
      setQuizExpired(false);
      setElapsedTime(0);
    }
  }, [view]);

  useEffect(() => {
    if (!quizStarted || quizResult || quizExpired) return;
    const timer = window.setInterval(() => {
      if (quizStartedAt.current) {
        setElapsedTime(Math.max(0, Math.floor((Date.now() - quizStartedAt.current) / 1000)));
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [quizExpired, quizResult, quizStarted]);

  useEffect(() => {
    if (!quizStarted || quizResult || quizExpired) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        tabSwitchCountRef.current += 1;
        setShowTabSwitchWarning(true);
        setShowTabLeaveConfirm(true);
      } else {
        setShowTabSwitchWarning(false);
      }
    };

    const handleWindowBlur = () => {
      tabSwitchCountRef.current += 1;
      setShowTabSwitchWarning(true);
      setShowTabLeaveConfirm(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [quizExpired, quizResult, quizStarted]);

  useEffect(() => {
    const handlePopState = () => {
      if (view === 'quiz' && quizStarted && !quizResult) {
        setShowExitConfirm(true);
        window.history.pushState(null, '', window.location.href);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [quizResult, quizStarted, view]);

  const lessons = session?.competitionLessons || [];
  const selectedLessonIndex = selectedLesson
    ? lessons.findIndex(lesson => lesson.id === selectedLesson.id)
    : -1;
  const lessonProgress = lessons.length ? (visitedLessons.size / lessons.length) * 100 : 0;
  const allLessonsCompleted = lessons.length > 0 && visitedLessons.size >= lessons.length;
  const currentQuestion = test?.questions[questionIndex];
  const currentAnswerSelected = currentQuestion ? answers[currentQuestion.id] !== undefined : false;
  const quizProgress = test?.questions.length
    ? ((questionIndex + 1) / test.questions.length) * 100
    : 0;
  const videoEmbedUrl = useMemo(
    () => getYouTubeEmbedUrl(session?.youtubeLink || null),
    [session?.youtubeLink],
  );
  const audioUrl = getFullImageUrl(session?.audioUrl);
  const isQuizActive = view === 'quiz' && quizStarted && !quizResult;
  const hasAlreadyPassedExam = session?.isPassed === true || module?.isPassed === true;

  const resetQuiz = () => {
    setQuizResult(null);
    setQuizError('');
    setAnswers({});
    setQuestionIndex(0);
    setQuizStarted(true);
    setQuizExpired(false);
    setShowTabSwitchWarning(false);
    setShowTabLeaveConfirm(false);
    tabSwitchCountRef.current = 0;
    setElapsedTime(0);
    quizStartedAt.current = Date.now();
    submissionInProgressRef.current = false;
  };

  const openAssessment = () => {
    if (!test || !allLessonsCompleted) return;
    if (hasAlreadyPassedExam) {
      window.alert('You have already passed this session assessment.');
      return;
    }
    if (!userId) {
      router.push(
        `/login?redirect=/premium-courses/${courseNumber}/competition/${competitionModuleId}/${sessionId}`,
      );
      return;
    }
    setView('quiz');
    resetQuiz();
  };

  const handleTakeQuizClick = () => {
    if (!test) {
      window.alert('Assessment is not available for this session yet.');
      return;
    }
    if (hasAlreadyPassedExam) {
      window.alert('You have already passed this session assessment.');
      return;
    }
    if (!allLessonsCompleted) {
      window.alert('Complete all lessons to unlock the quiz.');
      return;
    }
    openAssessment();
  };

  const submitQuiz = async ({
    isAutoSubmitted = false,
  }: { isAutoSubmitted?: boolean } = {}) => {
    if (!test || !module || !session || !userId) return;
    if (submissionInProgressRef.current || submitting) return;

    submissionInProgressRef.current = true;
    setSubmitting(true);
    setQuizError('');

    try {
      const elapsedSeconds = quizStartedAt.current
        ? Math.max(0, Math.floor((Date.now() - quizStartedAt.current) / 1000))
        : elapsedTime;

      const result = await ApiService.createUserTest({
        userId,
        testId: test.id,
        moduleId: 0,
        competitionModuleId: module.id,
        moduleSessionId: session.id,
        finishingTime: formatElapsedTime(elapsedSeconds),
        answers: test.questions.map(question => ({
          questionId: question.id,
          selectedOption: answers[question.id] ? `OPTION${answers[question.id]}` : '',
        })),
      });
      setQuizResult(result);
      setQuizStarted(false);
      setShowTabSwitchWarning(false);
      setShowTabLeaveConfirm(false);
      if (isAutoSubmitted) {
        setQuizExpired(true);
      }
    } catch (submitError) {
      console.error('Failed to submit competition assessment:', submitError);
      setQuizError('Unable to submit the assessment. Please try again.');
    } finally {
      setSubmitting(false);
      submissionInProgressRef.current = false;
    }
  };

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    if (quizResult || quizExpired) return;
    setAnswers(previous => ({
      ...previous,
      [questionId]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (!test || !currentAnswerSelected) return;
    if (questionIndex < test.questions.length - 1) {
      setQuestionIndex(index => index + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex(index => index - 1);
    }
  };

  const handleStayOnQuiz = () => {
    setShowTabLeaveConfirm(false);
    setShowTabSwitchWarning(false);
  };

  const handleLeaveQuizPage = () => {
    setShowTabLeaveConfirm(false);
    if (!submissionInProgressRef.current) {
      setQuizExpired(true);
      setQuizStarted(false);
      void submitQuiz({ isAutoSubmitted: true });
    }
  };

  const handleBackClick = () => {
    if (isQuizActive) {
      setShowExitConfirm(true);
      return;
    }
    router.push(sessionsHref);
  };

  const confirmExitQuiz = () => {
    setShowExitConfirm(false);
    setQuizStarted(false);
    setView('study');
    router.push(sessionsHref);
  };

  if (loading) return <GlobalLoading />;

  if (error || !course || !module || !session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg-primary px-4 text-center text-text-primary">
        <Lock className="h-10 w-10 text-red-500" />
        <h1 className="text-2xl font-black text-red-500">{error || 'Competition session not found'}</h1>
        <Link href={sessionsHref} className="font-bold text-accent-teal hover:underline">
          Return to module sessions
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-primary pb-12 pt-20 text-text-primary">
      <header className="sticky top-20 z-40 border-b border-border bg-bg-primary/95 shadow-xl backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={handleBackClick}
              className="group inline-flex items-center gap-2 font-bold text-text-secondary transition hover:text-accent-teal"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="hidden md:inline">Back to Sessions</span>
            </button>

            <div className="flex rounded-lg border border-green-500/20 bg-bg-secondary p-1">
              <button
                type="button"
                disabled={isQuizActive}
                onClick={() => {
                  if (isQuizActive) return;
                  setView('study');
                }}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-all ${
                  view === 'study'
                    ? 'bg-green-500 text-black shadow-lg'
                    : 'text-text-secondary hover:text-text-primary'
                } ${isQuizActive ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <BookOpen className="h-4 w-4" />
                Study Material
              </button>
              {test && (
                <button
                  type="button"
                  disabled={!allLessonsCompleted || isQuizActive}
                  onClick={openAssessment}
                  className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-all ${
                    view === 'quiz'
                      ? 'bg-accent-gold text-black shadow-lg'
                      : 'text-text-secondary hover:text-text-primary'
                  } ${!allLessonsCompleted || isQuizActive ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full border border-current text-[10px] font-black">?</span>
                  Quiz Challenge
                </button>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 sm:max-w-[420px] lg:max-w-[520px]">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-teal px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-[0_6px_18px_rgba(20,184,166,0.3)] ring-1 ring-white/30">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              Session {session.sessionId}
            </span>
            <p className="mt-1 line-clamp-2 text-sm font-bold text-text-primary">
              {module.title} · {session.sessionName}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="hidden items-center gap-2.5 rounded-xl border border-border/80 bg-white px-2.5 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.06)] md:flex">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase text-text-secondary">
                    {view === 'quiz' ? 'Assessment' : 'Progress'}
                  </span>
                  <span className="text-sm font-black text-accent-teal">
                    {Math.round(view === 'quiz' ? quizProgress : lessonProgress)}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-28 overflow-hidden rounded bg-bg-secondary">
                  <div
                    className="h-full bg-accent-teal transition-all duration-300"
                    style={{ width: `${view === 'quiz' ? quizProgress : lessonProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {isQuizActive && (
              <>
                <div className="flex items-center gap-2.5 rounded-xl border border-accent-gold/50 bg-gradient-to-r from-amber-600 to-accent-gold px-3 py-2 text-white shadow-[0_8px_24px_rgba(212,175,55,0.3)]">
                  <Clock className="h-5 w-5" />
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/80">Time elapsed</div>
                    <div className="font-mono text-sm font-black">{formatElapsedTime(elapsedTime)}</div>
                  </div>
                </div>
                <div className="rounded-xl border border-accent-teal/50 bg-accent-teal px-3 py-2 text-white shadow-[0_8px_24px_rgba(20,184,166,0.28)]">
                  <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/80">Question</div>
                  <div className="text-sm font-black">
                    {questionIndex + 1} <span className="font-semibold text-white/75">of</span> {test?.questions.length || 0}
                  </div>
                </div>
              </>
            )}

            {view !== 'quiz' && test && (
              <button
                type="button"
                onClick={handleTakeQuizClick}
                disabled={!allLessonsCompleted}
                className="flex items-center gap-2 whitespace-nowrap rounded-2xl bg-accent-teal px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(20,184,166,0.3)] transition hover:scale-[1.02] hover:bg-accent-teal/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                <BookOpen className="h-4 w-4" />
                Take Quiz
              </button>
            )}
          </div>
        </div>
      </header>

      {showTabLeaveConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-border bg-bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-red-500/10 p-3">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Warning!</h3>
                <p className="text-sm text-text-secondary">You are taking an active quiz.</p>
              </div>
            </div>
            <p className="mb-4 text-sm leading-6 text-text-secondary">
              If you leave this page or switch to another browser tab, your quiz may be automatically submitted and your progress could be lost.
            </p>
            <p className="mb-6 text-base font-semibold text-text-primary">Do you want to continue?</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleStayOnQuiz}
                className="flex-1 rounded-2xl border border-accent-teal/30 bg-accent-teal/10 px-4 py-3 font-semibold text-accent-teal transition hover:bg-accent-teal/20"
              >
                Stay on Quiz
              </button>
              <button
                type="button"
                onClick={handleLeaveQuizPage}
                className="flex-1 rounded-2xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600"
              >
                Leave Page
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-border bg-bg-card p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-red-500/10 p-3">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-text-primary">Exit Quiz?</h3>
                <p className="text-sm text-text-secondary">Your progress may be lost.</p>
              </div>
            </div>
            <p className="mb-6 text-sm leading-6 text-text-secondary">
              Are you sure you want to leave this assessment? Unanswered progress may not be saved.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  window.history.pushState(null, '', window.location.href);
                }}
                className="flex-1 rounded-2xl border border-accent-teal/30 bg-accent-teal/10 px-4 py-3 font-semibold text-accent-teal transition hover:bg-accent-teal/20"
              >
                Continue Quiz
              </button>
              <button
                type="button"
                onClick={confirmExitQuiz}
                className="flex-1 rounded-2xl bg-red-500 px-4 py-3 font-semibold text-white transition hover:bg-red-600"
              >
                Leave Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'study' ? (
        <div className="mx-auto grid max-w-7xl gap-6 px-4 pt-8 sm:px-8 lg:grid-cols-[300px_1fr]">
          <aside className="h-fit rounded-2xl border border-border bg-bg-card p-4 lg:sticky lg:top-40">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-black">Session lessons</h2>
              <span className="text-sm font-bold text-accent-teal">{visitedLessons.size}/{lessons.length}</span>
            </div>
            <div className="space-y-2">
              {lessons.map((lesson, index) => {
                const active = selectedLesson?.id === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => setSelectedLesson(lesson)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${
                      active ? 'bg-accent-teal text-white' : 'bg-bg-secondary hover:bg-accent-teal/15'
                    }`}
                  >
                    {visitedLessons.has(lesson.id) ? (
                      <CheckCircle className="h-5 w-5 shrink-0" />
                    ) : (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-black">
                        {index + 1}
                      </span>
                    )}
                    <span className="line-clamp-2 text-sm font-bold">{lesson.title}</span>
                  </button>
                );
              })}
            </div>

            {test && (
              <button
                type="button"
                onClick={openAssessment}
                disabled={!allLessonsCompleted}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-teal px-4 py-3 font-black text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trophy className="h-5 w-5" />
                Assessment
              </button>
            )}

            {!allLessonsCompleted && test && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-accent-gold/30 bg-accent-gold/10 p-3 text-sm text-text-secondary">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-accent-gold" />
                <span>Complete all {lessons.length} lessons to unlock quiz</span>
              </div>
            )}
          </aside>

          <section className="min-w-0">
            {selectedLesson ? (
              <article className="overflow-hidden rounded-3xl border border-border bg-bg-card shadow-2xl">
                <div className="border-b border-border p-5 sm:p-7">
                  <p className="text-sm font-black uppercase tracking-wider text-accent-gold">
                    Lesson {Math.max(1, selectedLessonIndex + 1)}
                  </p>
                  <h2 className="mt-2 text-2xl font-black sm:text-3xl">{selectedLesson.title}</h2>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {([
                      ['read', 'Read', BookOpen, true],
                      ['audio', 'Audio', Headphones, Boolean(audioUrl)],
                      ['video', 'Video', Youtube, Boolean(videoEmbedUrl)],
                    ] as const).map(([tab, label, Icon, available]) => (
                      <button
                        key={tab}
                        type="button"
                        disabled={!available}
                        onClick={() => setContentTab(tab)}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-black transition ${
                          contentTab === tab
                            ? 'bg-accent-teal text-white'
                            : available
                              ? 'bg-bg-secondary text-text-secondary hover:text-accent-teal'
                              : 'cursor-not-allowed bg-bg-secondary text-text-secondary opacity-40'
                        }`}
                      >
                        <Icon className="h-5 w-5" /> {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 sm:p-8">
                  {contentTab === 'read' && (
                    <>
                      {selectedLesson.url && (
                        <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl border border-border bg-bg-secondary">
                          <Image
                            src={getFullImageUrl(selectedLesson.url)}
                            alt={stripHtmlToPlainText(selectedLesson.title)}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div
                        className="prose prose-lg max-w-none text-text-primary prose-headings:text-text-primary prose-strong:text-text-primary prose-p:text-text-secondary prose-li:text-text-secondary"
                        dangerouslySetInnerHTML={{ __html: selectedLesson.description }}
                      />
                    </>
                  )}
                  {contentTab === 'audio' && (
                    <div className="rounded-2xl border border-border bg-bg-secondary p-6 text-center">
                      <Headphones className="mx-auto mb-4 h-12 w-12 text-accent-teal" />
                      <audio className="w-full" controls preload="metadata" src={audioUrl}>
                        Your browser does not support audio playback.
                      </audio>
                    </div>
                  )}
                  {contentTab === 'video' && (
                    <div className="aspect-video overflow-hidden rounded-2xl border border-border bg-black">
                      <iframe
                        src={videoEmbedUrl}
                        title={`${session.sessionName} video`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </div>

                <footer className="flex items-center justify-between gap-4 border-t border-border p-5 sm:p-7">
                  <button
                    type="button"
                    disabled={selectedLessonIndex <= 0}
                    onClick={() => setSelectedLesson(lessons[selectedLessonIndex - 1])}
                    className="inline-flex items-center gap-2 rounded-xl bg-bg-secondary px-4 py-3 font-bold disabled:opacity-40"
                  >
                    <ChevronLeft className="h-5 w-5" /> Previous
                  </button>
                  {selectedLessonIndex < lessons.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setSelectedLesson(lessons[selectedLessonIndex + 1])}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent-teal px-4 py-3 font-black text-white"
                    >
                      Next lesson <ChevronRight className="h-5 w-5" />
                    </button>
                  ) : test ? (
                    <button
                      type="button"
                      onClick={openAssessment}
                      disabled={!allLessonsCompleted}
                      className="inline-flex items-center gap-2 rounded-xl bg-accent-teal px-4 py-3 font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Start assessment <Trophy className="h-5 w-5" />
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2 font-black text-accent-teal">
                      <CheckCircle className="h-5 w-5" /> Session complete
                    </span>
                  )}
                </footer>
              </article>
            ) : (
              <div className="rounded-2xl border border-border bg-bg-card p-10 text-center text-text-secondary">
                No lessons are available in this session.
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="relative flex min-h-[calc(100vh-73px)] items-center justify-center overflow-hidden p-6 md:p-12">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-[-10%] top-[-20%] h-[50%] w-[50%] rounded-full bg-accent-gold/5 blur-[150px]" />
          </div>

          <div className="relative z-10 w-full max-w-4xl">
            {quizResult ? (
              <div className="mx-auto max-w-2xl rounded-[2.5rem] border-2 border-border bg-bg-card p-12 text-center shadow-2xl">
                <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full ${
                  quizResult.isPassed ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {quizResult.isPassed ? (
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  ) : (
                    <AlertCircle className="h-12 w-12 text-red-500" />
                  )}
                </div>
                <h2 className="mb-2 text-3xl font-bold text-text-primary">
                  {quizResult.isPassed ? 'Congratulations!' : 'Assessment Completed'}
                </h2>
                <p className="mb-2 text-text-secondary">
                  You scored: {quizResult.score}/{test?.questions.length || 0}
                </p>
                <p className={`mb-8 text-lg font-bold ${quizResult.isPassed ? 'text-green-500' : 'text-red-500'}`}>
                  {quizResult.isPassed ? 'PASSED ✓' : 'FAILED ✗'}
                </p>
                <p className="mb-8 text-text-secondary">Finishing time: {formatElapsedTime(elapsedTime)}</p>
                <div className="flex flex-col justify-center gap-4 sm:flex-row">
                  {!quizResult.isPassed && (
                    <button
                      type="button"
                      onClick={resetQuiz}
                      className="rounded-xl bg-accent-gold px-8 py-3 font-bold text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:bg-yellow-400"
                    >
                      Retake Quiz
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setView('study')}
                    className="rounded-xl border-2 border-border bg-bg-secondary px-8 py-3 font-bold text-text-primary transition-all hover:border-accent-teal"
                  >
                    Back to Lessons
                  </button>
                </div>
              </div>
            ) : test && quizStarted ? (
              <>
                <div className="mb-12 text-center">
                  <span className="inline-block rounded-full border border-accent-gold/30 bg-accent-gold/10 px-4 py-2 text-sm font-black uppercase tracking-widest text-accent-gold">
                    Mastery Test
                  </span>
                </div>

                {showTabSwitchWarning && (
                  <div className="mb-6 rounded-xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-500">
                    Do not switch to another tab. If you leave this tab, your test may be automatically submitted or considered invalid.
                  </div>
                )}

                <div className="relative rounded-[2.5rem] border-2 border-border bg-bg-card p-8 shadow-2xl md:p-12">
                  <h3 className="mb-10 text-left text-lg font-bold leading-relaxed text-text-primary md:text-xl">
                    <span className="mr-2">{questionIndex + 1})</span>
                    {currentQuestion?.question}
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    {(['option1', 'option2', 'option3', 'option4'] as const).map((optKey, idx) => {
                      const optionValue = currentQuestion?.[optKey];
                      const isSelected = currentQuestion
                        ? answers[currentQuestion.id] === idx + 1
                        : false;

                      return (
                        <button
                          key={optKey}
                          type="button"
                          onClick={() => currentQuestion && handleOptionSelect(currentQuestion.id, idx + 1)}
                          className={`group flex w-full items-center gap-4 rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                            isSelected
                              ? 'border-accent-gold bg-accent-gold/10 text-text-primary shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                              : 'border-transparent bg-bg-secondary text-text-secondary hover:border-accent-teal/30 hover:bg-bg-card'
                          }`}
                        >
                          <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black transition-colors ${
                            isSelected
                              ? 'bg-accent-gold text-black'
                              : 'bg-bg-primary text-text-secondary group-hover:bg-bg-secondary'
                          }`}>
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          <span className="text-[17px] font-semibold">{String(optionValue || '')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {quizError && (
                  <p className="mt-5 rounded-xl bg-red-500/10 p-3 text-center text-red-400">{quizError}</p>
                )}

                <div className="mx-auto mt-10 flex max-w-4xl items-center justify-between px-4">
                  <button
                    type="button"
                    onClick={handlePrevQuestion}
                    disabled={questionIndex === 0}
                    className="flex items-center gap-2 rounded-xl border-2 border-border bg-bg-secondary px-6 py-3 font-bold text-text-primary transition-all hover:border-accent-teal hover:bg-bg-card disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Previous
                  </button>

                  {questionIndex === test.questions.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => void submitQuiz()}
                      disabled={!currentAnswerSelected || submitting}
                      className="rounded-xl bg-accent-gold px-10 py-4 font-black text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:scale-105 hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {submitting ? 'Submitting...' : 'Submit Test'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      disabled={!currentAnswerSelected}
                      className="rounded-xl bg-accent-teal px-10 py-4 font-black text-white shadow-[0_0_20px_rgba(20,184,166,0.3)] transition-all hover:scale-105 hover:bg-accent-teal/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      Next Question
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="rounded-[2.5rem] border-2 border-border bg-bg-card p-8 text-center shadow-2xl">
                <Trophy className="mx-auto h-14 w-14 text-accent-gold" />
                <h2 className="mt-4 text-3xl font-black">{test?.title || 'Assessment'}</h2>
                <p className="mx-auto mt-3 max-w-2xl text-text-secondary">
                  {test
                    ? (test.instructions?.trim() ||
                      `Ready to begin? This assessment has ${test.questions?.length || 0} question${(test.questions?.length || 0) === 1 ? '' : 's'}.`)
                    : 'No assessment is available for this session.'}
                </p>
                {hasAlreadyPassedExam && (
                  <p className="mt-3 text-sm font-bold text-accent-gold">You are already passed the exam</p>
                )}
                {test && (
                  <button
                    type="button"
                    onClick={resetQuiz}
                    disabled={hasAlreadyPassedExam}
                    className="mt-7 rounded-xl bg-accent-teal px-6 py-3 font-black text-white"
                  >
                    Begin assessment
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
