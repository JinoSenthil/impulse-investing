'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Navigation from '@/components/ui/Navigation'
import Leaderboard from '@/components/sections/Leaderboard'

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-bg-primary">
      <Navigation />
      <div className="mx-auto w-[90%] max-w-4xl px-6 pt-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-semibold text-text-secondary transition hover:text-accent-teal"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Home
        </Link>
      </div>
      <Leaderboard />
    </main>
  )
}
