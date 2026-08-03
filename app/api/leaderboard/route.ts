import { NextResponse } from 'next/server'

interface LeaderboardApiEntry {
  userId: number
  traderName: string | null
  firstName: string | null
  phoneNumber?: string | null
  earnedXP: number
  rank: number
  amount?: number | null
  courseAmount?: number | null
}

type LeaderboardType = 'TODAY' | 'WEEKLY' | 'MONTHLY'

const validTypes: LeaderboardType[] = ['TODAY', 'WEEKLY', 'MONTHLY']

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const requestedType = (searchParams.get('type') || 'TODAY').toUpperCase()
    const type = (validTypes.includes(requestedType as LeaderboardType)
      ? requestedType
      : 'TODAY') as LeaderboardType

    const apiBaseUrl = (
      process.env.NEXT_PUBLIC_API_URL || 'https://api.impulseinvesting.com/api'
    ).replace(/\/$/, '')

    const response = await fetch(`${apiBaseUrl}/dashboard/leaderboard?type=${type}`, {
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      throw new Error(`Leaderboard API returned ${response.status}`)
    }

    const data: unknown = await response.json()
    if (!Array.isArray(data)) {
      throw new Error('Leaderboard API returned an invalid response')
    }

    const leaderboard = (data as LeaderboardApiEntry[]).map((entry) => ({
      userId: entry.userId,
      traderName: entry.traderName,
      firstName: entry.firstName,
      earnedXP: entry.earnedXP,
      rank: entry.rank,
      amount: entry.courseAmount ?? entry.amount ?? null,
    }))

    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('Failed to load leaderboard:', error)
    return NextResponse.json(
      { message: 'Unable to load leaderboard' },
      { status: 502 },
    )
  }
}
