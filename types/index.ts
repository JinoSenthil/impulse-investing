export interface Course {
    id: number;
    courseNumber: string;
    title: string;
    shortDescription: string;
    description: string;
    categoryId: number;
    languageId: number;
    createdById: number;
    price: number;
    discountPrice: number;
    isPaid: boolean;
    isPublished: boolean;
    isFeatured: boolean;
    sortOrder: number;
    duration: string;
    publishedAt: string;
    createdDate: string;
    modifiedDate: string;
    activeStatus: boolean;
    thumbnailImgUrl: string | null;
    coverImage: string | null;
    introVideoUrl: string | null;
    syllabus?: string[];
    features?: string[];
    fullDescription?: string;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHERS';

export interface User {
    id: number;
    roleId: number;
    email: string | null;
    passwordHash?: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    profileImage: string | null;
    dateOfBirth: string;
    gender: Gender;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isPremium: boolean;
    activeStatus: boolean;
    lastLoginAt: string;
    createdDate: string;
    modifiedDate: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

export interface LoginCredentials {
    phoneOrEmail: string;
    password: string;
}

export type MarketType = 'INDIAN_MARKET' | 'GLOBAL_MARKET';
export type TradingType = 'INTRADAY' | 'SWING' | 'SCALPING' | 'INVESTING';
export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export type InterestedProduct = 'PREMIUM_INDICATORS' | 'TRADING_COURSES' | 'MENTORSHIP' | 'ALL';

export interface EnrollmentData {
    id?: number;
    courseId?: number;
    createdById?: number;
    fullName: string;
    mobileNumber: string;
    marketType: MarketType;
    tradingType: TradingType;
    segments: string;
    experienceLevel: ExperienceLevel;
    interestedProduct: InterestedProduct;
    activeStatus: boolean;
    createdDate?: string;
    modifiedDate?: string;
}

export interface CourseEnrollment extends EnrollmentData {
    id: number;
    courseId: number;
    createdById: number;
    createdDate: string;
    modifiedDate: string;
    // Potentially joined fields from backend
    title?: string;
    thumbnailImgUrl?: string;
}


export type Enrollment = 'INDICATOR' | 'BOOK_FOR_DEMO'

export interface IndicatorEnrollment {
    id: number
    indicatorId: number | null
    title: string
    description: string
    imageUrl: string
    price: number
    createdById: number
    fullName: string
    mobileNumber: string
    location: string
    message: string
    enrollment: Enrollment
    createdDate: string
    modifiedDate: string
    activeStatus: boolean
}


export interface Indicator {
    id: number;
    createdById: number;
    title: string;
    description: string;
    imageUrl: string;
    price: number;
    activeStatus: boolean;
    isPurchased?: boolean
}

export interface OnlineCourse {
    id: number;
    courseNumber: string;
    title: string;
    shortDescription: string;
    courseKey: string;
    categoryId: number | null;
    languageId: number | null;
    price: number;
    discountPrice: number;
    isPaid: boolean;
    paymentStatus: string | null;
    isPublished: boolean;
    isPurchased: boolean;
    isFeatured: boolean;
    duration: string;
    thumbnailImgUrl: string | null;
    coverImage: string | null;
    videoUrl: string | null;
    modules?: CourseModule[];
    activeStatus: boolean;
    averageRating?: number;
    totalReviews?: number;
}

export interface CourseModule {
    id: number;
    courseId: number;
    title: string;
    duration: string;
    isPreview: boolean;
    isAccess: boolean;
    isTestCompleted: boolean;
    sortOrder: number;
    lessons: CourseLesson[];
}

export interface CourseLesson {
    id: number;
    courseId: number;
    moduleId: number;
    title: string;
    description: string;
    duration: string;
    url: string;
    sortOrder: number;
}

export interface CourseTest {
    id: number;
    courseId: number;
    moduleId: number;
    title: string;
    shortDescription: string;
    instructions: string;
    totalMark: number;
    passMark: number;
    questions: TestQuestion[];
}

export interface TestQuestion {
    id: number;
    testId: number;
    question: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    correctOption?: string;
}

export interface OnlineCourseDetails {
    onlineCourse: OnlineCourse[];
    test: CourseTest[];
}



export interface NewsItem {
    id: number;
    createdById: number;
    newsCategoryId: number;
    newsCategoryName: string;
    title: string;
    shortDescription: string;
    description: string;
    newsStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    imageUrl: string;
    activeStatus: boolean;
    createdDate: string;
}


export interface ContactData {
    id?: number;
    name: string;
    email: string;
    mobileNumber: string;
    subject: string;
    message: string;
    createdDate?: string;
    modifiedDate?: string;
}


export interface UserTestAnswer {
    id: number;
    questionId: number;
    selectedOption: string;
    isCorrect: boolean;
}

export interface UserTest {
    id: number;
    userId: number;
    testId: number;
    moduleId: number;
    attemptNumber: number;
    score: number;
    isPassed: boolean;
    attemptDate: string;
    testAnswer: UserTestAnswer[];
}


export interface Payment {
    id: number;
    transactionId: string | null;
    userId: number | null;
    amount: number | null;
    paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | string;
    paymentMethod: string | null;
    paymentDetail: string | null;
    createdDate: string;
    modifiedDate: string;
}

export interface CoursePurchase {
    id: number;
    userId: number;
    courseId: number;
    amount: number;
    purchaseDate: string;
    createdDate: string;
    modifiedDate: string;
    paymentId: number;
}

export interface PurchaseDetailsResponse {
    isPurchased: boolean;
    onlineCourse: OnlineCourse[];
    test: CourseTest[];
}

export interface HomePageData {
    id: number;
    title: string;
    point1: string;
    point2: string;
    point3: string;
    shortDescription: string;
    activeStatus: boolean;
    createdDate: string;
    modifiedDate: string;
}

export interface AboutData {
    id: number;
    title: string;
    description: string;
    ourMision: string;
    ourVision: string;
    ourValues: string;
    activeStatus: boolean;
    createdDate: string;
    modifiedDate: string;
}

export interface IntroductionData {
    id: number;
    title: string;
    subTitle: string;
    shortDescription: string;
    point1: string;
    point2: string;
    point3: string;
    point4: string;
    button: string;
    imageUrl: string;
    activeStatus: boolean;
    createdDate: string;
    modifiedDate: string;
}

export interface Feature {
    id: number;
    title: string;
    description: string;
    imageUrl: string | null;
    activeStatus: boolean;
    createdDate: string;
    modifiedDate: string;
}

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED'

export interface IndicatorPurchase {
    id: number
    userId: number
    indicatorId: number

    title: string
    description: string
    imageUrl: string

    amount: number
    purchaseDate: string

    createdDate: string
    modifiedDate: string

    paymentId: number
    paymentStatus: PaymentStatus
}
export type CorrectOption = 'OPTION1' | 'OPTION2' | 'OPTION3' | 'OPTION4';

export interface ApiQuestion {
    id: number;
    question: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    correctOption?: CorrectOption | null;
    activeStatus: boolean;
    test: string;
}

export interface ApiTest {
    id: number;
    moduleId: number;
    questions: ApiQuestion[];
}

export interface ApiUserAnswer {
    questionId: number;
    selectedOption: CorrectOption;
    isCorrect: boolean;
}

export interface ApiUserTest {
    id: number;
    moduleId: number;
    testAnswer?: ApiUserAnswer[];
}


// types.ts (or wherever you keep your types)
export interface ContactUs {
    id: number;
    title: string;
    shortDescription: string;
    contact: string[];
    createdDate: string;
    modifiedDate: string;
}

export interface Review {
    id: number;
    userId: number;
    userName?: string;
    profileImage?: string | null;
    rating?: number;
    review?: string;
    ratings?: number; // Used in POST/PUT
    reviews?: string; // Used in POST/PUT
    reviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | string | null;
    courseId?: number | null;
    onlineCourseId?: number | null;
    indicatorId?: number | null;
    createdDate: string;
    modifiedDate: string;
    activeStatus?: boolean;
}

export interface YouTubePublish {
    id: number;
    createdById: number;
    videoType: 'VIDEO' | 'SHORTS';
    videoUrl: string;
    createdDate: string;
    modifiedDate: string;
}