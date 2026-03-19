import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import db from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const sessions = await db.focusSession.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(sessions)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { duration } = await request.json()

  const today = new Date().toISOString().split('T')[0]
  const focusSession = await db.focusSession.create({
    data: { duration: parseInt(duration), date: today, userId },
  })
  return NextResponse.json(focusSession, { status: 201 })
}
