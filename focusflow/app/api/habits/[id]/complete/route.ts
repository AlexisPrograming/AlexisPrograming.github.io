import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import db from '@/lib/db'

export async function POST(_req: NextRequest, ctx: RouteContext<'/api/habits/[id]/complete'>) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { id } = await ctx.params
  const today = new Date().toISOString().split('T')[0]

  const habit = await db.habit.findUnique({ where: { id } })
  if (!habit || habit.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = await db.habitCompletion.findFirst({ where: { habitId: id, date: today } })

  if (existing) {
    await db.habitCompletion.delete({ where: { id: existing.id } })
    // Recalculate streak
    const completions = await db.habitCompletion.findMany({
      where: { habitId: id },
      orderBy: { date: 'desc' },
    })
    let streak = 0
    const d = new Date()
    d.setDate(d.getDate() - 1) // start from yesterday
    for (const c of completions) {
      if (c.date === d.toISOString().split('T')[0]) {
        streak++
        d.setDate(d.getDate() - 1)
      } else break
    }
    await db.habit.update({ where: { id }, data: { streak } })
    return NextResponse.json({ completed: false, streak })
  }

  await db.habitCompletion.create({ data: { habitId: id, date: today } })

  // Calculate streak
  const completions = await db.habitCompletion.findMany({
    where: { habitId: id },
    orderBy: { date: 'desc' },
  })
  let streak = 0
  const d = new Date()
  for (const c of completions) {
    if (c.date === d.toISOString().split('T')[0]) {
      streak++
      d.setDate(d.getDate() - 1)
    } else break
  }

  await db.habit.update({ where: { id }, data: { streak } })
  return NextResponse.json({ completed: true, streak })
}
