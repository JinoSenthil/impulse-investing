export type IconName = 'book' | 'bolt' | 'crosshairs' | 'water'

export interface CourseData {
    id: string
    title: string
    level: string
    description: string
    duration: string
    students: string
    iconName: IconName
    syllabus: string[]
    youtubeId: string
    fullDescription?: string
    features?: string[]
}

export const courseData: CourseData[] = [
    {
        id: 'price-action-market-profile',
        title: 'Price Action & Market Profile',
        level: 'Intermediate',
        description: 'Master the art of reading price movements and market structure like a pro',
        duration: '8 Weeks',
        students: '2,500+',
        iconName: 'book',
        syllabus: [
            'Price Action Patterns',
            'Market Profile Basics',
            'Value Area Analysis',
            'TPO Charts',
            'Volume Profile'
        ],
        youtubeId: 'bpravMgflLc',
        fullDescription: 'Dive deep into the world of price action trading and market profile analysis. This comprehensive course will teach you how to read market structure, identify key support and resistance levels, and understand institutional order flow. You\'ll learn to trade like the professionals using pure price action without relying on lagging indicators.',
        features: [
            'Live trading sessions',
            'Real-time market analysis',
            'Lifetime access to course materials',
            'Certificate of completion',
            'Private community access'
        ]
    },
    {
        id: 'elliot-wave-gann-theory',
        title: 'Elliot Wave & Gann Theory',
        level: 'Advanced',
        description: 'Advanced technical analysis using time-tested wave and geometric principles',
        duration: '10 Weeks',
        students: '1,800+',
        iconName: 'water',
        syllabus: [
            'Elliot Wave Principles',
            'Wave Counting',
            'Gann Fan & Angles',
            'Time Cycles',
            'Price Projections'
        ],
        youtubeId: 'tMjgiULV_5k',
        fullDescription: 'Master the advanced techniques of Elliot Wave Theory and Gann Analysis. Learn to predict market movements using wave patterns, Fibonacci relationships, and geometric price projections. This course is designed for serious traders who want to understand the deeper mathematical and cyclical nature of markets.',
        features: [
            'Advanced wave counting techniques',
            'Gann square of 9 mastery',
            'Time and price cycle analysis',
            'Professional charting tools',
            'Weekly live Q&A sessions'
        ]
    },
    {
        id: 'intraday-special-tricks',
        title: 'Intraday Special Tricks',
        level: 'All Levels',
        description: 'Secret strategies and tricks for profitable intraday trading',
        duration: '6 Weeks',
        students: '3,500+',
        iconName: 'bolt',
        syllabus: [
            'Gap Trading',
            'Opening Range Breakout',
            'VWAP Strategies',
            'Momentum Plays',
            'Risk Management'
        ],
        youtubeId: 'k22dBXDk980',
        fullDescription: 'Unlock the secrets of successful intraday trading with proven strategies that work in any market condition. Learn high-probability setups, proper entry and exit timing, and advanced risk management techniques. This course focuses on practical, actionable strategies you can implement immediately.',
        features: [
            'Daily trading setups',
            'Real-time trade alerts',
            'Scanner settings and tools',
            'Risk management templates',
            'Trade journal templates'
        ]
    },
    {
        id: 'mastery-comprehensive',
        title: 'Scalping, Intraday, Swing & Positional Mastery',
        level: 'Comprehensive',
        description: 'Complete trading mastery across all timeframes and styles',
        duration: '12 Weeks',
        students: '4,200+',
        iconName: 'crosshairs',
        syllabus: [
            'Scalping Techniques',
            'Intraday Setups',
            'Swing Trading',
            'Positional Strategies',
            'Portfolio Management'
        ],
        youtubeId: 'fEQadvrrXl4',
        fullDescription: 'The ultimate comprehensive trading program covering all timeframes and trading styles. From lightning-fast scalping to long-term positional trading, this course provides a complete education in professional trading. Learn to adapt your strategy to any market condition and timeframe.',
        features: [
            'Multi-timeframe analysis',
            'Complete trading system',
            'Portfolio diversification strategies',
            'Advanced money management',
            'Mentorship program included'
        ]
    }
]

export function getCourseById(id: string): CourseData | undefined {
    return courseData.find(course => course.id === id)
}
