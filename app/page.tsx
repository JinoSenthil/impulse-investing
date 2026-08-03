'use client'

import dynamic from 'next/dynamic'
import Navigation from '@/components/ui/Navigation'
import Hero from '@/components/sections/Hero'
import Introduction from '@/components/sections/Introduction'
import Features from '@/components/sections/Features'
import Indicators from '@/components/sections/Indicators'
import Demo from '@/components/sections/Demo'
import News from '@/components/sections/News'
import Footer from '@/components/ui/Footer'

const YouTubeVideos = dynamic(() => import('@/components/sections/YouTubeVideos'))
const Reviews = dynamic(() => import('@/components/sections/Reviews'))
const About = dynamic(() => import('@/components/sections/About'))
const Stats = dynamic(() => import('@/components/sections/Stats'))
const Contact = dynamic(() => import('@/components/sections/Contact'))

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Introduction />
      <Features />
      <Indicators />
      <Demo />
      <News />
      <YouTubeVideos />
      <Reviews />
      <About />
      <Stats />
      <Contact />
      <Footer />
    </main>
  )
}
