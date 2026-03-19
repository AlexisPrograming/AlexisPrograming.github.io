import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import db from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id

  const [tasks, habits, expenses, focusSessions] = await Promise.all([
    db.task.findMany({ where: { userId } }),
    db.habit.findMany({ where: { userId }, include: { completions: true } }),
    db.expense.findMany({ where: { userId } }),
    db.focusSession.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 30 }),
  ])

  const insights: string[] = []

  // Task insights
  const done = tasks.filter(t => t.status === 'done').length
  const total = tasks.length
  if (total > 0) {
    const rate = Math.round((done / total) * 100)
    if (rate >= 70) insights.push(`Great job! You've completed ${rate}% of your tasks. Keep it up!`)
    else if (rate >= 40) insights.push(`You've completed ${rate}% of your tasks. Try tackling a few more today.`)
    else if (total > 0) insights.push(`You have ${total - done} pending tasks. Consider prioritizing high-priority ones first.`)
  }

  const highPriority = tasks.filter(t => t.priority === 'high' && t.status !== 'done').length
  if (highPriority > 0) insights.push(`You have ${highPriority} high-priority task${highPriority > 1 ? 's' : ''} that need attention.`)

  // Habit insights
  const topStreak = habits.reduce((max, h) => h.streak > max ? h.streak : max, 0)
  if (topStreak >= 7) insights.push(`Amazing! Your best habit streak is ${topStreak} days. Consistency is key to success.`)
  else if (topStreak >= 3) insights.push(`You have a ${topStreak}-day streak on your best habit. Keep the momentum!`)

  const completedToday = habits.filter(h => {
    const today = new Date().toISOString().split('T')[0]
    return h.completions.some(c => c.date === today)
  }).length
  if (habits.length > 0) {
    if (completedToday === habits.length) insights.push('You completed all your habits today! Perfect day!')
    else if (completedToday > 0) insights.push(`You've completed ${completedToday} of ${habits.length} habits today.`)
  }

  // Expense insights
  if (expenses.length > 0) {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0)
    const byCategory: Record<string, number> = {}
    expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount })
    const topCat = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
    if (topCat) insights.push(`Your highest spending category is ${topCat[0]} ($${topCat[1].toFixed(2)} total).`)

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekExp = expenses.filter(e => new Date(e.date) >= weekAgo)
    const weekTotal = weekExp.reduce((s, e) => s + e.amount, 0)
    if (weekTotal > 0) insights.push(`You spent $${weekTotal.toFixed(2)} in the past 7 days.`)
  }

  // Focus insights
  if (focusSessions.length > 0) {
    const today = new Date().toISOString().split('T')[0]
    const todayMinutes = focusSessions.filter(s => s.date === today).reduce((s, f) => s + f.duration, 0)
    if (todayMinutes > 0) insights.push(`You've focused for ${todayMinutes} minutes today. Great work!`)

    const totalMinutes = focusSessions.reduce((s, f) => s + f.duration, 0)
    if (totalMinutes >= 60) insights.push(`You've accumulated ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m of total focus time.`)
  }

  if (insights.length === 0) {
    insights.push('Start adding tasks, habits, and tracking your focus time to get personalized insights!')
  }

  return NextResponse.json({ insights })
}
