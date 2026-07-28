import ApiService from '@/services/ApiService'
import { withApiCache } from './apiCache'
import { NewsItem } from '@/types'

const NEWS_TTL = 3 * 60 * 1000

export const getCachedLatestNews = (limit = 3) =>
  withApiCache(`news:latest:${limit}`, () => ApiService.getLatestNews(limit), NEWS_TTL)

export const getCachedAllNews = (params?: Parameters<typeof ApiService.getAllNews>[0]) => {
  const key = params ? `news:all:${JSON.stringify(params)}` : 'news:all'
  return withApiCache(key, () => ApiService.getAllNews(params), NEWS_TTL)
}

export const getCachedCourses = () =>
  withApiCache('courses:all', () => ApiService.getAllCourses())

export const getCachedIndicators = () =>
  withApiCache('indicators:all', () => ApiService.getAllIndicators())

export const getCachedHomePageData = () =>
  withApiCache('homePage:all', () => ApiService.getHomePageData())

export const getCachedIntroductionData = () =>
  withApiCache('introduction:all', () => ApiService.getIntroductionData())

export const getCachedFeatures = () =>
  withApiCache('features:all', () => ApiService.getAllFeatures())

export const getCachedReviews = () =>
  withApiCache('reviews:all', () => ApiService.getAllReviews())

export const getCachedAbout = () =>
  withApiCache('about:all', () => ApiService.getAllAbout())

export const getCachedTotalCounts = () =>
  withApiCache('dashboard:counts', () => ApiService.getTotalCounts(), 2 * 60 * 1000)

export const getCachedYouTubeVideos = () =>
  withApiCache('youtube:all', () => ApiService.getAllYouTubeVideos())

export const getCachedContactUs = () =>
  withApiCache('contactUs:all', () => ApiService.getAllContactUs())

export function filterPublishedNews(items: NewsItem[]) {
  return items.filter((item) => item.activeStatus && item.newsStatus === 'PUBLISHED')
}
