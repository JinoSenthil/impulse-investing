'use client'

import Navigation from '@/components/ui/Navigation'
import Hero from '@/components/sections/Hero'
import Introduction from '@/components/sections/Introduction'
import Features from '@/components/sections/Features'
import Indicators from '@/components/sections/Indicators'
import Demo from '@/components/sections/Demo'
import Courses from '@/components/sections/Courses'
import News from '@/components/sections/News'
import YouTubeVideos from '@/components/sections/YouTubeVideos'
import Reviews from '@/components/sections/Reviews'
// import Enrollment from '@/components/sections/Enrollment'
import About from '@/components/sections/About'
import Stats from '@/components/sections/Stats'
import Contact from '@/components/sections/Contact'
import Footer from '@/components/ui/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <Hero />
      <Introduction />
      <Features />
      <Indicators />
      <Demo />
      <Courses />
      <News />
      <YouTubeVideos />
      <Reviews />
      {/* <Enrollment /> */}
      <About />
      <Stats />
      <Contact />
      <Footer />
    </main>
  )
}
