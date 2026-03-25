'use client'

import DashboardPageWrapper from '@/components/ui/DashboardPageWrapper'
import { ArrowLeft, CheckCircle, XCircle, FileText, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import ApiService from '@/services/ApiService'
import { UserTest } from '@/types'

interface QuestionAnalysis {
  questionId: number
  totalAttempts: number
  correctAttempts: number
  incorrectAttempts: number
  commonIncorrectOptions: string[]
  successRate: number
}

export default function ModuleDetailedView() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const moduleId = Number(params.moduleId)

  const { user } = useSelector((state: RootState) => state.auth)
  const currentUserId = user?.id

  const userIdFromUrl = searchParams.get('userId')
  const targetUserId = userIdFromUrl ? parseInt(userIdFromUrl) : currentUserId

  const [userTests, setUserTests] = useState<UserTest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAttempt, setSelectedAttempt] = useState<UserTest | null>(null)
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const attemptsScrollRef = useRef<HTMLDivElement>(null)
  const questionsScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchModuleTests = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await ApiService.getAllUserTests({
          moduleId,
          userId: targetUserId || undefined,
        })

        if (data && data.length > 0) {
          setUserTests(data)

          const latestAttempt = [...data].sort(
            (a, b) =>
              new Date(b.attemptDate).getTime() -
              new Date(a.attemptDate).getTime()
          )[0]

          setSelectedAttempt(latestAttempt)
          setSelectedAttemptId(latestAttempt.id)
        } else {
          setUserTests([])
          setError('No quiz attempts found for this module.')
        }
      } catch (error) {
        console.error('Error fetching module tests:', error)
        setError('Unable to load module data. Please try again later.')
        setUserTests([])
      } finally {
        setLoading(false)
      }
    }

    if (moduleId) {
      fetchModuleTests()
    }
  }, [moduleId, targetUserId])

  // Update scroll button states
  useEffect(() => {
    const checkScroll = () => {
      const container = attemptsScrollRef.current
      if (container) {
        setCanScrollLeft(container.scrollLeft > 0)
        setCanScrollRight(
          container.scrollLeft < container.scrollWidth - container.clientWidth - 1
        )
      }
    }

    const container = attemptsScrollRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      checkScroll() 
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScroll)
      }
    }
  }, [userTests])

  const scrollAttempts = (direction: 'left' | 'right') => {
    const container = attemptsScrollRef.current
    if (container) {
      const scrollAmount = 200
      const newPosition = direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount

      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      })
    }
  }

  const totalAttempts = userTests.length
  const passedAttempts = userTests.filter(test => test.isPassed).length
  const averageScore = totalAttempts > 0
    ? (userTests.reduce((sum, test) => sum + test.score, 0) / totalAttempts).toFixed(1)
    : '0'
  const successRate = totalAttempts > 0
    ? ((passedAttempts / totalAttempts) * 100).toFixed(1)
    : '0'

  // Get question analysis
  const questionAnalysis: QuestionAnalysis[] = []
  userTests.forEach(test => {
    test.testAnswer.forEach(answer => {
      const existing = questionAnalysis.find(q => q.questionId === answer.questionId)
      if (existing) {
        existing.totalAttempts++
        if (answer.isCorrect) {
          existing.correctAttempts++
        } else {
          existing.incorrectAttempts++
          if (!existing.commonIncorrectOptions.includes(answer.selectedOption)) {
            existing.commonIncorrectOptions.push(answer.selectedOption)
          }
        }
        existing.successRate = (existing.correctAttempts / existing.totalAttempts) * 100
      } else {
        questionAnalysis.push({
          questionId: answer.questionId,
          totalAttempts: 1,
          correctAttempts: answer.isCorrect ? 1 : 0,
          incorrectAttempts: answer.isCorrect ? 0 : 1,
          commonIncorrectOptions: answer.isCorrect ? [] : [answer.selectedOption],
          successRate: answer.isCorrect ? 100 : 0
        })
      }
    })
  })

  // Sort question analysis by questionId
  questionAnalysis.sort((a, b) => a.questionId - b.questionId)

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <DashboardPageWrapper title={`Module ${moduleId} Analysis`}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading module analysis...</p>
          </div>
        </div>
      </DashboardPageWrapper>
    )
  }

  return (
    <DashboardPageWrapper title={`Module ${moduleId} - Your Performance Analysis`}>
      {/* Back button and header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard/quizresult"
          className="flex items-center gap-2 text-text-secondary hover:text-accent-gold transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Overview
        </Link>
      </div>

      {error && !userTests.length ? (
        <div className="bg-red-400/10 border-2 border-red-400/30 rounded-2xl p-8 text-center mb-6">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Unable to Load Data</h3>
          <p className="text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => router.refresh()}
            className="bg-accent-gold text-bg-primary px-4 py-2 rounded-xl font-bold hover:opacity-90 transition"
          >
            Try Again
          </button>
        </div>
      ) : userTests.length === 0 ? (
        <div className="bg-bg-card border-2 border-border rounded-2xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-text-secondary" />
            </div>
            <h3 className="text-xl font-bold font-cinzel mb-3">No Attempts Found</h3>
            <p className="text-text-secondary mb-8">
              No quiz attempts found for Module {moduleId}. Complete this modules quiz to see your results here.
            </p>
            <Link
              href="/dashboard/quizresult"
              className="bg-accent-gold text-bg-primary px-6 py-3 rounded-xl font-bold hover:opacity-90 transition"
            >
              Back to Overview
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-bg-card border-2 border-border rounded-2xl p-4 hover:border-accent-gold transition">
              <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Total Attempts</div>
              <div className="text-xl font-bold">{totalAttempts}</div>
            </div>
            <div className="bg-bg-card border-2 border-border rounded-2xl p-4 hover:border-accent-gold transition">
              <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                Failed Attempts
              </div>
              <div className="text-xl font-bold text-red-400">
                {userTests.filter(test => !test.isPassed).length}
              </div>
            </div>
            <div className="bg-bg-card border-2 border-border rounded-2xl p-4 hover:border-accent-gold transition">
              <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Success Rate</div>
              <div className="text-xl font-bold text-accent-green">{successRate}%</div>
            </div>
            <div className="bg-bg-card border-2 border-border rounded-2xl p-4 hover:border-accent-gold transition">
              <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Avg Score</div>
              <div className="text-xl font-bold">{averageScore}</div>
            </div>
          </div>

          {/* Attempt Selection and Details */}
          <div className="bg-bg-card border-2 border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-accent-gold" />
                <h3 className="text-lg font-bold font-cinzel">Select Attempt</h3>
              </div>

              {/* Scroll buttons for attempts */}
              <div className="flex gap-2">
                <button
                  onClick={() => scrollAttempts('left')}
                  className="p-2 rounded-lg bg-bg-secondary hover:bg-border transition disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={!canScrollLeft}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollAttempts('right')}
                  className="p-2 rounded-lg bg-bg-secondary hover:bg-border transition disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={!canScrollRight}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Attempts scrollable container */}
            <div className="relative mb-6">
              <div
                ref={attemptsScrollRef}
             className="flex gap-2 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory custom-scrollbar"

              >
                {userTests
                  .sort((a, b) => b.attemptNumber - a.attemptNumber)
                  .map((test) => (
                    <button
                      key={test.id}
                      onClick={() => {
                        setSelectedAttempt(test)
                        setSelectedAttemptId(test.id)
                      }}
                      className={`snap-start flex-shrink-0 px-4 py-2 rounded-xl font-bold text-sm transition min-w-[100px]
                        ${selectedAttemptId === test.id
                          ? 'bg-accent-gold text-bg-primary'
                          : 'bg-bg-secondary hover:bg-bg-card'}`}
                    >
                      <div>Attempt {test.attemptNumber}</div>
                      <div className={`text-[10px] ${selectedAttemptId === test.id ? 'text-bg-primary/80' : 'text-text-secondary'}`}>
                        {formatDate(test.attemptDate)}
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Selected Attempt Details */}
            {selectedAttempt && (
              <div className="border-t border-border pt-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
                  <div>
                    <h4 className="text-lg font-bold font-cinzel mb-1">
                      Attempt {selectedAttempt.attemptNumber} Details
                    </h4>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {formatDate(selectedAttempt.attemptDate)}
                      </span>
                      <span>Test #{selectedAttempt.testId}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-2 rounded-xl font-bold ${selectedAttempt.isPassed ? 'bg-accent-green/10 text-accent-green' : 'bg-red-400/10 text-red-400'}`}>
                      Score: {selectedAttempt.score}
                    </div>
                    <div className={`p-2 rounded-lg ${selectedAttempt.isPassed ? 'bg-accent-green/20' : 'bg-red-400/20'}`}>
                      {selectedAttempt.isPassed ? (
                        <CheckCircle className="w-5 h-5 text-accent-green" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Question Answers - Scrollable Container */}
                <div className="space-y-4">
                  <h5 className="text-sm font-bold text-text-secondary">Question Answers:</h5>
                  <div
                    ref={questionsScrollRef}
                 className="max-h-[600px] overflow-y-auto space-y-4 pr-4 custom-scrollbar"

                  >
                    {selectedAttempt.testAnswer.map((answer) => (
                      <div key={answer.id} className="bg-bg-secondary rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${answer.isCorrect ? 'bg-accent-green/20' : 'bg-red-400/20'}`}>
                              {answer.isCorrect ? (
                                <CheckCircle className="w-4 h-4 text-accent-green" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-400" />
                              )}
                            </div>
                            <span className="font-bold text-sm">Question {answer.questionId}</span>
                          </div>
                          <div className={`text-xs font-bold px-2 py-1 rounded flex-shrink-0 ${answer.isCorrect ? 'bg-accent-green/10 text-accent-green' : 'bg-red-400/10 text-red-400'}`}>
                            {answer.isCorrect ? 'Correct' : 'Incorrect'}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs text-text-secondary mb-1">Selected Option:</div>
                            <div className="font-bold text-sm break-words">{answer.selectedOption}</div>
                          </div>
                          <div>
                            <div className="text-xs text-text-secondary mb-1">Status:</div>
                            <div className={`font-bold text-sm ${answer.isCorrect ? 'text-accent-green' : 'text-red-400'}`}>
                              {answer.isCorrect ? 'Correct Answer' : 'Wrong Answer'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardPageWrapper>
  )
}