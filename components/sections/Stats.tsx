'use client';

import { useState, useEffect, useRef } from 'react';
import ApiService from '@/services/ApiService';
import { BarChart3, Users, BookOpen } from 'lucide-react';

interface CountStat {
    label: string;
    value: number;
    icon: React.ReactNode;
    key: string;
}

const Counter = ({ target, duration = 2000 }: { target: number; duration?: number }) => {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        let animationFrame: number;
        startTimeRef.current = null; // Reset start time on target change

        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp;
            const progress = timestamp - startTimeRef.current;
            const percentage = Math.min(progress / duration, 1);

            // Easing function: outExpo
            const easedProgress = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);

            const currentCount = Math.floor(easedProgress * target);
            if (currentCount !== countRef.current) {
                countRef.current = currentCount;
                setCount(currentCount);
            }

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [target, duration]);

    return <span>{count}</span>;
};

export default function Stats() {
    const [counts, setCounts] = useState<Record<string, number>>({
        totalIndicators: 0,
        totalStudents: 0,
        totalCourses: 0,
    });
    const [loading, setLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const data = await ApiService.getTotalCounts();
                setCounts(data);
            } catch (err) {
                console.error('Failed to fetch total counts:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCounts();
    }, []);

    useEffect(() => {
        if (loading) return; // Wait until content is rendered

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, [loading]); // Re-run when loading changes to capture the ref

    const stats: CountStat[] = [
        {
            label: 'Professional Indicators',
            value: counts.totalIndicators,
            icon: <BarChart3 className="w-8 h-8 md:w-10 md:h-10 text-accent-gold" />,
            key: 'indicators',
        },
        {
            label: 'Successfull Students',
            value: counts.totalStudents,
            icon: <Users className="w-8 h-8 md:w-10 md:h-10 text-accent-gold" />,
            key: 'students',
        },
        {
            label: 'Expert Courses',
            value: counts.totalCourses,
            icon: <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-accent-gold" />,
            key: 'courses',
        },
    ];

    if (loading) return null;

    return (
        <section ref={sectionRef} className="py-20 bg-bg-primary border-y border-border/50 scroll-mt-20">
            <div className="w-[90%] max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                    {stats.map((stat) => (
                        <div key={stat.key} className="flex flex-col items-center text-center group">
                            <div className="mb-6 p-4 bg-bg-card border border-border rounded-2xl transform group-hover:scale-110 group-hover:border-accent-gold transition-all duration-300 shadow-lg shadow-accent-gold/5">
                                {stat.icon}
                            </div>
                            <div className="font-cinzel text-5xl md:text-7xl font-bold text-text-primary mb-3 tracking-wider">
                                {isVisible ? <Counter target={stat.value} /> : '0'}
                                {stat.key === 'students' && <span className="text-accent-gold ml-1">+</span>}
                            </div>
                            <div className="text-accent-gold text-sm md:text-base font-black uppercase tracking-[0.3em] opacity-80">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
