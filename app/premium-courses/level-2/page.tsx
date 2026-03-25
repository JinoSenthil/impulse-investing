'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { BookOpen, HelpCircle, Lock, ArrowLeft, Home, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Level2StudyMaterial, Level2Quiz } from './data';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function Level2Page() {
    const { theme, toggleTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'study' | 'quiz'>('study');
    const [studyCompleted, setStudyCompleted] = useState(false);
    const [currentStudyPage, setCurrentStudyPage] = useState(0);

    const [currentQn, setCurrentQn] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

    const markStudyComplete = () => {
        setStudyCompleted(true);
    };

    const startQuiz = () => {
        setActiveTab('quiz');
        setCurrentQn(0);
        setScore(0);
        setShowResults(false);
        setSelectedOption(null);
        setIsAnswerCorrect(null);
    };

    const handleNextOrStartQuiz = () => {
        if (currentStudyPage < totalStudyPages - 1) {
            setCurrentStudyPage(currentStudyPage + 1);
        } else {
            markStudyComplete();
            startQuiz();
        }
    };

    const handleAnswerSelect = (optionKey: string) => {
        if (selectedOption !== null) return; // Prevent multiple clicks

        const correct = optionKey === Level2Quiz[currentQn].answer;
        setSelectedOption(optionKey);
        setIsAnswerCorrect(correct);

        if (correct) {
            setScore(prev => prev + 1);
        }

        setTimeout(() => {
            if (currentQn < Level2Quiz.length - 1) {
                setCurrentQn(currentQn + 1);
                setSelectedOption(null);
                setIsAnswerCorrect(null);
            } else {
                setShowResults(true);
            }
        }, 1200);
    };

    const totalStudyPages = Level2StudyMaterial.length;
    const currentStudy = Level2StudyMaterial[currentStudyPage];

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary font-sans relative overflow-x-hidden pt-20">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-green/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-teal/5 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className="sticky top-20 z-50 bg-bg-card/80 backdrop-blur-xl border-b border-border px-6 py-4 shadow-2xl">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link
                        href="/premium-courses"
                        className="flex items-center gap-2 text-text-secondary hover:text-accent-green transition-colors font-semibold group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden sm:inline">Back to Courses</span>
                    </Link>

                    <div className="text-center">
                        <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-[2px] text-accent-green">
                            Level 2: Trading Psychology
                        </h1>
                        <p className="text-xs text-text-secondary mt-0.5 font-medium">Trading Psychology & Success Formula</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-bg-secondary border border-border text-text-primary hover:bg-bg-card transition-all group"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? (
                                <Sun size={18} className="group-hover:rotate-45 transition-transform duration-500" />
                            ) : (
                                <Moon size={18} className="group-hover:-rotate-12 transition-transform duration-500 text-accent-gold" />
                            )}
                        </button>
                        <Link
                            href="/"
                            className="p-2.5 rounded-xl bg-bg-secondary hover:bg-accent-green/10 transition-all text-text-secondary hover:text-accent-green"
                        >
                            <Home className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-8 relative z-10">
                {/* Custom Tabs */}
                <div className="flex justify-center mb-10">
                    <div className="inline-flex p-1.5 bg-bg-secondary border border-border rounded-2xl shadow-xl">
                        <button
                            onClick={() => setActiveTab('study')}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'study'
                                ? 'bg-accent-green text-bg-primary shadow-lg'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            <BookOpen className="w-4 h-4" />
                            Study Material
                        </button>
                        <button
                            disabled={!studyCompleted}
                            onClick={() => studyCompleted && setActiveTab('quiz')}
                            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'quiz'
                                ? 'bg-accent-green text-bg-primary shadow-lg'
                                : studyCompleted
                                    ? 'text-text-secondary hover:text-text-primary'
                                    : 'opacity-40 cursor-not-allowed'
                                }`}
                        >
                            {studyCompleted ? <HelpCircle className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            Quiz Challenge
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'study' ? (
                        <motion.div
                            key="study-tab"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-8"
                        >
                            {/* Progress Section */}
                            <div className="bg-bg-card border border-border rounded-3xl p-6 shadow-xl">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-accent-green/10 flex items-center justify-center text-accent-green">
                                            <span className="font-bold text-sm">{currentStudyPage + 1}</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">Ongoing Progress</p>
                                            <p className="text-sm font-semibold text-text-primary">Page {currentStudyPage + 1} of {totalStudyPages}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-accent-green bg-accent-green/10 px-3 py-1.5 rounded-full self-start sm:self-center">
                                        {Math.round(((currentStudyPage + 1) / totalStudyPages) * 100)}% COMPLETE
                                    </span>
                                </div>
                                <div className="w-full bg-bg-secondary rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        className="bg-gradient-to-r from-accent-green to-accent-teal h-full rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((currentStudyPage + 1) / totalStudyPages) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            {/* Main Content Card */}
                            <div className="bg-bg-card border border-accent-green/20 rounded-[40px] p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <BookOpen className="w-32 h-32 text-accent-green" />
                                </div>

                                <h2 className="text-2xl sm:text-3xl font-bold text-accent-green mb-8 leading-tight">
                                    {currentStudy.title}
                                </h2>

                                <div className="h-0.5 w-20 bg-accent-green/30 mb-8" />

                                <div className="space-y-6">
                                    {currentStudy.content.split('\n').map((line, index) => (
                                        <p key={index} className="text-lg leading-relaxed text-text-secondary font-medium">
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {/* Study Footer Navigation */}
                            <div className="flex items-center justify-between gap-6 pt-4">
                                <button
                                    onClick={() => setCurrentStudyPage(Math.max(0, currentStudyPage - 1))}
                                    disabled={currentStudyPage === 0}
                                    className="flex items-center gap-3 bg-bg-secondary hover:bg-bg-card disabled:opacity-20 disabled:cursor-not-allowed text-text-primary py-4 px-8 rounded-2xl font-bold transition-all border border-border shadow-lg group"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Previous
                                </button>

                                <button
                                    onClick={handleNextOrStartQuiz}
                                    className="flex items-center gap-3 bg-accent-green text-bg-primary py-4 px-10 rounded-2xl font-bold shadow-[0_10px_30px_rgba(34,197,94,0.2)] hover:bg-[#168a5d] transition-all transform hover:scale-105 active:scale-95 group"
                                >
                                    {currentStudyPage < totalStudyPages - 1 ? (
                                        <>
                                            Next Page <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    ) : (
                                        'Start Final Quiz'
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="quiz-tab"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="max-w-3xl mx-auto"
                        >
                            {!showResults ? (
                                <div className="space-y-8">
                                    {/* Quiz Header */}
                                    <div className="text-center space-y-4">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-green/10 border border-accent-green/20 rounded-full">
                                            <HelpCircle className="w-4 h-4 text-accent-green" />
                                            <span className="text-xs font-black text-accent-green uppercase tracking-widest">
                                                Mastery Test
                                            </span>
                                        </div>
                                        <h2 className="text-3xl font-bold">Question {currentQn + 1} of {Level2Quiz.length}</h2>
                                        <div className="w-full bg-bg-secondary rounded-full h-1.5 max-w-xs mx-auto overflow-hidden">
                                            <motion.div
                                                className="bg-accent-green h-full rounded-full"
                                                animate={{ width: `${((currentQn + 1) / Level2Quiz.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Question Card */}
                                    <div className="bg-bg-card border border-accent-green/20 rounded-[40px] p-8 md:p-10 shadow-2xl relative">
                                        <h3 className="text-xl sm:text-2xl font-bold text-center mb-10 leading-relaxed text-text-primary">
                                            {Level2Quiz[currentQn]?.question}
                                        </h3>

                                        <div className="grid grid-cols-1 gap-4">
                                            {Level2Quiz[currentQn]?.options.map((option, idx) => {
                                                const optionKey = option.split('.')[0].trim();
                                                const isSelected = selectedOption === optionKey;
                                                const isCorrect = isAnswerCorrect && isSelected;

                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleAnswerSelect(optionKey)}
                                                        disabled={selectedOption !== null}
                                                        className={`w-full p-5 rounded-2xl font-bold text-left transition-all relative overflow-hidden group border-2 ${isSelected
                                                            ? isCorrect
                                                                ? 'bg-accent-green/20 border-accent-green text-accent-green'
                                                                : 'bg-red-500/20 border-red-500 text-red-500'
                                                            : 'bg-bg-secondary border-border text-text-secondary hover:border-accent-green/50 hover:text-text-primary'
                                                            }`}
                                                    >
                                                        <span className="relative z-10">{option}</span>
                                                        {isSelected && (
                                                            <div className="absolute inset-0 bg-bg-primary/5 pointer-events-none" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center px-4">
                                        <button
                                            onClick={() => setCurrentQn(Math.max(0, currentQn - 1))}
                                            disabled={currentQn === 0 || selectedOption !== null}
                                            className="text-text-secondary hover:text-accent-green font-bold transition-colors disabled:opacity-0"
                                        >
                                            ← Previous Question
                                        </button>
                                        <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                                            Accuracy: {Math.round((score / (currentQn || 1)) * 100)}%
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-bg-card border-2 border-accent-green rounded-[40px] p-12 text-center shadow-[0_0_80px_rgba(34,197,94,0.15)]"
                                >
                                    <div className="w-24 h-24 bg-accent-green/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                        <HelpCircle className="w-12 h-12 text-accent-green" />
                                    </div>
                                    <h2 className="text-4xl font-bold mb-4">Quiz Completed!</h2>
                                    <p className="text-text-secondary mb-10 text-lg">You&apos;ve successfully completed the Level 2 Mastery Challenge.</p>

                                    <div className="grid grid-cols-2 gap-6 mb-12">
                                        <div className="bg-bg-secondary p-6 rounded-3xl border border-border">
                                            <p className="text-3xl font-black text-accent-green">{score}</p>
                                            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-1">Correct Answers</p>
                                        </div>
                                        <div className="bg-bg-secondary p-6 rounded-3xl border border-border">
                                            <p className="text-3xl font-black text-accent-teal">{Math.round((score / Level2Quiz.length) * 100)}%</p>
                                            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest mt-1">Total Score</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                                        <button
                                            onClick={startQuiz}
                                            className="px-10 py-4 bg-bg-secondary hover:bg-bg-card rounded-2xl font-bold transition-all border border-border text-text-primary"
                                        >
                                            Retake Quiz
                                        </button>
                                        <Link
                                            href="/premium-courses"
                                            className="px-10 py-4 bg-accent-green text-bg-primary rounded-2xl font-bold transition-all hover:bg-[#168a5d] shadow-lg shadow-accent-green/20"
                                        >
                                            Next Level →
                                        </Link>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <footer className="py-12 border-t border-border text-center mt-auto">
                <p className="text-text-secondary text-sm font-medium">
                    &copy; 2026 IMPULSE TRADING ACADEMY. Empowering Your Financial Future.
                </p>
            </footer>
        </div>
    );
}
