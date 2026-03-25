'use client';

import { useState, useEffect } from 'react';
import ApiService from '@/services/ApiService';
import { AboutData } from '@/types';
import GlobalLoading from '../ui/GlobalLoading';

export default function About() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const data = await ApiService.getAllAbout();
        // Use the first active about entry
        const activeAbout = data.find(item => item.activeStatus);
        if (activeAbout) {
          setAboutData(activeAbout);
        }
      } catch (err) {
        console.error('Failed to fetch about data:', err);
        setError('Failed to load about information.');
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return <GlobalLoading />;
  }

  // If no data is found, we can either hide the section or show nothing
  if (!aboutData && !error) return null;

  return (
    <section id="about" className="py-20 px-6 bg-bg-primary">
      <div className="w-[90%] max-w-[1800px] mx-auto">
        <div className="text-center mb-10 lg:mb-16">
          <div className="text-sm text-accent-gold uppercase tracking-[4px] mb-4 font-bold">Our Story</div>
          <h2 className="font-cinzel text-3xl md:text-5xl font-bold mb-4 md:mb-6 text-text-primary">
            About <span className="text-accent-gold">IMPULSE</span>
          </h2>
          <p className="text-text-secondary text-base md:text-xl max-w-[800px] mx-auto">
            Empowering traders worldwide with cutting-edge tools and education
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-2xl md:text-4xl font-bold text-text-primary">{aboutData?.title}</h3>
            <div
              className="text-text-secondary text-base md:text-lg leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: aboutData?.description || '' }}
            />
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="bg-bg-card border-2 border-border rounded-2xl p-5 md:p-6 hover:border-accent-gold transition shadow-sm">
              <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-text-primary">Our Mission</h4>
              <p
                className="text-text-secondary text-base md:text-lg"
                dangerouslySetInnerHTML={{ __html: aboutData?.ourMision || '' }}
              />
            </div>

            <div className="bg-bg-card border-2 border-border rounded-2xl p-5 md:p-6 hover:border-accent-gold transition shadow-sm">
              <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-text-primary">Our Vision</h4>
              <p className="text-text-secondary text-base md:text-lg"
                dangerouslySetInnerHTML={{ __html: aboutData?.ourVision || '' }}
              />
            </div>

            <div className="bg-bg-card border-2 border-border rounded-2xl p-5 md:p-6 hover:border-accent-gold transition shadow-sm">
              <h4 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-text-primary">Our Values</h4>
              <p className="text-text-secondary text-base md:text-lg"
                dangerouslySetInnerHTML={{ __html: aboutData?.ourValues || '' }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
