import { Course, LoginCredentials, User, EnrollmentData, OnlineCourse, OnlineCourseDetails, NewsItem, ContactData, Indicator, UserTest, Payment, CoursePurchase, PurchaseDetailsResponse, AboutData, Feature, IndicatorPurchase, HomePageData, IntroductionData, IndicatorEnrollment, ContactUs, Review, CourseEnrollment, YouTubePublish } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.impulseinvesting.com/api';
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.12:8080/api';

class ApiService {
    private static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const headers: Record<string, string> = {
            ...options?.headers as Record<string, string>,
        };

        // Only add Content-Type: application/json if body is not FormData
        if (!(options?.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            let errorMessage = `API Error: ${response.statusText}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || JSON.stringify(errorData) || errorMessage;
            } catch {
                // Could not parse error JSON, stick to statusText
            }
            throw new Error(errorMessage);
        }

        const text = await response.text();
        if (!text) {
            return undefined as T;
        }
        try {
            return JSON.parse(text);
        } catch {
            // If it's not JSON, return the raw text (mostly for image upload URLs)
            return text as unknown as T;
        }
    }

    // Course Endpoints
    static async getAllCourses(): Promise<Course[]> {
        return this.request<Course[]>('/courses/getAll');
    }

    static async getCourseById(id: number): Promise<Course> {
        return this.request<Course>(`/courses/getOne/${id}`);
    }

    static async createCourse(data: Partial<Course>): Promise<Course> {
        return this.request<Course>('/courses/add', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async updateCourse(id: number, data: Partial<Course>): Promise<Course> {
        return this.request<Course>(`/courses/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async deleteCourse(id: number): Promise<void> {
        await this.request<void>(`/courses/delete/${id}`, {
            method: 'DELETE',
        });
    }

    // Auth Endpoints
    static async login(credentials: LoginCredentials): Promise<User> {
        return this.request<User>('/login-api/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    static async register(userData: Partial<User>): Promise<User> {
        return this.request<User>('/public/user/add', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    static async getUserById(id: number): Promise<User> {
        return this.request<User>(`/public/user/getOne/${id}`);
    }

    static async updateUser(id: number, data: Partial<User>): Promise<User> {
        return this.request<User>(`/public/user/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async deleteUser(id: number): Promise<void> {
        await this.request<void>(`/public/user/delete/${id}`, {
            method: 'DELETE',
        });
    }

    static async uploadImageOnly(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);

        return this.request<string>('/public/images/upload/imageOnly', {
            method: 'POST',
            body: formData,
        });
    }

    static async deleteImageOnlyDirect(fileUrl: string): Promise<void> {
        const encodedUrl = encodeURIComponent(fileUrl);
        await this.request<void>(`/public/images/delete/imageOnly?fileUrl=${encodedUrl}`, {
            method: 'DELETE',
        });
    }

    //course enrollment
    static async getAllCourseEnrollments(params?: {
        courseId?: number;
        createdById?: number;
        marketType?: string;
        tradingType?: string;
        segments?: string;
        experienceLevel?: string;
        interestedProduct?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<CourseEnrollment[]> {
        const query = new URLSearchParams();

        if (params?.courseId !== undefined) query.append('courseId', String(params.courseId));
        if (params?.createdById !== undefined) query.append('createdById', String(params.createdById));
        if (params?.marketType) query.append('marketType', params.marketType);
        if (params?.tradingType) query.append('tradingType', params.tradingType);
        if (params?.segments) query.append('segments', params.segments);
        if (params?.experienceLevel) query.append('experienceLevel', params.experienceLevel);
        if (params?.interestedProduct) query.append('interestedProduct', params.interestedProduct);
        if (params?.startDate) query.append('startDate', params.startDate);
        if (params?.endDate) query.append('endDate', params.endDate);

        const url = query.toString()
            ? `/courseEnrollment/getAll?${query.toString()}`
            : `/courseEnrollment/getAll`;

        return this.request<CourseEnrollment[]>(url);
    }

    static async addEnrollment(data: EnrollmentData): Promise<EnrollmentData> {
        return this.request<EnrollmentData>('/courseEnrollment/add', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Online Courses Endpoints
    static async getAllOnlineCourses(
        userId?: number,
        isPurchased?: boolean,
        activeStatus?: boolean
    ): Promise<OnlineCourse[]> {
        let url = `/onlineCourses/getOnlineCourseOnly`;
        const params: string[] = [];

        if (userId !== undefined) {
            params.push(`userId=${userId}`);
        }

        if (isPurchased !== undefined) {
            params.push(`isPurchased=${isPurchased}`);
        }

        if (activeStatus !== undefined) {
            params.push(`activeStatus=${activeStatus}`);
        }

        if (params.length) {
            url += `?${params.join('&')}`;
        }

        return this.request<OnlineCourse[]>(url);
    }

    static async getOnlineCourseDetails(courseNumber: string): Promise<OnlineCourseDetails> {
        return this.request<OnlineCourseDetails>(`/onlineCourses/getAllDetails?courseNumber=${courseNumber}`);
    }

    //Indicators
    static async getAllIndicators(): Promise<Indicator[]> {
        return this.request<Indicator[]>(
            `/indicators/getAll?activeStatus=true`
        );
    }

    static async getIndicatorById(id: number): Promise<Indicator> {
        return this.request<Indicator>(`/indicators/getOne/${id}`);
    }

    static async createIndicator(data: Partial<Indicator>): Promise<Indicator> {
        return this.request<Indicator>('/indicators/add', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async updateIndicator(id: number, data: Partial<Indicator>): Promise<Indicator> {
        return this.request<Indicator>(`/indicators/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async deleteIndicator(id: number): Promise<void> {
        await this.request<void>(`/indicators/delete/${id}`, {
            method: 'DELETE',
        });
    }

    //News Controller
    static async getAllNews(params?: {
        createdById?: number;
        newsCategoryId?: number;
        newsStatus?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<NewsItem[]> {
        const query = new URLSearchParams();

        if (params?.createdById !== undefined) query.append('createdById', String(params.createdById));
        if (params?.newsCategoryId !== undefined) query.append('newsCategoryId', String(params.newsCategoryId));
        if (params?.newsStatus !== undefined) query.append('newsStatus', String(params.newsStatus));
        if (params?.startDate !== undefined) query.append('startDate', String(params.startDate));
        if (params?.endDate !== undefined) query.append('endDate', String(params.endDate));

        const url = query.toString()
            ? `/news/getAll?${query.toString()}`
            : `/news/getAll`;

        return this.request<NewsItem[]>(url);
    }

    static async getNewsById(id: number): Promise<NewsItem> {
        return this.request<NewsItem>(`/news/getOne/${id}`);
    }

    static async createNews(data: Partial<NewsItem>): Promise<NewsItem> {
        return this.request<NewsItem>('/news/add', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async updateNews(id: number, data: Partial<NewsItem>): Promise<NewsItem> {
        return this.request<NewsItem>(`/news/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async deleteNews(id: number): Promise<void> {
        await this.request<void>(`/news/delete/${id}`, {
            method: 'DELETE',
        });
    }

    //Contact controller
    static async getAllContacts(): Promise<ContactData[]> {
        return this.request<ContactData[]>('/contact/getAll');
    }

    static async getContactById(id: number): Promise<ContactData> {
        return this.request<ContactData>(`/contact/getOne/${id}`);
    }

    static async createContact(data: Partial<ContactData>): Promise<ContactData> {
        return this.request<ContactData>('/contact/add', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async updateContact(id: number, data: Partial<ContactData>): Promise<ContactData> {
        return this.request<ContactData>(`/contact/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async deleteContact(id: number): Promise<void> {
        await this.request<void>(`/contact/delete/${id}`, {
            method: 'DELETE',
        });
    }

    //Test controller
    static async getAllUserTests(params?: {
        userId?: number;
        moduleId?: number;
        isPassed?: boolean;
    }): Promise<UserTest[]> {
        const query = new URLSearchParams();

        if (params?.userId !== undefined) query.append('userId', String(params.userId));
        if (params?.moduleId !== undefined) query.append('moduleId', String(params.moduleId));
        if (params?.isPassed !== undefined) query.append('isPassed', String(params.isPassed));

        const url = query.toString()
            ? `/userTest/getAll?${query.toString()}`
            : `/userTest/getAll`;

        return this.request<UserTest[]>(url);
    }

    static async getUserTestById(id: number): Promise<UserTest> {
        return this.request<UserTest>(`/userTest/getOne/${id}`);
    }

    static async createUserTest(data: Partial<UserTest>): Promise<UserTest> {
        return this.request<UserTest>('/userTest/add', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async updateUserTest(id: number, data: Partial<UserTest>): Promise<UserTest> {
        return this.request<UserTest>(`/userTest/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async deleteUserTest(id: number): Promise<void> {
        await this.request<void>(`/userTest/delete/${id}`, {
            method: 'DELETE',
        });
    }

    //course purchase
    static async getAllCoursePurchases(
        userId?: number,
        courseId?: number,
        paymentStatus?: 'PENDING' | 'SUCCESS' | 'FAILED'
    ): Promise<CoursePurchase[]> {
        let url = `/coursePurchase/getAllPurchases`;
        const params: string[] = [];

        if (userId !== undefined) {
            params.push(`userId=${userId}`);
        }

        if (courseId !== undefined) {
            params.push(`courseId=${courseId}`);
        }

        if (paymentStatus !== undefined) {
            params.push(`paymentStatus=${paymentStatus}`);
        }

        if (params.length) {
            url += `?${params.join('&')}`;
        }

        return this.request<CoursePurchase[]>(url);
    }

    static async getAllPurchases(): Promise<CoursePurchase[]> {
        return this.request<CoursePurchase[]>('/coursePurchase/getAllPurchases');
    }

    static async getCoursePurchaseById(id: number): Promise<CoursePurchase> {
        return this.request<CoursePurchase>(`/coursePurchase/getOne/${id}`);
    }

    static async getPurchaseDetails(
        courseNumber: string,
        userId?: number
    ): Promise<PurchaseDetailsResponse> {
        const params = new URLSearchParams();
        params.append('courseNumber', courseNumber);

        if (userId) {
            params.append('userId', userId.toString());
        }

        return this.request<PurchaseDetailsResponse>(
            `/coursePurchase/purchaseDetails?${params.toString()}`
        );
    }

    static async createCoursePurchase(data: Partial<CoursePurchase>): Promise<CoursePurchase> {
        return this.request<CoursePurchase>('/coursePurchase/add', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async updateCoursePurchase(id: number, data: Partial<CoursePurchase>): Promise<CoursePurchase> {
        return this.request<CoursePurchase>(`/coursePurchase/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async deleteCoursePurchase(id: number): Promise<void> {
        await this.request<void>(`/coursePurchase/delete/${id}`, {
            method: 'DELETE',
        });
    }

    //payment
    static async getAllPayments(userId: string): Promise<Payment[]> {
        return this.request<Payment[]>(`/payment/getAll?userId=${userId}`)
    }

    static async getPaymentById(id: number): Promise<Payment> {
        return this.request<Payment>(`/payment/getOne/${id}`);
    }

    static async createPayment(data: Partial<Payment>): Promise<Payment> {
        return this.request<Payment>('/payment/add', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async updatePayment(id: number, data: Partial<Payment>): Promise<Payment> {
        return this.request<Payment>(`/payment/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async deletePayment(id: number): Promise<void> {
        await this.request<void>(`/payment/delete/${id}`, {
            method: 'DELETE',
        });
    }

    //About and Features
    static async getAllAbout(): Promise<AboutData[]> {
        return this.request<AboutData[]>('/about/getAll');
    }

    static async getAllFeatures(): Promise<Feature[]> {
        return this.request<Feature[]>('/features/getAll');
    }

    // Home Page and Introduction
    static async getHomePageData(): Promise<HomePageData[]> {
        return this.request<HomePageData[]>('/homePage/getAll');
    }

    static async getIntroductionData(): Promise<IntroductionData[]> {
        return this.request<IntroductionData[]>('/introduction/getAll');
    }

    //Indicator Purchase controller
    static async getAllIndicatorPurchases(
        userId?: number,
        paymentStatus?: 'PENDING' | 'SUCCESS' | 'FAILED'
    ): Promise<IndicatorPurchase[]> {
        const params = new URLSearchParams()

        if (userId !== undefined) {
            params.append('userId', userId.toString())
        }

        if (paymentStatus !== undefined) {
            params.append('paymentStatus', paymentStatus)
        }

        const qs = params.toString()

        return this.request<IndicatorPurchase[]>(
            qs
                ? `/indicatorPurchase/getAll?${qs}`
                : `/indicatorPurchase/getAll`
        )
    }

    static async getIndicatorPurchaseById(id: number): Promise<IndicatorPurchase> {
        return this.request<IndicatorPurchase>(`/indicatorPurchase/getOne/${id}`)
    }

    static async createIndicatorPurchase(
        data: Partial<IndicatorPurchase>
    ): Promise<IndicatorPurchase> {
        return this.request<IndicatorPurchase>('/indicatorPurchase/add', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    static async updateIndicatorPurchase(
        id: number,
        data: Partial<IndicatorPurchase>
    ): Promise<IndicatorPurchase> {
        return this.request<IndicatorPurchase>(`/indicatorPurchase/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    static async deleteIndicatorPurchase(id: number): Promise<void> {
        await this.request<void>(`/indicatorPurchase/delete/${id}`, {
            method: 'DELETE',
        })
    }

    //user test question controller
    static async getAllTestQuestions(): Promise<UserTest[]> {
        return this.request<UserTest[]>('/testQuestions/getAll')
    }

    static async getTestQuestionById(id: number): Promise<UserTest> {
        return this.request<UserTest>(`/testQuestions/getOne/${id}`)
    }

    static async createTestQuestion(data: Partial<UserTest>): Promise<UserTest> {
        return this.request<UserTest>('/testQuestions/add', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    static async updateTestQuestion(id: number, data: Partial<UserTest>): Promise<UserTest> {
        return this.request<UserTest>(`/testQuestions/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    static async deleteTestQuestion(id: number): Promise<void> {
        await this.request<void>(`/testQuestions/delete/${id}`, {
            method: 'DELETE',
        })
    }

    //indicator enroll form
    static async getAllIndicatorEnrollments(params?: {
        userId?: number;
        indicatorId?: number;
        enrollment?: string;
    }): Promise<IndicatorEnrollment[]> {
        const query = new URLSearchParams();

        if (params?.userId !== undefined) query.append('userId', String(params.userId));
        if (params?.indicatorId !== undefined) query.append('indicatorId', String(params.indicatorId));
        if (params?.enrollment !== undefined) query.append('enrollment', params.enrollment);

        const url = query.toString()
            ? `/indicatorEnrollment/getAll?${query.toString()}`
            : `/indicatorEnrollment/getAll`;

        return this.request<IndicatorEnrollment[]>(url);
    }

    static async getIndicatorEnrollmentById(id: number): Promise<IndicatorEnrollment> {
        return this.request<IndicatorEnrollment>(`/indicatorEnrollment/getOne/${id}`)
    }

    static async createIndicatorEnrollment(
        data: Partial<IndicatorEnrollment>
    ): Promise<IndicatorEnrollment> {
        return this.request<IndicatorEnrollment>('/indicatorEnrollment/add', {
            method: 'POST',
            body: JSON.stringify(data),
        })
    }

    static async updateIndicatorEnrollment(
        id: number,
        data: Partial<IndicatorEnrollment>
    ): Promise<IndicatorEnrollment> {
        return this.request<IndicatorEnrollment>(`/indicatorEnrollment/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        })
    }

    static async deleteIndicatorEnrollment(id: number): Promise<void> {
        await this.request<void>(`/indicatorEnrollment/delete/${id}`, {
            method: 'DELETE',
        })
    }

    //Contact us controller
    static async getAllContactUs(): Promise<ContactUs[]> {
        return this.request<ContactUs[]>('/public/contactUs/getAll');
    }

    static async getContactUsById(id: number): Promise<ContactUs> {
        return this.request<ContactUs>(`/public/contactUs/getOne/${id}`);
    }

    static async createContactUs(
        data: Partial<ContactUs>
    ): Promise<ContactUs> {
        return this.request<ContactUs>('/public/contactUs/add', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async updateContactUs(
        id: number,
        data: Partial<ContactUs>
    ): Promise<ContactUs> {
        return this.request<ContactUs>(`/public/contactUs/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    static async deleteContactUs(id: number): Promise<void> {
        await this.request<void>(`/public/contactUs/delete/${id}`, {
            method: 'DELETE',
        });
    }

    // Dashboard Endpoints
    static async getDashboardPurchaseCount(userId: number): Promise<Record<string, number>> {
        return this.request<Record<string, number>>(`/dashboard/purchase/count?userId=${userId}`);
    }

    static async getTotalCounts(): Promise<Record<string, number>> {
        return this.request<Record<string, number>>('/dashboard/total/counts');
    }

    static async getDashboardPurchaseList(userId: number): Promise<any[]> {
        return this.request<any[]>(`/dashboard/purchase/list?userId=${userId}`);
    }

    // Review Endpoints
    static async getAllReviews(userId?: number): Promise<Review[]> {
        const url = userId ? `/reviews/getAll?userId=${userId}` : '/reviews/getAll';
        return this.request<Review[]>(url);
    }

    static async getReviewById(id: number): Promise<Review> {
        return this.request<Review>(`/reviews/getOne/${id}`);
    }

    static async addReview(data: Partial<Review>): Promise<Review> {
        return this.request<Review>('/reviews/add', {
            method: 'POST',
            body: JSON.stringify({
                id: 0,
                reviewStatus: 'PENDING',
                activeStatus: true,
                createdDate: new Date().toISOString(),
                modifiedDate: new Date().toISOString(),
                ...data
            }),
        });
    }

    static async updateReview(id: number, data: Partial<Review>): Promise<Review> {
        return this.request<Review>(`/reviews/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                ...data,
                modifiedDate: new Date().toISOString(),
            }),
        });
    }

    static async deleteReview(id: number): Promise<void> {
        await this.request<void>(`/reviews/delete/${id}`, {
            method: 'DELETE',
        });
    }

    // YouTube Publish Endpoints
    static async getAllYouTubeVideos(): Promise<YouTubePublish[]> {
        return this.request<YouTubePublish[]>('/youtubePublish/getAll');
    }
}

export default ApiService;

// Helper to safely extract array payloads from API responses
export function parseArrayResponse<T>(raw: unknown): T[] {
    if (Array.isArray(raw)) return raw as T[]
    if (raw && typeof raw === 'object' && 'data' in raw) {
        const maybe = (raw as { data?: unknown }).data
        if (Array.isArray(maybe)) return maybe as T[]
    }
    return []
}
