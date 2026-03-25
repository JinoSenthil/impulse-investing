'use client';

import { useState, useEffect, useMemo } from 'react';
import { BarChart3, GraduationCap, TrendingUp, Lightbulb, Lock, Globe } from 'lucide-react';
import ApiService from '@/services/ApiService';
import { Feature } from '@/types';
import GlobalLoading from '../ui/GlobalLoading';

export default function Features() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const data = await ApiService.getAllFeatures();
        setFeatures(data.filter(f => f.activeStatus));
      } catch (err) {
        console.error('Failed to fetch features:', err);
        setError('Failed to load features.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  const getIcon = useMemo(() => {
    return function Icon(title: string) {
      const t = title.toLowerCase();
      if (t.includes('indicator')) return <BarChart3 className="w-12 h-12 text-accent-gold" />;
      if (t.includes('training') || t.includes('education')) return <GraduationCap className="w-12 h-12 text-accent-gold" />;
      if (t.includes('insight') || t.includes('signal')) return <TrendingUp className="w-12 h-12 text-accent-gold" />;
      if (t.includes('strategy') || t.includes('planning')) return <Lightbulb className="w-12 h-12 text-accent-gold" />;
      if (t.includes('risk') || t.includes('management')) return <Lock className="w-12 h-12 text-accent-gold" />;
      if (t.includes('community') || t.includes('global')) return <Globe className="w-12 h-12 text-accent-gold" />;
      return <TrendingUp className="w-12 h-12 text-accent-gold" />;
    };
  }, []);

  if (loading) {
    return <GlobalLoading />;
  }

  if (error) return null;

  return (
    <section id="features" className="py-20 bg-bg-primary">
      <div className="w-[90%] max-w-[1800px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-sm text-accent-gold uppercase tracking-[4px] mb-4 font-bold">Why Choose Us</div>
          <h2 className="font-cinzel text-5xl font-bold mb-6 text-text-primary">
            Everything You Need to <span className="text-accent-gold">Succeed</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-[600px] mx-auto">
            Comprehensive tools and education designed to elevate your trading performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-bg-card border-2 border-border rounded-2xl p-6 hover:border-accent-gold transition-all duration-300 group shadow-sm hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-4">{getIcon(feature.title)}</div>
              <h3 className="text-2xl font-bold mb-3 text-text-primary group-hover:text-accent-gold transition">
                {feature.title}
              </h3>
              <p className="text-text-secondary text-base line-clamp-3 min-h-[4.5rem]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
