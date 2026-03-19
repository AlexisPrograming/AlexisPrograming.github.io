import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import db from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const today = new Date().toISOString().split('T')[0]

  const habits = await db.habit.findMany({
    where: { userId },
    include: {
      completions: {
        where: { date: today },
        take: 1,
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(habits.map(h => ({
    ...h,
    completedToday: h.completions.length > 0,
  })))
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { title, description, color } = await request.json()

  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const habit = await db.habit.create({
    data: { title, description, color: color || '#6366f1', userId },
  })
  return NextResponse.json(habit, { status: 201 })
}
