'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import Link from 'next/link';
import ApiService from '@/services/ApiService';
import { OnlineCourseDetails, CourseModule, CourseLesson, PurchaseDetailsResponse, Payment, CoursePurchase } from '@/types';
import { ArrowLeft, BookOpen, Clock, ChevronRight, CheckCircle, Loader2, Lock, PlayCircle, AlertCircle, X, CreditCard, Wallet, Banknote, Smartphone, Shield, ChevronDown } from 'lucide-react';
import PaymentModal from '@/components/ui/PaymentModal';
import Image from 'next/image';
import { getFullImageUrl } from '@/lib/utils'
import { useTheme } from '@/components/providers/ThemeProvider';
import { Sun, Moon } from 'lucide-react';

import type { CourseTest as ImportedCourseTest, TestQuestion as ImportedTestQuestion, UserTest as ImportedUserTest } from '@/types';
import GlobalLoading from '@/components/ui/GlobalLoading';

interface TestQuestion extends Omit<ImportedTestQuestion, 'correctOption'> {
  correctOption: string;
}

interface CourseTest extends Omit<ImportedCourseTest, 'questions'> {
  questions: TestQuestion[];
}

interface UserTest extends Omit<ImportedUserTest, 'testAnswer'> {
  testAnswer: Array<{
    id: number;
    questionId: number;
    selectedOption: string;
    isCorrect: boolean;
  }>;
}

export default function LevelPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id;

  const { theme, toggleTheme } = useTheme(); // Added hook

  const courseNumber = params.courseNumber as string;
  const levelId = params.levelId as string;


  const [courseData, setCourseData] = useState<OnlineCourseDetails | null>(null);
  const [currentModule, setCurrentModule] = useState<CourseModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Quiz State
  const [activeTab, setActiveTab] = useState<'study' | 'quiz'>('study');
  const [currentTest, setCurrentTest] = useState<CourseTest | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [, setIsPassed] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showResultAlert, setShowResultAlert] = useState(false);
  const [userTests, setUserTests] = useState<UserTest[]>([]);

  // Track completed lessons
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());
  // Track visited lessons to auto-mark as complete
  const [visitedLessons, setVisitedLessons] = useState<Set<number>>(new Set());

  // Track next module availability
  const [hasNextModule, setHasNextModule] = useState(false);
  const [nextModuleId, setNextModuleId] = useState<number | null>(null);
  const [nextModulePreviewStatus, setNextModulePreviewStatus] = useState<boolean>(false);
  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetailsResponse | null>(null);

  // New state for quiz navigation
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  // New state for study material exit confirmation
  const [showExitStudyConfirm, setShowExitStudyConfirm] = useState(false);

  // New state for purchase alert
  const [showPurchaseAlert, setShowPurchaseAlert] = useState(false);

  // Payment confirmation modal state
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CREDIT_CARD');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCheckingPurchase, setIsCheckingPurchase] = useState(false);

  // Add this with your other useState declarations
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  // Add state to control header visibility
  const [showHeader, setShowHeader] = useState(true);

  // Payment modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'loading' as 'loading' | 'success' | 'error' | 'info',
    title: '',
    message: '',
    showConfirmButton: false,
  });

  // Add this useEffect to track when any modal opens or closes
  useEffect(() => {
    const anyModalOpen =
      showPaymentConfirm ||
      modalState.isOpen ||
      showPurchaseAlert ||
      showResultAlert ||
      showExitConfirm ||
      showExitStudyConfirm ||
      quizSubmitted; // Include quiz submitted state

    setIsAnyModalOpen(anyModalOpen);

    // Hide header when:
    // 1. Payment modal is open
    // 2. Any status modal is open
    // 3. Result alert modal is open
    // 4. Quiz is submitted (showing inline results)
    if (showPaymentConfirm || modalState.isOpen || showResultAlert || quizSubmitted) {
      setShowHeader(false);
    } else {
      // Only show header when no modals are open AND quiz is not submitted
      setShowHeader(!anyModalOpen);
    }
  }, [
    showPaymentConfirm,
    modalState.isOpen,
    showPurchaseAlert,
    showResultAlert,
    showExitConfirm,
    showExitStudyConfirm,
    quizSubmitted
  ]);

  const paymentMethods = [
    { id: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
    { id: 'DEBIT_CARD', label: 'Debit Card', icon: CreditCard },
    { id: 'UPI', label: 'UPI', icon: Smartphone },
    { id: 'NET_BANKING', label: 'Net Banking', icon: Banknote },
    { id: 'WALLET', label: 'Wallet', icon: Wallet },
    { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Banknote },
  ];

  useEffect(() => {
    // Check if we're in review mode from query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const reviewParam = searchParams.get('review');
    setIsReviewMode(reviewParam === 'true');
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (activeTab === 'quiz' && quizStarted && !quizSubmitted) {
        setShowExitConfirm(true);
        // Prevent the actual navigation
        window.history.pushState(null, '', window.location.href);
      } else if (activeTab === 'study') {
        const hasProgress = completedLessons.size > 0 || visitedLessons.size > 0;
        if (hasProgress) {
          setShowExitStudyConfirm(true);
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initialize history state
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTab, quizStarted, quizSubmitted, completedLessons, visitedLessons]);

  // Fetch purchase details when course data is loaded
  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      if (courseNumber && userId) {
        try {
          const details = await ApiService.getPurchaseDetails(courseNumber, userId);
          setPurchaseDetails(details);
        } catch (err) {
          console.error('Failed to fetch purchase details:', err);
          // Don't set error state here, just log it
        }
      }
    };

    if (courseNumber && userId) {
      fetchPurchaseDetails();
    }
  }, [courseNumber, userId]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await ApiService.getOnlineCourseDetails(courseNumber);
        setCourseData(data);

        const moduleIdNum = parseInt(levelId.replace('level-', ''));
        const foundModule = data.onlineCourse[0]?.modules?.find(m => m.id === moduleIdNum);

        // Check if there's a next module
        if (foundModule && data.onlineCourse[0]?.modules) {
          const moduleIndex = data.onlineCourse[0].modules.findIndex(m => m.id === moduleIdNum);
          if (moduleIndex !== -1 && moduleIndex < data.onlineCourse[0].modules.length - 1) {
            const nextMod = data.onlineCourse[0].modules[moduleIndex + 1];
            setHasNextModule(true);
            setNextModuleId(nextMod.id);
            setNextModulePreviewStatus(nextMod.isPreview || false);
          }
        }

        // Type-safe test handling
        const testData = data.test?.find(t => t.moduleId === moduleIdNum);
        if (testData) {
          // Cast the test data to match our extended type
          const typedTest: CourseTest = {
            ...testData,
            questions: testData.questions.map(q => ({
              ...q,
              correctOption: q.correctOption ?? ''
            }))
          };
          setCurrentTest(typedTest);
          setTotalQuestions(typedTest.questions.length);
        }

        if (foundModule) {
          setCurrentModule(foundModule);
          // Set first lesson as default
          if (foundModule.lessons && foundModule.lessons.length > 0) {
            const firstLesson = foundModule.lessons[0];
            setSelectedLesson(firstLesson);
            // Auto-mark first lesson as visited
            setVisitedLessons(prev => new Set([...prev, firstLesson.id]));
          }
        } else {
          setError('Module not found');
        }

        // Fetch user test history
        if (userId && moduleIdNum) {
          try {
            const tests = await ApiService.getAllUserTests({
              userId,
              moduleId: moduleIdNum
            });

            // Type-safe conversion
            const typedTests: UserTest[] = Array.isArray(tests)
              ? tests.map(test => ({
                ...test,
                testAnswer: Array.isArray(test.testAnswer) ? test.testAnswer : []
              }))
              : [];

            setUserTests(typedTests);
            console.log('User tests loaded:', typedTests);

            // If in review mode, automatically switch to study tab
            if (isReviewMode || typedTests.length > 0) {
              setActiveTab('study');
            }
          } catch (error) {
            console.error('Failed to fetch user tests:', error);
          }
        }
      } catch (err) {
        console.error('Failed to fetch course details:', err);
        setError('Failed to load lesson. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (courseNumber && levelId) {
      fetchData();
    }
  }, [courseNumber, levelId, userId, isReviewMode]);

  // Auto-mark lesson as completed when selected
  useEffect(() => {
    if (selectedLesson) {
      // Mark as visited
      setVisitedLessons(prev => new Set([...prev, selectedLesson.id]));

      // Auto-complete after a short delay (simulating user viewing the lesson)
      const timer = setTimeout(() => {
        setCompletedLessons(prev => {
          const newSet = new Set([...prev, selectedLesson.id]);
          return newSet;
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [selectedLesson]);

  // Reset quiz started state when switching tabs
  useEffect(() => {
    if (activeTab === 'study') {
      setQuizStarted(false);
    }
  }, [activeTab]);

  // Check if all lessons are completed
  const allLessonsCompleted = currentModule?.lessons
    ? completedLessons.size === currentModule.lessons.length
    : false;

  // Simplified canAccessNextModule function
  const canAccessNextModule = () => {
    if (!hasNextModule) return false;

    // If next module is preview, allow access
    if (nextModulePreviewStatus) return true;

    // Check if user has purchased the course
    if (purchaseDetails) {
      return purchaseDetails.isPurchased;
    }

    return false;
  };

  // Function to handle navigation to next lesson
  const handleNavigateToNextLesson = () => {
    if (!hasNextModule || !nextModuleId) {
      router.push(`/premium-courses/${courseNumber}?completed=true`);
      return;
    }

    // Check if user can access next module
    if (canAccessNextModule()) {
      // User can access, navigate to next module
      router.push(`/premium-courses/${courseNumber}/level-${nextModuleId}`);
    } else {
      // Show purchase alert
      setShowPurchaseAlert(true);
    }
  };

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    if (quizSubmitted || !currentTest) return;
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex // This should be 1, 2, 3, or 4
    }));
  };

  const handleNextQuestion = () => {
    if (currentTest && currentQuestionIndex < currentTest.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleTakeQuizChallenge = () => {
    // FIX 1: Check if user is logged in before proceeding
    if (!userId) {
      router.push(`/login?redirect=/premium-courses/${courseNumber}/level-${levelId}`);
      return;
    }

    // If in review mode, don't allow taking quiz
    if (isReviewMode) {
      alert('You have already completed this quiz. You can only review the study material.');
      return;
    }

    const hasPassed = Array.isArray(userTests) && userTests.some(test => test.isPassed);

    if (hasPassed) {
      if (window.confirm('You have already passed this quiz. Do you want to retake it?')) {
        setActiveTab('quiz');
        resetQuiz();
      }
    } else {
      setActiveTab('quiz');
      resetQuiz();
    }
  };

  const calculateScore = async () => {
    if (!currentTest || !userId || !currentModule) {
      console.error('No test available or user not authenticated');
      return;
    }

    // First, calculate the score locally
    let correctAnswers = 0;
    const answerDetails = currentTest.questions.map(question => {
      const selectedOption = selectedAnswers[question.id];
      let isCorrect = false;

      if (selectedOption !== undefined) {
        // Convert "OPTION1" to 1, "OPTION2" to 2, etc.
        const correctOptionNumber = parseInt(question.correctOption.replace('OPTION', ''));
        isCorrect = (selectedOption === correctOptionNumber);

        if (isCorrect) {
          correctAnswers++;
        }
      }

      return {
        questionId: question.id,
        selectedOption: selectedOption !== undefined ? `OPTION${selectedOption}` : '',
        isCorrect: isCorrect
      };
    });

    const totalQuestions = currentTest.questions.length;

    // Calculate based on passMark as number of correct answers needed
    const passMark = currentTest.passMark || Math.ceil(totalQuestions * 0.6); // 60% as default
    const passed = correctAnswers >= passMark;

    console.log('Local Quiz Calculation:', {
      correctAnswers,
      totalQuestions,
      passMark,
      passed,
      percentage: (correctAnswers / totalQuestions) * 100
    });

    try {
      // Prepare submission data
      const submissionData = {
        userId: userId,
        testId: currentTest.id,
        moduleId: currentModule.id,
        answers: answerDetails.map(answer => ({
          questionId: answer.questionId,
          selectedOption: answer.selectedOption
        }))
      };

      // Submit to API
      const response = await ApiService.createUserTest(submissionData);
      console.log('API Response:', response);

      // IMPORTANT: Use our local calculation for pass/fail, not the API's
      // The backend API is returning incorrect isPassed value
      const finalScore = response.score || correctAnswers;
      const finalTotalQuestions = response.testAnswer?.length || totalQuestions;

      // ALWAYS use our local calculation for pass/fail
      const finalIsPassed = passed; // This is our correct calculation

      // But also check if the API gave us a score that we should use
      let apiScore = finalScore;

      if (Array.isArray(response.testAnswer)) {
        const apiCorrectAnswers = response.testAnswer.filter(answer => {
          return (
            typeof answer === 'object' &&
            answer !== null &&
            'isCorrect' in answer &&
            Boolean((answer as { isCorrect?: boolean }).isCorrect)
          );
        }).length;

        apiScore = apiCorrectAnswers;
      }

      console.log('Final Results to Show:', {
        score: apiScore,
        isPassed: finalIsPassed,
        totalQuestions: finalTotalQuestions,
        localCalculation: {
          correctAnswers,
          passed,
          passMark
        }
      });

      // Set the state with our corrected values
      setScore(apiScore);
      setIsPassed(finalIsPassed);
      setTotalQuestions(finalTotalQuestions);
      setQuizSubmitted(true);

      // Hide header immediately before showing result alert
      setShowHeader(false);
      setShowResultAlert(true);
      setQuizStarted(false);

      // Refresh user tests
      if (currentModule.id) {
        const tests = await ApiService.getAllUserTests({
          userId,
          moduleId: currentModule.id
        });

        // Type-safe conversion
        const typedTests: UserTest[] = Array.isArray(tests)
          ? tests.map(test => ({
            ...test,
            testAnswer: Array.isArray(test.testAnswer) ? test.testAnswer : []
          }))
          : [];

        setUserTests(typedTests);
      }
    } catch (error) {
      console.error('Failed to submit test:', error);
      // Use local calculation as fallback
      setScore(correctAnswers);
      setIsPassed(passed);
      setTotalQuestions(totalQuestions);
      setQuizSubmitted(true);

      // Hide header immediately before showing result alert
      setShowHeader(false);
      setShowResultAlert(true);
      setQuizStarted(false);
    }
  };

  const resetQuiz = () => {
    setShowResultAlert(false);
    setQuizSubmitted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setScore(0);
    setIsPassed(false);
    setQuizStarted(true);
  };

  const handleBackToLessons = () => {
    setShowResultAlert(false);
    // Updated: Always route to /premium-courses/${courseNumber}
    router.push(`/premium-courses/${courseNumber}`);
  };

  const handleStartNextLesson = () => {
    setShowResultAlert(false);
    handleNavigateToNextLesson();
  };

  const handleRetakeQuiz = () => {
    resetQuiz();
    setShowResultAlert(false);
  };

  const handleBackClick = () => {
    if (activeTab === 'quiz' && quizStarted && !quizSubmitted) {
      setShowExitConfirm(true);
    } else if (activeTab === 'study') {
      // Check if there's any progress to lose (completed lessons or visited lessons)
      const hasProgress = completedLessons.size > 0 || visitedLessons.size > 0;

      if (hasProgress) {
        setShowExitStudyConfirm(true);
      } else {
        router.push(`/premium-courses/${courseNumber}`);
      }
    } else {
      router.push(`/premium-courses/${courseNumber}`);
    }
  };

  const confirmExitQuiz = () => {
    setShowExitConfirm(false);
    setQuizStarted(false);
    // Use a small timeout to ensure state updates before navigation
    setTimeout(() => {
      router.push(`/premium-courses/${courseNumber}`);
    }, 10);
  };

  const cancelExitQuiz = () => {
    setShowExitConfirm(false);
    // Ensure we have a history state to prevent immediate back navigation
    window.history.pushState(null, '', window.location.href);
  };

  // Payment handler functions - Same as OnlineCourseDetailPage
  const handlePayNowFromAlert = async () => {
    // Check if user is logged in
    if (!userId) {
      setShowPurchaseAlert(false);
      router.push(`/login?redirect=/premium-courses/${courseNumber}`);
      return;
    }

    // CRITICAL FIX: Hide header FIRST using synchronous setState
    // This prevents the flicker before modal opens
    setShowHeader(false);

    // Then close purchase alert and proceed
    setShowPurchaseAlert(false);

    // Use requestAnimationFrame to ensure the header hide has painted
    requestAnimationFrame(() => {
      handlePayment();
    });
  };

  const handlePayment = async () => {
    if (!courseData || !courseData.onlineCourse[0]) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Missing Information',
        message: 'Course data is missing.',
        showConfirmButton: true,
      });
      return;
    }

    // If not logged in, redirect to login page with return URL
    if (!userId) {
      router.push(`/login?redirect=/premium-courses/${courseNumber}`);
      return;
    }

    setIsCheckingPurchase(true);

    try {
      // Check for existing purchases with PENDING status
      const existingPurchases = await ApiService.getAllCoursePurchases(
        userId,
        courseData.onlineCourse[0].id,
        'PENDING'
      );

      // If there are pending purchases, show alert
      if (existingPurchases && existingPurchases.length > 0) {
        setModalState({
          isOpen: true,
          type: 'info',
          title: 'Payment Already Initiated',
          message: 'You have already initiated payment for this course. Please wait until the payment is completed.',
          showConfirmButton: true,
        });
        return;
      }

      // Also check for SUCCESS payments (optional - if you want to prevent duplicate purchases)
      const successPurchases = await ApiService.getAllCoursePurchases(
        userId,
        courseData.onlineCourse[0].id,
        'SUCCESS'
      );

      if (successPurchases && successPurchases.length > 0) {
        setModalState({
          isOpen: true,
          type: 'info',
          title: 'Already Purchased',
          message: 'You have already purchased this course. You can access all levels now.',
          showConfirmButton: true,
        });
        return;
      }

      // If no pending or successful purchases, proceed to payment
      setShowPaymentConfirm(true);

    } catch (error) {
      console.error('Error checking existing purchases:', error);
      // If there's an error checking, proceed anyway but show warning
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Connection Error',
        message: 'Unable to verify previous purchases. Please try again.',
        showConfirmButton: true,
      });
    } finally {
      setIsCheckingPurchase(false);
    }
  };

  const confirmPayment = async () => {
    if (!courseData || !courseData.onlineCourse[0] || !userId) return;

    const course = courseData.onlineCourse[0];
    const amount = course.discountPrice < course.price ? course.discountPrice : course.price;

    setIsProcessingPayment(true);
    setShowPaymentConfirm(false);

    // Show loading modal
    setModalState({
      isOpen: true,
      type: 'loading',
      title: 'Processing Payment',
      message: 'Please wait while we process your payment...',
      showConfirmButton: false,
    });

    try {
      const paymentPayload = {
        transactionId: null,
        userId: userId,
        amount: amount,
        paymentStatus: "PENDING",
        paymentMethod: selectedPaymentMethod,
        paymentDetail: "USER_PAY_FOR_COURSE",
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
      };

      // Step 1: Create payment record (PENDING)
      const paymentData = await ApiService.createPayment(paymentPayload as Partial<Payment>);

      const paymentId = paymentData.id;

      // Step 2: Create course purchase record
      await ApiService.createCoursePurchase({
        userId: userId,
        courseId: course.id,
        amount: amount,
        purchaseDate: new Date().toISOString().split('T')[0],
        createdDate: new Date().toISOString(),
        modifiedDate: new Date().toISOString(),
        paymentId: paymentId,
      } as Partial<CoursePurchase>);

      // Show success modal
      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Payment Successful!',
        message: 'Congratulations! You now have full access to all course levels.',
        showConfirmButton: true,
      });

      // UPDATED: Auto redirect to /premium-courses/${courseNumber} after 3 seconds
      setTimeout(() => {
        router.push(`/premium-courses/${courseNumber}`);
      }, 3000);

    } catch (error) {
      console.error('Payment error:', error);

      // Show error modal
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Payment Failed',
        message: 'We encountered an issue processing your payment. Please try again or contact support.',
        showConfirmButton: true,
      });
    } finally {
      setIsProcessingPayment(false);
      setSelectedPaymentMethod('CREDIT_CARD');
    }
  };

  const cancelPayment = () => {
    setShowPaymentConfirm(false);
    setSelectedPaymentMethod('CREDIT_CARD');
    // Show purchase alert again when payment is cancelled
    setShowPurchaseAlert(true);
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  if (loading) {
    return <GlobalLoading />;
  }

  if (error || !currentModule || !courseData) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center text-text-primary gap-4">
        <h1 className="text-2xl font-bold text-red-500">{error || 'Module Not Found'}</h1>
        <Link href={`/premium-courses/${courseNumber}`} className="text-accent-teal hover:underline">
          Return to Course
        </Link>
      </div>
    );
  }

  const course = courseData.onlineCourse[0];
  const moduleIndex = course.modules?.findIndex(m => m.id === currentModule.id) ?? 0;
  const levelNumber = moduleIndex + 1;

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary pt-20">
      {/* Payment Confirmation Modal - Clean overlay without page header */}
      {showPaymentConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-bg-card border-2 border-border rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center bg-gradient-to-r from-accent-teal/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-teal/20 rounded-lg">
                  <Shield className="w-6 h-6 text-accent-teal" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-text-primary">Secure Payment</h3>
                  <p className="text-text-secondary text-sm">Complete your course purchase</p>
                </div>
              </div>
              <button
                onClick={cancelPayment}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="">
              <div className="p-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold text-text-primary mb-1">SELECT PAYMENT METHOD</h4>
                    <p className="text-text-secondary text-sm">Choose your preferred payment option</p>
                  </div>

                  {/* Payment Method Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="w-full bg-bg-secondary border-2 border-border rounded-xl py-4 px-4 text-text-primary appearance-none focus:border-accent-teal focus:ring-2 focus:ring-accent-teal/20 focus:outline-none transition-all"
                    >
                      <option value="" disabled className="bg-bg-card text-text-primary">
                        Select a payment method
                      </option>
                      {paymentMethods.map((method) => {
                        return (
                          <option
                            key={method.id}
                            value={method.id}
                            className="bg-bg-card text-text-primary py-2"
                          >
                            {method.label}
                          </option>
                        )
                      })}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-5 h-5 text-text-secondary" />
                    </div>
                  </div>

                  {/* Selected Payment Method Details */}
                  {selectedPaymentMethod && (
                    <div className="bg-accent-teal/10 rounded-xl p-4 border border-accent-teal/30">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-accent-teal/20 rounded-lg">
                          {(() => {
                            const method = paymentMethods.find(m => m.id === selectedPaymentMethod)
                            const Icon = method?.icon || CreditCard
                            return <Icon className="w-5 h-5 text-accent-teal" />
                          })()}
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary">
                            {paymentMethods.find(m => m.id === selectedPaymentMethod)?.label}
                          </div>
                          <div className="text-xs text-text-secondary">Selected payment method</div>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* Action Buttons */}
                  <div className="pt-4 flex gap-4">
                    <button
                      onClick={confirmPayment}
                      disabled={isProcessingPayment || !selectedPaymentMethod}
                      className="flex-1 py-4 rounded-xl bg-accent-teal text-white font-bold text-lg hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-accent-teal/20"
                    >
                      {isProcessingPayment ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing Payment...
                        </>
                      ) : (
                        <>Confirm Payment</>
                      )}
                    </button>

                    <button
                      onClick={cancelPayment}
                      className="flex-1 py-3 rounded-xl border border-green-500/30 hover:bg-white/5 transition text-text-secondary font-semibold"
                    >
                      Cancel
                    </button>
                  </div>

                  <p className="text-center text-xs text-text-secondary pt-2">
                    By confirming, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Modal */}
      <PaymentModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        onClose={modalState.type !== 'loading' ? closeModal : undefined}
        // UPDATED: On success confirmation, route to /premium-courses/${courseNumber}
        onConfirm={modalState.type === 'success' ? () => {
          router.push(`/premium-courses/${courseNumber}`);
        } : undefined}
        showConfirmButton={modalState.showConfirmButton}
        confirmText={modalState.type === 'success' ? 'Back to Levels' : 'Try Again'}
      />

      {/* Header - Only shown when showHeader is true and NOT in any modal state */}
      {/* Sticky Header with Navigation and Progress */}
      {showHeader && (
        <header className="sticky top-20 left-0 right-0 z-40 bg-bg-primary/95 backdrop-blur-xl border-b border-border shadow-xl">
          <div className="max-w-[1800px] mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={handleBackClick}
                className="flex items-center gap-2 text-text-secondary hover:text-accent-teal transition-all group font-bold"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="hidden md:inline">Back to Levels</span>
              </button>

              {/* Mode Toggles */}
              <div className="flex bg-bg-secondary rounded-lg p-1 border border-green-500/20">
                <button
                  onClick={() => activeTab === 'quiz' && quizStarted ? null : setActiveTab('study')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'study'
                    ? 'bg-green-500 text-black shadow-lg'
                    : 'text-text-secondary hover:text-text-primary'
                    } ${activeTab === 'quiz' && quizStarted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    }`}
                  disabled={activeTab === 'quiz' && quizStarted}
                >
                  <BookOpen className="w-4 h-4" />
                  Study Material
                </button>
                {currentTest && !isReviewMode && (
                  <button
                    onClick={() => {
                      if (allLessonsCompleted && currentTest) {
                        handleTakeQuizChallenge();
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all
      ${activeTab === 'quiz'
                        ? 'bg-accent-gold text-black shadow-lg'
                        : 'text-text-secondary hover:text-text-primary'
                      }
      ${!allLessonsCompleted || (activeTab === 'quiz' && quizStarted)
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                      }
    `}
                    disabled={!allLessonsCompleted || (activeTab === 'quiz' && quizStarted)}

                  >
                    <span className="w-4 h-4 flex items-center justify-center border border-current rounded-full text-[10px] font-black">?</span>
                    Quiz Challenge
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-accent-teal font-black">
                Level {levelNumber}
              </span>
              <h1 className="text-sm md:text-lg font-bold text-text-primary line-clamp-1">
                {currentModule.title}
              </h1>
            </div>

            <div className="flex items-center gap-6">
              {/* Theme Toggle */}
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

              <div className="hidden lg:flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-secondary">Progress:</span>
                    <span className="text-xs font-black text-accent-teal">
                      {Math.round((completedLessons.size / currentModule.lessons.length) * 100)}%
                    </span>
                  </div>
                  <div className="w-32 h-1.5 bg-bg-secondary rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-accent-teal transition-all duration-500"
                      style={{ width: `${(completedLessons.size / currentModule.lessons.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTakeQuizChallenge}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all transform hover:scale-105 flex items-center gap-2
                    ${activeTab === 'quiz'
                      ? 'bg-accent-teal text-white shadow-[0_0_20px_rgba(20,184,166,0.3)]'
                      : 'bg-bg-secondary text-text-primary hover:bg-bg-card border border-border'
                    }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Take Quiz
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content - Only shown when NOT in any modal state */}
      {!isAnyModalOpen && (
        <>
          {activeTab === 'study' ? (
            <div className="flex min-h-[calc(100vh-73px)]">
              {/* Fixed Sidebar - Lessons List */}
              <aside className="hidden lg:block w-80 bg-bg-card border-r border-border flex-shrink-0 sticky top-20 h-[calc(100vh-80px)]">
                <div className="h-full flex flex-col">
                  {/* Fixed Header */}
                  <div className="p-6 border-b border-border flex-shrink-0">
                    <h2 className="text-xl font-bold mb-2 text-text-primary">Course Lessons</h2>
                    <p className="text-sm text-text-secondary">
                      {completedLessons.size} of {currentModule.lessons?.length || 0} lessons completed
                    </p>

                    {isReviewMode && (
                      <div className="mt-2 text-sm text-accent-teal bg-accent-teal/10 px-2 py-1 rounded border border-accent-teal/20">
                        ✓ Quiz Completed
                      </div>
                    )}
                  </div>

                  {/* Scrollable Lessons Area */}
                  <div className="flex-1 overflow-y-auto p-6 pt-4 custom-scrollbar">
                    <div className="space-y-3">
                      {currentModule.lessons?.map((lesson, index) => {
                        const isCompleted = completedLessons.has(lesson.id);
                        const isVisited = visitedLessons.has(lesson.id);
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setSelectedLesson(lesson)}
                            className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${selectedLesson?.id === lesson.id
                              ? 'bg-accent-teal/20 border-2 border-accent-teal shadow-[0_0_20px_rgba(20,184,166,0.15)]'
                              : 'bg-bg-secondary border-2 border-transparent hover:border-accent-teal/30 hover:bg-bg-card'
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${isCompleted
                                ? 'bg-accent-teal text-white'
                                : selectedLesson?.id === lesson.id
                                  ? 'bg-accent-teal text-white'
                                  : isVisited
                                    ? 'bg-accent-teal/20 text-accent-teal'
                                    : 'bg-bg-secondary text-text-secondary border border-border'
                                }`}>
                                {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`font-semibold text-sm mb-1 line-clamp-2 ${selectedLesson?.id === lesson.id ? 'text-accent-teal' : 'text-text-primary'
                                  }`}>
                                  {lesson.title}
                                </h3>
                                {lesson.duration && lesson.duration !== '0:00' && (
                                  <div className="flex items-center gap-1 text-xs text-text-secondary">
                                    <Clock className="w-3 h-3" />
                                    <span>{lesson.duration}</span>
                                  </div>
                                )}
                              </div>
                              {selectedLesson?.id === lesson.id && (
                                <ChevronRight className="w-5 h-5 text-accent-teal flex-shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fixed Footer - Quiz Challenge Button */}
                  <div className="p-6 pt-4 border-t border-border flex-shrink-0">
                    {currentTest && !isReviewMode && (
                      <button
                        className={`w-full p-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 ${allLessonsCompleted
                          ? 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:border-accent-gold/40 hover:border'
                          : 'bg-bg-secondary border border-border text-text-secondary/40 cursor-not-allowed'
                          }`}
                        disabled={!allLessonsCompleted}
                      >
                        {allLessonsCompleted ? (
                          <>
                            <PlayCircle className="w-5 h-5" />
                            Attend a quiz now
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            Complete all {currentModule.lessons?.length || 0} lessons to unlock quiz
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </aside>

              {/* Main Content - Scrollable Area */}
              <main className="flex-1 overflow-y-auto">
                {selectedLesson ? (
                  <div className="p-6 md:p-8 lg:p-12 max-w-4xl mx-auto">
                    {/* Lesson Header */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 text-accent-teal text-sm font-bold mb-4">
                        <BookOpen className="w-4 h-4" />
                        <span>LESSON {currentModule.lessons?.findIndex(l => l.id === selectedLesson.id) + 1 || 1}</span>
                      </div>
                      <h1 className="text-3xl md:text-3xl font-bold mb-4 leading-tight text-text-primary">
                        {selectedLesson.title}
                      </h1>
                      {selectedLesson.duration && selectedLesson.duration !== '0:00' && (
                        <div className="flex items-center gap-2 text-text-secondary">
                          <Clock className="w-4 h-4" />
                          <span>{selectedLesson.duration}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="hidden lg:flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-text-secondary">Progress:</span>
                            <span className="text-xs font-black text-accent-teal">
                              {Math.round((completedLessons.size / currentModule.lessons.length) * 100)}%
                            </span>
                          </div>
                          <div className="w-32 h-1.5 bg-bg-secondary rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-accent-teal transition-all duration-500"
                              style={{ width: `${(completedLessons.size / currentModule.lessons.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleTakeQuizChallenge}
                          className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all transform hover:scale-105 flex items-center gap-2 bg-accent-teal text-white shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                        >
                          <BookOpen className="w-4 h-4" />
                          Take Quiz
                        </button>
                      </div>
                    </div>
                    {selectedLesson.url && selectedLesson.url !== '' && (
                      <div className="rounded-2xl overflow-hidden border border-border shadow-[0_0_30px_rgba(20,184,166,0.1)] mb-8">
                        {(() => {
                          const imageUrl = getFullImageUrl(selectedLesson.url);
                          const hasImage = imageUrl && imageUrl !== '/noimage.webp';

                          if (!hasImage) {
                            return (
                              <div className="w-full h-48 bg-bg-secondary flex items-center justify-center rounded-xl">
                                <p className="text-text-secondary text-sm">No image available</p>
                              </div>
                            );
                          }

                          const isImageFile = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(imageUrl);

                          if (isImageFile) {
                            return (
                              <div className="relative w-full aspect-[4/3] bg-bg-secondary rounded-2xl overflow-hidden">
                                <Image
                                  src={imageUrl}
                                  alt={selectedLesson.title || "Lesson image"}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                                  priority={false}
                                  loading="lazy"
                                  onLoad={() => console.log('Image loaded successfully:', imageUrl)}
                                  onError={(e) => {
                                    console.error('Failed to load image:', {
                                      url: imageUrl,
                                      lessonTitle: selectedLesson.title
                                    });

                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';

                                    const container = target.parentElement;
                                    if (container) {
                                      const fallback = document.createElement('div');
                                      fallback.className = 'absolute inset-0 flex items-center justify-center';
                                      fallback.innerHTML = `
                    <div class="text-center">
                      <p class="text-text-secondary">Failed to load image</p>
                      <p class="text-xs text-text-secondary-light mt-2">${selectedLesson.title || 'Untitled'}</p>
                    </div>
                  `;
                                      container.appendChild(fallback);
                                    }
                                  }}
                                />
                              </div>
                            );
                          } else {
                            return (
                              <div className="w-full h-48 bg-bg-secondary flex items-center justify-center rounded-xl">
                                <p className="text-text-secondary">Content available: ${selectedLesson.title || 'Untitled'}</p>
                              </div>
                            );
                          }
                        })()}
                      </div>
                    )}

                    {/* Lesson Content */}
                    <div className="mb-8 prose prose-invert max-w-none">
                      <div className="bg-bg-card border border-border rounded-2xl p-6 md:p-8">
                        <h2 className="text-2xl font-bold mb-6 text-accent-teal">Lesson Content</h2>
                        <div
                          className="text-text-primary leading-relaxed whitespace-pre-wrap"
                          style={{ fontSize: '1.1rem', lineHeight: '1.8' }}
                        >
                          {selectedLesson.description}
                        </div>
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
                      <button
                        onClick={() => {
                          const currentIndex = currentModule.lessons?.findIndex(l => l.id === selectedLesson.id) || 0;
                          if (currentIndex > 0 && currentModule.lessons) {
                            setSelectedLesson(currentModule.lessons[currentIndex - 1]);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        disabled={!currentModule.lessons || currentModule.lessons.findIndex(l => l.id === selectedLesson.id) === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-bg-secondary border-2 border-border rounded-xl font-bold hover:bg-bg-card hover:border-accent-teal transition-all disabled:opacity-50 disabled:cursor-not-allowed text-text-primary"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Previous Lesson
                      </button>

                      <button
                        onClick={() => {
                          const currentIndex = currentModule.lessons?.findIndex(l => l.id === selectedLesson.id) || 0;
                          if (currentModule.lessons && currentIndex < currentModule.lessons.length - 1) {
                            setSelectedLesson(currentModule.lessons[currentIndex + 1]);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } else if (allLessonsCompleted && currentTest && !isReviewMode) {
                            // FIX: Check if user is logged in before taking quiz
                            if (!userId) {
                              router.push(`/login?redirect=/premium-courses/${courseNumber}/${levelId}`);
                              return;
                            }
                            setActiveTab('quiz');
                            resetQuiz();
                          }
                        }}
                        disabled={!allLessonsCompleted && currentModule.lessons?.findIndex(l => l.id === selectedLesson.id) === currentModule.lessons.length - 1}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentModule.lessons?.findIndex(l => l.id === selectedLesson.id) === currentModule.lessons.length - 1
                          ? allLessonsCompleted
                            ? 'bg-accent-gold text-black hover:bg-accent-gold/90 shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                            : 'bg-bg-secondary text-text-secondary/40 cursor-not-allowed border border-border'
                          : 'bg-accent-teal text-white hover:bg-accent-teal/90 shadow-[0_0_20px_rgba(20,184,166,0.2)]'
                          }`}
                      >
                        {currentModule.lessons?.findIndex(l => l.id === selectedLesson.id) === currentModule.lessons.length - 1
                          ? allLessonsCompleted
                            ? isReviewMode ? 'Level Completed' : 'Take Quiz Challenge'
                            : 'Complete All Lessons'
                          : 'Next Lesson'
                        }
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full p-8 text-text-secondary">
                    <p className="text-lg">Select a lesson from the sidebar to begin</p>
                  </div>
                )}
              </main>
            </div>
          ) : (
            // QUIZ INTERFACE
            <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
              {/* Background Effects */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent-gold/5 blur-[150px] rounded-full" />
              </div>

              <div className="w-full max-w-4xl relative z-10">
                {currentTest && !quizSubmitted ? (
                  <>
                    {/* Progress Header */}
                    <div className="text-center mb-12">
                      <span className="inline-block px-4 py-2 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-sm font-black uppercase tracking-widest mb-4">
                        Mastery Test
                      </span>
                    </div>

                    <div className="mb-8 p-4 bg-bg-secondary rounded-xl border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-text-secondary">Progress</span>
                        <span className="text-sm font-bold text-accent-gold">
                          {currentQuestionIndex + 1}/{currentTest.questions.length} questions
                        </span>
                      </div>

                      <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-gold transition-all duration-500"
                          style={{
                            width: currentTest.questions.length
                              ? `${((currentQuestionIndex + 1) / currentTest.questions.length) * 100}%`
                              : '0%'
                          }}
                        />
                      </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-bg-card border-2 border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative">
                      <h3 className="text-lg md:text-xl font-bold mb-10 leading-relaxed text-left text-text-primary">
                        <span className="mr-2">
                          {currentQuestionIndex + 1})
                        </span>
                        {currentTest.questions[currentQuestionIndex].question}
                      </h3>

                      <div className="grid grid-cols-1 gap-4">
                        {(['option1', 'option2', 'option3', 'option4'] as const).map((optKey, idx) => {
                          const optionValue = currentTest.questions[currentQuestionIndex][optKey];
                          const isSelected = selectedAnswers[currentTest.questions[currentQuestionIndex].id] === (idx + 1);

                          return (
                            <button
                              key={idx}
                              onClick={() => handleOptionSelect(currentTest.questions[currentQuestionIndex].id, idx + 1)}
                              className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group ${isSelected
                                ? 'bg-accent-gold/10 border-2 border-accent-gold text-text-primary shadow-[0_0_20px_rgba(212,175,55,0.2)]'
                                : 'bg-bg-secondary border-2 border-transparent hover:border-accent-teal/30 hover:bg-bg-card text-text-secondary'
                                }`}
                            >
                              <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${isSelected ? 'bg-accent-gold text-black' : 'bg-bg-primary text-text-secondary group-hover:bg-bg-secondary'
                                }`}>
                                {String.fromCharCode(65 + idx)}.
                              </span>
                              <span className="font-semibold text-[17px]">{optionValue}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="mt-10 flex justify-between items-center max-w-4xl mx-auto px-4">
                      <button
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-bg-secondary border-2 border-border rounded-xl font-bold hover:bg-bg-card hover:border-accent-teal transition-all disabled:opacity-50 disabled:cursor-not-allowed text-text-primary"
                      >
                        <ArrowLeft className="w-5 h-5" />
                        Previous
                      </button>

                      {currentQuestionIndex === currentTest.questions.length - 1 ? (
                        <button
                          onClick={calculateScore}
                          disabled={!selectedAnswers[currentTest.questions[currentQuestionIndex].id]}
                          className="px-10 py-4 bg-accent-gold text-black rounded-xl font-black hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                          Submit Test
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          disabled={!selectedAnswers[currentTest.questions[currentQuestionIndex].id]}
                          className="px-10 py-4 bg-accent-teal text-white rounded-xl font-black hover:bg-accent-teal/90 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                          Next Question
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Quiz Results */}
                    <div className="bg-bg-card border-2 border-border rounded-[2.5rem] p-12 text-center max-w-2xl mx-auto shadow-2xl">
                      {(() => {
                        const correctPassed = currentTest ? score >= currentTest.passMark : false;
                        return (
                          <>
                            <div className={`w-24 h-24 ${correctPassed ? 'bg-green-500/10' : 'bg-red-500/10'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                              {correctPassed ? (
                                <CheckCircle className="w-12 h-12 text-green-500" />
                              ) : (
                                <AlertCircle className="w-12 h-12 text-red-500" />
                              )}
                            </div>
                            <h2 className="text-3xl font-bold mb-2 text-text-primary">
                              {correctPassed ? 'Congratulations!' : 'Quiz Completed'}
                            </h2>
                            <p className="text-text-secondary mb-2">
                              You scored: {score}/{totalQuestions}
                            </p>
                            <p className="text-lg mb-2 text-text-primary">
                              {((score / totalQuestions) * 100).toFixed(1)}%
                            </p>
                            <p className={`text-lg font-bold mb-8 ${correctPassed ? 'text-green-500' : 'text-red-500'}`}>
                              {correctPassed ? 'PASSED ✓' : 'FAILED ✗'}
                            </p>
                            {currentTest?.passMark && (
                              <div className="text-sm text-text-secondary mb-8 space-y-1">
                                <p>Passing Mark: {currentTest.passMark} out of {totalQuestions} correct answers needed</p>
                                <p className={`text-xs ${correctPassed ? 'text-green-400' : 'text-red-400'}`}>
                                  {score >= currentTest.passMark ?
                                    `✓ You passed with ${score - currentTest.passMark} extra correct answer(s)` :
                                    `✗ You needed ${currentTest.passMark - score} more correct answer(s) to pass`}
                                </p>
                              </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                              {correctPassed ? (
                                <>
                                  {hasNextModule ? (
                                    <button
                                      onClick={handleStartNextLesson}
                                      className="px-8 py-3 bg-accent-teal text-white rounded-xl font-bold hover:bg-accent-teal/90 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)] flex items-center justify-center gap-2"
                                    >
                                      Start Next Lesson
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => router.push(`/premium-courses/${courseNumber}?completed=true`)}
                                      className="px-8 py-3 bg-accent-teal text-white rounded-xl font-bold hover:bg-accent-teal/90 transition-all shadow-[0_0_20px_rgba(20,184,166,0.2)] flex items-center justify-center gap-2"
                                    >
                                      Course Completed!
                                    </button>
                                  )}
                                  <button
                                    onClick={handleBackToLessons}
                                    className="px-8 py-3 bg-bg-secondary border-2 border-border rounded-xl font-bold hover:border-accent-teal text-text-primary transition-all"
                                  >
                                    Back to All Lessons
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={handleRetakeQuiz}
                                    className="px-8 py-3 bg-accent-gold text-black rounded-xl font-bold hover:bg-yellow-400 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2"
                                  >
                                    Retake Quiz
                                  </button>
                                  <button
                                    onClick={handleBackToLessons}
                                    className="px-8 py-3 bg-bg-secondary border-2 border-border rounded-xl font-bold hover:border-accent-teal text-text-primary transition-all"
                                  >
                                    Back to All Lessons
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {showResultAlert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border-2 border-border rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-fade-in">
            {(() => {
              const correctPassed = currentTest ? score >= currentTest.passMark : false;
              return (
                <>
                  <div className={`w-20 h-20 ${correctPassed ? 'bg-accent-teal/10' : 'bg-red-500/10'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                    {correctPassed ? (
                      <CheckCircle className="w-10 h-10 text-accent-teal" />
                    ) : (
                      <AlertCircle className="w-10 h-10 text-red-500" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-center mb-2 text-text-primary">
                    Quiz Results
                  </h3>
                  <div className="text-center mb-6">
                    <p className="text-4xl font-black mb-2 text-text-primary">
                      {score}/{totalQuestions}
                    </p>
                    <p className="text-lg mb-2 text-text-primary">
                      {((score / totalQuestions) * 100).toFixed(1)}%
                    </p>
                    <p className={`text-lg font-bold ${correctPassed ? 'text-accent-teal' : 'text-red-500'}`}>
                      {correctPassed ? 'PASSED ✓' : 'FAILED ✗'}
                    </p>
                    {currentTest?.passMark && (
                      <div className="text-sm text-text-secondary mt-2 space-y-1">
                        <p>Passing Mark: {currentTest.passMark} out of {totalQuestions} correct answers needed</p>
                        <p className={`text-xs ${correctPassed ? 'text-accent-teal' : 'text-red-400'}`}>
                          {score >= currentTest.passMark ?
                            `✓ You passed with ${score - currentTest.passMark} extra correct answer(s)` :
                            `✗ You needed ${currentTest.passMark - score} more correct answer(s) to pass`}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {correctPassed ? (
                      <>
                        {hasNextModule ? (
                          <button
                            onClick={handleStartNextLesson}
                            className="w-full py-4 bg-accent-teal text-white rounded-xl font-bold hover:bg-accent-teal/90 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                          >
                            Start Next Lesson
                          </button>
                        ) : (
                          <button
                            onClick={() => router.push(`/premium-courses/${courseNumber}?completed=true`)}
                            className="w-full py-4 bg-accent-teal text-white rounded-xl font-bold hover:bg-accent-teal/90 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                          >
                            Course Completed!
                          </button>
                        )}
                        <button
                          onClick={handleBackToLessons}
                          className="w-full py-4 bg-bg-secondary border-2 border-border rounded-xl font-bold hover:border-accent-teal transition-all text-text-primary"
                        >
                          Back to All Lessons
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleRetakeQuiz}
                          className="w-full py-4 bg-accent-gold text-black rounded-xl font-bold hover:bg-accent-gold/90 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                        >
                          Retake Quiz
                        </button>
                        <button
                          onClick={handleBackToLessons}
                          className="w-full py-4 bg-bg-secondary border-2 border-border rounded-xl font-bold hover:border-accent-teal transition-all text-text-primary"
                        >
                          Back to All Lessons
                        </button>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border-2 border-border rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex justify-end mb-4">
              <button
                onClick={cancelExitQuiz}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-text-primary">
                Are you sure?
              </h3>
              <p className="text-text-secondary">
                Your quiz progress will be lost if you leave now. Do you want to continue?
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={cancelExitQuiz}
                className="flex-1 py-3 bg-bg-secondary border-2 border-border rounded-xl font-bold hover:border-accent-teal transition-all text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={confirmExitQuiz}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
              >
                Yes, Leave Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {showExitStudyConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border-2 border-border rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowExitStudyConfirm(false)}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-accent-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-accent-gold" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-text-primary">
                Exit Study Material?
              </h3>
              <p className="text-text-secondary mb-4">
                You have completed {completedLessons.size} of {currentModule?.lessons?.length || 0} lessons.
              </p>
              <p className="text-red-500 font-medium">
                Your progress will NOT be saved. You will need to start again when you return.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowExitStudyConfirm(false)}
                className="flex-1 py-3 bg-bg-secondary border-2 border-border rounded-xl font-bold hover:border-accent-teal transition-all text-text-primary"
              >
                Continue Learning
              </button>
              <button
                onClick={() => {
                  setShowExitStudyConfirm(false);
                  router.push(`/premium-courses/${courseNumber}`);
                }}
                className="flex-1 py-3 bg-accent-gold text-black rounded-xl font-bold hover:bg-accent-gold/90 transition-all"
              >
                Exit to Course
              </button>
            </div>
          </div>
        </div>
      )}

      {showPurchaseAlert && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-bg-card border-2 border-border rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setShowPurchaseAlert(false);
                  router.push(`/premium-courses/${courseNumber}`);
                }}
                className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2 text-accent-gold">
                Purchase Required
              </h3>
              <p className="text-text-secondary mb-4">
                The next lesson is not available for preview.
              </p>
              <p className="text-text-primary mb-2">
                You need to purchase this course to access the next level.
              </p>
              {course && (
                <div className="bg-bg-secondary rounded-lg p-4 mb-4 border border-border">
                  <p className="text-sm text-text-secondary">Course: <span className="text-text-primary font-bold">{course.title}</span></p>
                  {course.price && course.price > 0 && (
                    <p className="text-sm text-text-secondary mt-1">
                      Price: <span className="text-accent-gold font-bold">₹{course.price}</span>
                      {course.discountPrice && course.discountPrice < course.price && (
                        <span className="ml-2 text-accent-teal font-black">
                          Now: ₹{course.discountPrice}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePayNowFromAlert}
                disabled={isCheckingPurchase}
                className="w-full px-8 py-3 bg-accent-teal text-white font-black rounded-xl hover:bg-accent-teal/90 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent-teal/20"
              >
                {isCheckingPurchase ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Pay Now'
                )}
              </button>

              <button
                onClick={handleBackToLessons}
                className="w-full px-8 py-3 bg-bg-secondary border-2 border-border rounded-xl font-bold hover:border-accent-teal transition-all text-text-primary"
              >
                Back to All Lessons
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
