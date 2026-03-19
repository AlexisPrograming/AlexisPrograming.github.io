'use client'
import { useState, useEffect, useCallback } from 'react'

interface Habit { id: string; title: string; description?: string; color: string; streak: number; completedToday: boolean }

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', color: '#6366f1' })
  const [saving, setSaving] = useState(false)

  const fetchHabits = useCallback(async () => {
    const res = await fetch('/api/habits')
    if (res.ok) setHabits(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchHabits() }, [fetchHabits])

  async function addHabit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const h = await res.json()
      setHabits(prev => [...prev, { ...h, completedToday: false }])
      setForm({ title: '', description: '', color: '#6366f1' })
      setShowForm(false)
    }
    setSaving(false)
  }

  async function toggleComplete(id: string) {
    const res = await fetch(`/api/habits/${id}/complete`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setHabits(prev => prev.map(h => h.id === id ? { ...h, completedToday: data.completed, streak: data.streak } : h))
    }
  }

  async function deleteHabit(id: string) {
    const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' })
    if (res.ok) setHabits(prev => prev.filter(h => h.id !== id))
  }

  const completedCount = habits.filter(h => h.completedToday).length
  const pct = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Habits</h1>
          <p className="text-gray-500 text-sm mt-1">{completedCount}/{habits.length} completed today</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
          <span className="text-lg leading-none">+</span> New Habit
        </button>
      </div>

      {/* Progress */}
      {habits.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-sm font-medium text-gray-700">Today&apos;s Progress</span>
            <span className="text-sm font-bold text-indigo-600">{pct}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${pct}%` }} />
          </div>
          {pct === 100 && (
            <p className="mt-2.5 text-sm text-center text-green-600 font-medium">🎉 All habits completed today!</p>
          )}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 animate-fade-in">
          <h3 className="font-semibold text-gray-900 mb-4">New Habit</h3>
          <form onSubmit={addHabit} className="space-y-3">
            <input type="text" placeholder="Habit name (e.g. Morning meditation)" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="text" placeholder="Description (optional)" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Color</p>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                    className={`w-7 h-7 rounded-full transition-transform hover:scale-110 ${form.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50">
                {saving ? 'Adding...' : 'Add Habit'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Habits Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">🌱</p>
          <p className="text-gray-500 font-medium">No habits yet</p>
          <p className="text-gray-400 text-sm mt-1">Start building positive habits today</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {habits.map(h => (
            <div key={h.id} className={`bg-white rounded-2xl border-2 p-5 transition-all group ${
              h.completedToday ? 'border-green-200 bg-green-50/30' : 'border-gray-100 hover:border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: h.color }} />
                  <h3 className="font-medium text-gray-900 text-sm">{h.title}</h3>
                </div>
                <button onClick={() => deleteHabit(h.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all text-sm">✕</button>
              </div>
              {h.description && <p className="text-xs text-gray-400 mb-3 ml-6">{h.description}</p>}

              <div className="flex items-center justify-between ml-6">
                <div className="flex items-center gap-1.5 text-sm">
                  {h.streak > 0 && (
                    <span className="flex items-center gap-1 text-orange-500 font-medium text-xs bg-orange-50 px-2.5 py-1 rounded-full">
                      🔥 {h.streak} day streak
                    </span>
                  )}
                </div>
                <button onClick={() => toggleComplete(h.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    h.completedToday
                      ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}>
                  {h.completedToday ? '✓ Done' : 'Mark done'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
