'use client'
import Link from 'next/link'

interface Task { id: string; title: string; priority: string; status: string }
interface Habit { id: string; title: string; color: string; streak: number; completedToday: boolean }

interface Props {
  tasks: Task[]
  habits: Habit[]
  todayFocusMinutes: number
  weekExpenseTotal: number
  habitsCompletedToday: number
  totalHabits: number
  userName: string
}

const priorityColor = { high: 'text-red-500 bg-red-50', medium: 'text-amber-600 bg-amber-50', low: 'text-green-600 bg-green-50' }
const statusColor = { todo: 'bg-gray-100 text-gray-600', in_progress: 'bg-blue-50 text-blue-600', done: 'bg-green-50 text-green-600' }
const statusLabel = { todo: 'To do', in_progress: 'In progress', done: 'Done' }

export function DashboardClient({ tasks, habits, todayFocusMinutes, weekExpenseTotal, habitsCompletedToday, totalHabits, userName }: Props) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const habitPct = totalHabits > 0 ? Math.round((habitsCompletedToday / totalHabits) * 100) : 0

  const stats = [
    {
      label: 'Tasks Done',
      value: `${doneTasks}/${tasks.length}`,
      sub: tasks.length === 0 ? 'No tasks yet' : doneTasks === tasks.length ? 'All done!' : `${tasks.length - doneTasks} remaining`,
      icon: '✓',
      color: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      link: '/tasks',
    },
    {
      label: 'Habits Today',
      value: `${habitsCompletedToday}/${totalHabits}`,
      sub: totalHabits === 0 ? 'No habits yet' : `${habitPct}% complete`,
      icon: '🔥',
      color: 'bg-orange-50',
      iconColor: 'text-orange-500',
      link: '/habits',
    },
    {
      label: 'Focus Time',
      value: todayFocusMinutes >= 60 ? `${Math.floor(todayFocusMinutes / 60)}h ${todayFocusMinutes % 60}m` : `${todayFocusMinutes}m`,
      sub: 'today',
      icon: '⏱',
      color: 'bg-violet-50',
      iconColor: 'text-violet-600',
      link: '/focus',
    },
    {
      label: 'This Week',
      value: `$${weekExpenseTotal.toFixed(0)}`,
      sub: 'total spending',
      icon: '💰',
      color: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      link: '/expenses',
    },
  ]

  return (
    <div className="p-8 max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{greeting}, {userName.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1 text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <Link key={s.label} href={s.link}
            className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all group">
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center text-lg mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm font-medium text-gray-500 mt-0.5">{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Tasks</h2>
            <Link href="/tasks" className="text-sm text-indigo-600 hover:underline">View all</Link>
          </div>
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No tasks yet</p>
              <Link href="/tasks" className="mt-2 inline-block text-indigo-600 text-sm hover:underline">Add your first task →</Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center gap-3 py-2">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.status === 'done' ? 'bg-green-400' : t.status === 'in_progress' ? 'bg-blue-400' : 'bg-gray-300'}`} />
                  <span className={`text-sm flex-1 ${t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-700'}`}>{t.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[t.priority as keyof typeof priorityColor] || 'text-gray-500 bg-gray-50'}`}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Habits Today */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Today&apos;s Habits</h2>
            <Link href="/habits" className="text-sm text-indigo-600 hover:underline">View all</Link>
          </div>
          {habits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No habits yet</p>
              <Link href="/habits" className="mt-2 inline-block text-indigo-600 text-sm hover:underline">Add your first habit →</Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {habits.slice(0, 5).map(h => (
                <div key={h.id} className="flex items-center gap-3 py-1.5">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${h.completedToday ? 'border-0 bg-green-400' : 'border-gray-200'}`}
                    style={h.completedToday ? {} : { borderColor: h.color }}>
                    {h.completedToday && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className="text-sm text-gray-700 flex-1">{h.title}</span>
                  {h.streak > 0 && (
                    <span className="text-xs text-orange-500 font-medium flex items-center gap-0.5">
                      🔥 {h.streak}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Progress bar */}
          {totalHabits > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>{habitsCompletedToday}/{totalHabits} completed</span>
                <span>{habitPct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                  style={{ width: `${habitPct}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { href: '/focus', label: 'Start Focus Session', desc: 'Pomodoro timer', icon: '⏱', color: 'from-violet-500 to-indigo-600' },
          { href: '/ai', label: 'AI Insights', desc: 'Get personalized tips', icon: '🤖', color: 'from-indigo-500 to-blue-600' },
          { href: '/expenses', label: 'Log Expense', desc: 'Track your spending', icon: '💰', color: 'from-emerald-500 to-teal-600' },
        ].map(q => (
          <Link key={q.href} href={q.href}
            className={`bg-gradient-to-br ${q.color} rounded-2xl p-5 text-white hover:opacity-90 transition-all hover:scale-[1.02]`}>
            <span className="text-2xl block mb-2">{q.icon}</span>
            <p className="font-semibold text-sm">{q.label}</p>
            <p className="text-xs text-white/70 mt-0.5">{q.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
