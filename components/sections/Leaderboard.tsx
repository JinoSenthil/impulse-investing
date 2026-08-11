'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Award, Crown, Trophy, Zap } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/store'
import ApiService from '@/services/ApiService'
import { getFullImageUrl } from '@/lib/utils'

interface LeaderboardEntry {
  userId: number
  traderName: string | null
  firstName: string | null
  imageUrl: string | null
  earnedXP: number
  rank: number
  amount?: number | null
}

type LeaderboardType = 'TODAY' | 'WEEKLY' | 'MONTHLY'

const leaderboardTabs: Array<{ label: string; type: LeaderboardType }> = [
  { label: 'Today', type: 'TODAY' },
  { label: 'Weekly', type: 'WEEKLY' },
  { label: 'Monthly', type: 'MONTHLY' },
]

const rankStyles: Record<number, string> = {
  1: 'border-accent-gold/50 bg-accent-gold/10 text-accent-gold',
  2: 'border-slate-400/40 bg-slate-400/10 text-slate-500',
  3: 'border-amber-700/40 bg-amber-700/10 text-amber-700',
}

const rankIcons: Record<number, JSX.Element> = {
  1: <Crown className="h-5 w-5" />,
  2: <Award className="h-5 w-5" />,
  3: <Trophy className="h-5 w-5" />,
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [selectedType, setSelectedType] = useState<LeaderboardType>('TODAY')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({})
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id)

  useEffect(() => {
    const controller = new AbortController()

    const loadLeaderboard = async () => {
      setLoading(true)
      setError(null)
      setBrokenImages({})

      try {
        const data = await ApiService.getLeaderboard(selectedType)
        if (controller.signal.aborted) return
        setEntries(
          [...data]
            .map(entry => ({
              userId: entry.userId,
              traderName: entry.traderName,
              firstName: entry.firstName,
              imageUrl: entry.imageUrl ?? null,
              earnedXP: entry.earnedXP,
              rank: entry.rank,
              amount: entry.courseAmount ?? entry.amount ?? null,
            }))
            .sort((a, b) => a.rank - b.rank),
        )
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message || 'Unable to load leaderboard')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadLeaderboard()
    return () => controller.abort()
  }, [selectedType])

  const periodLabel = leaderboardTabs.find(tab => tab.type === selectedType)?.label || 'Monthly'

  const formatXP = (value: number) =>
    new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)

  return (
    <section
      id="leaderboard"
      className="relative overflow-hidden bg-bg-primary px-6 pb-20 pt-4"
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-gold/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-accent-teal/15 blur-[110px]" />

      <div className="relative mx-auto w-[90%] max-w-4xl">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-gold/30 bg-accent-gold/10 px-4 py-2">
            <Trophy className="h-4 w-4 text-accent-gold" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-accent-gold">
              {periodLabel} rankings
            </span>
          </div>
          <h2 className="font-cinzel text-3xl font-black uppercase tracking-[0.06em] text-text-primary md:text-5xl">
            Leader <span className="text-accent-gold">Board</span>
          </h2>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-bg-card p-2 shadow-xl">
            {leaderboardTabs.map(tab => {
              const active = selectedType === tab.type
              return (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => setSelectedType(tab.type)}
                  className={`rounded-xl px-4 py-2 text-sm font-black uppercase tracking-[0.08em] transition-all ${active
                      ? 'bg-accent-gold text-black shadow-[0_8px_20px_rgba(212,175,55,0.35)]'
                      : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                    }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-accent-gold/25 bg-bg-card/95 shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur">
          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-20 animate-pulse rounded-2xl bg-bg-secondary" />
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">{error}</div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center text-text-secondary">
              No rankings are available for {periodLabel.toLowerCase()}.
            </div>
          ) : (
            <div className="max-h-[68vh] overflow-y-auto custom-scrollbar">
              <div className="sticky top-0 z-10 border-b border-accent-gold/25 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-200 sm:px-6">
                <div className="grid grid-cols-[110px_minmax(0,1fr)_130px] items-center sm:grid-cols-[130px_minmax(0,1fr)_160px]">
                  <span className="text-center">Rank</span>
                  <span className="ml-[135px] text-left">Name</span>
                  <span className="text-center">XP</span>
                </div>
              </div>

              <div className="divide-y divide-border">
                {entries.map((entry) => {
                  const displayName =
                    entry.firstName?.trim() || entry.traderName?.trim() || 'Trader'
                  const isCurrentUser = entry.userId === currentUserId
                  const initials = displayName
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((part) => part.charAt(0).toUpperCase())
                    .join('')
                  const avatarUrl = getFullImageUrl(entry.imageUrl)
                  const showImage = Boolean(avatarUrl) && !brokenImages[entry.userId]

                  return (
                    <div
                      key={entry.userId}
                      className="group px-4 py-2.5 transition-colors hover:bg-bg-secondary/50 sm:px-6"
                    >
                      <div className="grid grid-cols-[110px_minmax(0,1fr)_130px] items-center gap-3 rounded-2xl border border-border/70 bg-gradient-to-r from-bg-card to-bg-secondary/50 p-2.5 sm:grid-cols-[130px_minmax(0,1fr)_160px] sm:p-3">
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-black ${rankStyles[entry.rank] ||
                              'border-border bg-bg-secondary text-text-secondary'
                              }`}
                            aria-label={`Rank ${entry.rank}`}
                          >
                            {rankIcons[entry.rank] || entry.rank}
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-[0.08em] text-text-secondary sm:text-xs">
                            Rank #{entry.rank}
                          </span>
                        </div>

                        <div className="ml-[95px] flex min-w-0 items-center gap-3">
                          {showImage ? (
                            <Image
                              src={avatarUrl}
                              alt={displayName}
                              width={40}
                              height={40}
                              className="h-10 w-10 shrink-0 rounded-full object-cover shadow-md"
                              onError={() =>
                                setBrokenImages(previous => ({
                                  ...previous,
                                  [entry.userId]: true,
                                }))
                              }
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-teal text-xs font-black text-white shadow-md">
                              {initials}
                            </div>
                          )}

                          <div className="flex min-w-0 items-center gap-2">
                            <div className="truncate text-left text-sm font-bold text-text-primary sm:text-base">
                              {displayName}
                            </div>
                            {isCurrentUser && (
                              <span className="shrink-0 rounded-full border border-accent-gold/40 bg-gradient-to-r from-accent-gold/20 to-accent-teal/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-accent-gold shadow-[0_4px_14px_rgba(212,175,55,0.25)]">
                                You
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-accent-gold/30 bg-accent-gold/10 px-3 py-1.5 text-accent-gold">
                          <Zap className="h-3.5 w-3.5" fill="currentColor" />
                          <span className="text-base font-black tabular-nums sm:text-lg" title={`${entry.earnedXP} XP`}>
                            {formatXP(entry.earnedXP)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
