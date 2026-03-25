'use client'

import DashboardPageWrapper from '@/components/ui/DashboardPageWrapper'
import { Trophy, CheckCircle, XCircle, BarChart3, Users, Target, Filter, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import ApiService from '@/services/ApiService'
import { UserTest } from '@/types'
import Pagination from '@/components/ui/Pagination' 
import GlobalLoading from '@/components/ui/GlobalLoading'

interface ModuleSummary {
    moduleId: number
    totalAttempts: number
    failedAttempts: number
    passedAttempts: number
    latestAttempt: string
    bestScore: number
    totalQuestions: number
    testIds: number[] // Store all test IDs for this module
}

export default function QuizResult() {
    const { user } = useSelector((state: RootState) => state.auth)
    const currentUserId = user?.id

    const [userTests, setUserTests] = useState<UserTest[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState<number | null>(null)
    const [selectedModule, setSelectedModule] = useState<number | null>(null)
    const [showOnlyFailed, setShowOnlyFailed] = useState(false)
    const [showAllUsers, setShowAllUsers] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 6 // Show 6 modules per page (2 rows of 3 cards)

    console.log("Show all users", setShowAllUsers)

    useEffect(() => {
        const fetchUserTests = async () => {
            try {
                setLoading(true)
                setError(null)

                const userId = showAllUsers
                    ? selectedUser || undefined
                    : currentUserId || undefined

                const data = await ApiService.getAllUserTests({
                    userId,
                    moduleId: selectedModule || undefined,
                    isPassed: showOnlyFailed ? false : undefined,
                })

                setUserTests(data || [])
                setCurrentPage(1)

                if (!data || data.length === 0) {
                    setError('No quiz attempts found. Please complete some quizzes first.')
                }
            } catch (error) {
                console.error('Error fetching user tests:', error)
                setError('Unable to load quiz results. Please try again later.')
                setUserTests([])
            } finally {
                setLoading(false)
            }
        }

        fetchUserTests()
    }, [currentUserId, selectedUser, selectedModule, showOnlyFailed, showAllUsers])

    // Create module summaries from ALL tests (not just current page)
    const allModuleSummaries: ModuleSummary[] = userTests.reduce((acc: ModuleSummary[], test) => {
        const existingModule = acc.find(item => item.moduleId === test.moduleId)
        
        if (existingModule) {
            existingModule.totalAttempts++
            if (!test.isPassed) existingModule.failedAttempts++
            if (test.isPassed) existingModule.passedAttempts++
            if (test.attemptDate > existingModule.latestAttempt) {
                existingModule.latestAttempt = test.attemptDate
            }
            if (test.score > existingModule.bestScore) {
                existingModule.bestScore = test.score
            }
            existingModule.totalQuestions = Math.max(existingModule.totalQuestions, test.testAnswer?.length || 2)
            existingModule.testIds.push(test.id)
        } else {
            acc.push({
                moduleId: test.moduleId,
                totalAttempts: 1,
                failedAttempts: test.isPassed ? 0 : 1,
                passedAttempts: test.isPassed ? 1 : 0,
                latestAttempt: test.attemptDate,
                bestScore: test.score,
                totalQuestions: test.testAnswer?.length || 2,
                testIds: [test.id]
            })
        }
        
        return acc
    }, [])

    // Filter module summaries if needed
    const filteredModuleSummaries = allModuleSummaries.filter(module => {
        if (selectedModule && module.moduleId !== selectedModule) return false
        if (showOnlyFailed && module.failedAttempts === 0) return false
        return true
    })

    // Paginate the module summaries (not the individual tests)
    const totalPages = Math.ceil(filteredModuleSummaries.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const currentModules = filteredModuleSummaries.slice(startIndex, startIndex + itemsPerPage)

    // Stats based on ALL tests
    const totalAttempts = userTests.length
    const failedTests = userTests.filter(test => !test.isPassed).length
    const passedTests = userTests.filter(test => test.isPassed).length
    const averageScore = totalAttempts > 0
        ? (userTests.reduce((sum, test) => sum + test.score, 0) / totalAttempts).toFixed(1)
        : '0'

        const failureRate = totalAttempts > 0
  ? ((failedTests / totalAttempts) * 100).toFixed(1)
  : '0'

   const totalModules = allModuleSummaries.length

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // if (loading) {
    //     return (
    //         <DashboardPageWrapper title="My Quiz Results">
    //             <div className="flex items-center justify-center min-h-[400px]">
    //                 <div className="text-center">
    //                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mx-auto mb-4"></div>
    //                     <p className="text-text-secondary"><GlobalLoading /></p>
    //                 </div>
    //             </div>
    //         </DashboardPageWrapper>
    //     )
    // }

       if (loading) {
            return (
                <DashboardPageWrapper title="My Quiz Results">
                    <div className="flex justify-center items-center py-20">
                        <div className="text-2xl text-accent-gold animate-pulse"><GlobalLoading /></div>
                    </div>
                </DashboardPageWrapper>
            )
        }

    const hasResults = userTests.length > 0
    const hasCurrentModules = currentModules.length > 0

    return (
        <DashboardPageWrapper title="My Quiz Results">
            {/* User Info Banner */}
            <div className="bg-gradient-to-r from-accent-gold/10 to-accent-gold/5 border-2 border-accent-gold/30 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-accent-gold/20 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-accent-gold" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold font-cinzel mb-1">Quiz Performance Analysis</h2>
                            <p className="text-sm text-text-secondary">Track your learning progress and quiz results</p>
                        </div>
                    </div>

                    {/* Compact Filter Section */}
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <button className="flex items-center gap-2 bg-bg-card border border-border rounded-xl px-4 py-2 hover:border-accent-gold/50 transition-colors">
                                <Filter className="w-5 h-5 text-accent-gold" />
                                <span className="text-sm font-medium">Filters</span>
                            </button>

                            <div className="absolute right-0 top-full mt-2 bg-bg-card border-2 border-border rounded-xl p-4 w-80 shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-1 block">
                                            Module
                                        </label>
                                        <select
                                            className="w-full bg-bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:border-accent-gold outline-none"
                                            value={selectedModule || ''}
                                            onChange={(e) => setSelectedModule(e.target.value ? Number(e.target.value) : null)}
                                        >
                                            <option value="">All Modules</option>
                                            {allModuleSummaries.map(module => (
                                                <option key={module.moduleId} value={module.moduleId}>Module {module.moduleId}</option>
                                            ))}
                                        </select>
                                    </div>
                                  
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {!hasResults && error ? (
                <div className="bg-bg-card border-2 border-border rounded-2xl p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trophy className="w-10 h-10 text-text-secondary" />
                        </div>
                        <h3 className="text-xl font-bold font-cinzel mb-3">No Quiz Results Yet</h3>
                        <p className="text-text-secondary mb-8">
                            You have not attempted any quizzes yet. Complete some modules and take the quizzes to see your results here.
                        </p>
                    </div>
                </div>
            ) : hasResults ? (
                <>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-bg-card border-2 border-border rounded-2xl p-4 hover:border-accent-gold transition">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent-gold/10 rounded-lg">
                                    <Target className="w-5 h-5 text-accent-gold" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider"> Total Modules</div>
                                    <div className="text-base font-bold">{totalModules}</div>
                                </div>
                            </div>
                        </div>

                         <div className="bg-bg-card border-2 border-border rounded-2xl p-4 hover:border-accent-gold transition">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent-green/10 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-accent-green" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Passed Tests</div>
                                    <div className="text-base font-bold text-accent-green">{passedTests}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-bg-card border-2 border-border rounded-2xl p-4 hover:border-accent-gold transition">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-400/10 rounded-lg">
                                    <XCircle className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider"> Failure Rate</div>
                                    <div className="text-base font-bold text-red-400">  {failureRate}%</div>
                                </div>
                            </div>
                        </div>

                       

                        <div className="bg-bg-card border-2 border-border rounded-2xl p-4 hover:border-accent-gold transition">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg">
                                    <Trophy className="w-5 h-5 text-purple-500" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Avg Score</div>
                                    <div className="text-base font-bold">{averageScore}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Module Overview with Pagination */}
                        {hasCurrentModules ? (
                            <>
                                <div>
                                    <h2 className="text-xl font-bold font-cinzel mb-6">Module Performance</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {currentModules.map((module) => {
                                            // Calculate average score for this module
                                            const moduleTests = userTests.filter(test => test.moduleId === module.moduleId)
                                            const moduleAvgScore = moduleTests.length > 0
                                                ? (moduleTests.reduce((sum, test) => sum + test.score, 0) / moduleTests.length).toFixed(1)
                                                : '0'
                                            
                                            // Calculate success rate
                                            const successRate = module.totalAttempts > 0
                                                ? ((module.passedAttempts / module.totalAttempts) * 100).toFixed(1)
                                                : '0'

                                            return (
                                                <div 
                                                    key={module.moduleId} 
                                                    className="bg-bg-card border-2 border-border hover:border-accent-gold rounded-2xl p-6 transition group flex flex-col h-full"
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-lg font-bold group-hover:text-accent-gold transition font-cinzel">
                                                            Module {module.moduleId}
                                                        </h3>
                                                       
                                                    </div>

                                                    <div className="space-y-4 mb-6 flex-grow">
                                                      

                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-text-secondary">Best Score:</span>
                                                                <span className="font-bold">{module.bestScore}/{module.totalQuestions}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-text-secondary">Average Score:</span>
                                                                <span className="font-bold">{moduleAvgScore}/{module.totalQuestions}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-text-secondary">Success Rate:</span>
                                                                <span className="font-bold">{successRate}%</span>
                                                            </div>
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-text-secondary">Latest Attempt:</span>
                                                                <span className="text-sm font-bold">{formatDate(module.latestAttempt)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-auto">
                                                        <Link
                                                            href={{
                                                                pathname: `/dashboard/quizresult/${module.moduleId}`,
                                                                query: showAllUsers && selectedUser ? { userId: selectedUser } : {}
                                                            }}
                                                            className="w-full flex items-center justify-center gap-2 bg-accent-gold text-bg-primary px-4 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition group"
                                                        >
                                                            View All Attempts
                                                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Pagination Component - Only show if more than one page */}
                                {totalPages > 1 && (
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={(page) => setCurrentPage(page)}
                                    />
                                )}
                            </>
                        ) : (
                            <div className="bg-bg-card border-2 border-border rounded-2xl p-8 text-center">
                                <div className="max-w-sm mx-auto">
                                    <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                        <BarChart3 className="w-8 h-8 text-text-secondary" />
                                    </div>
                                    <h4 className="text-lg font-bold mb-2">No Modules Found</h4>
                                    <p className="text-text-secondary mb-6">
                                        No quiz attempts found for the selected filters.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSelectedModule(null)
                                            setSelectedUser(null)
                                            setShowOnlyFailed(false)
                                        }}
                                        className="bg-bg-secondary border border-border px-4 py-2 rounded-xl text-sm font-bold hover:border-accent-gold transition"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : null}
        </DashboardPageWrapper>
    )
}