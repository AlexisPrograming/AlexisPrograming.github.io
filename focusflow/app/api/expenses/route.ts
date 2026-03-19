import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import db from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const expenses = await db.expense.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })
  return NextResponse.json(expenses)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { title, amount, category, date } = await request.json()

  if (!title || amount === undefined) return NextResponse.json({ error: 'Title and amount required' }, { status: 400 })

  const today = new Date().toISOString().split('T')[0]
  const expense = await db.expense.create({
    data: { title, amount: parseFloat(amount), category: category || 'other', date: date || today, userId },
  })
  return NextResponse.json(expense, { status: 201 })
}
