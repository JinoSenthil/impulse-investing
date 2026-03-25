export interface Course {
    id: string;
    image: string;
    title: string;
    duration: string;
    level: string;
    lessons: number;
    students: string;
    price: string;
    description: string;
    syllabus: string[];
}

export const courses: Course[] = [
    {
        id: 'price-action-market-profile',
        image: '/course2.png',
        title: 'Price Action & Market Profile',
        duration: '8 Weeks',
        level: 'Intermediate',
        lessons: 25,
        students: '2,500+',
        price: '₹14,999',
        description: 'Master the art of reading price movements and market structure like a pro.',
        syllabus: [
            'Price Action Patterns',
            'Market Profile Basics',
            'Value Area Analysis',
            'TPO Charts',
            'Volume Profile'
        ]
    },
    {
        id: 'elliot-wave-gann',
        image: '/course3.png',
        title: 'Elliot Wave & Gann Theory',
        duration: '10 Weeks',
        level: 'Advanced',
        lessons: 30,
        students: '1,800+',
        price: '₹19,999',
        description: 'Advanced technical analysis using time-tested wave and geometric principles.',
        syllabus: [
            'Elliot Wave Principles',
            'Wave Counting',
            'Gann Fan & Angles',
            'Time Cycles',
            'Price Projections'
        ]
    },
    {
        id: 'intraday-tricks',
        image: '/course1.png',
        title: 'Intraday Special Tricks',
        duration: '6 Weeks',
        level: 'All Levels',
        lessons: 20,
        students: '3,500+',
        price: '₹9,999',
        description: 'Secret strategies and tricks for profitable intraday trading.',
        syllabus: [
            'Gap Trading',
            'Opening Range Breakout',
            'VWAP Strategies',
            'Momentum Plays',
            'Risk Management'
        ]
    },
    {
        id: 'trading-mastery',
        image: '/course4.png',
        title: 'Scalping, Intraday, Swing & Positional Mastery',
        duration: '12 Weeks',
        level: 'Comprehensive',
        lessons: 40,
        students: '4,200+',
        price: '₹24,999',
        description: 'Complete trading mastery across all timeframes and styles.',
        syllabus: [
            'Scalping Techniques',
            'Intraday Setups',
            'Swing Trading',
            'Positional Strategies',
            'Portfolio Management'
        ]
    }
];
