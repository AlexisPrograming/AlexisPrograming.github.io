import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import db from '@/lib/db'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session!.user as { id: string }).id
  const today = new Date().toISOString().split('T')[0]

  const [tasks, habits, expenses, focusSessions] = await Promise.all([
    db.task.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5 }),
    db.habit.findMany({
      where: { userId },
      include: { completions: { where: { date: today }, take: 1 } },
    }),
    db.expense.findMany({ where: { userId } }),
    db.focusSession.findMany({ where: { userId, date: today } }),
  ])

  const todayFocusMinutes = focusSessions.reduce((s, f) => s + f.duration, 0)
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const weekExpenses = expenses.filter(e => new Date(e.date) >= weekAgo)
  const weekTotal = weekExpenses.reduce((s, e) => s + e.amount, 0)
  const habitsCompletedToday = habits.filter(h => h.completions.length > 0).length

  return (
    <DashboardClient
      tasks={tasks}
      habits={habits.map(h => ({ ...h, completedToday: h.completions.length > 0 }))}
      todayFocusMinutes={todayFocusMinutes}
      weekExpenseTotal={weekTotal}
      habitsCompletedToday={habitsCompletedToday}
      totalHabits={habits.length}
      userName={session!.user?.name || 'there'}
    />
  )
}
