'use client'
import { useState, useEffect, useCallback } from 'react'

interface Expense { id: string; title: string; amount: number; category: string; date: string }

const categories = ['food', 'transport', 'entertainment', 'health', 'shopping', 'other']
const categoryConfig: Record<string, { icon: string; color: string; bg: string }> = {
  food: { icon: '🍔', color: 'text-orange-600', bg: 'bg-orange-50' },
  transport: { icon: '🚗', color: 'text-blue-600', bg: 'bg-blue-50' },
  entertainment: { icon: '🎮', color: 'text-purple-600', bg: 'bg-purple-50' },
  health: { icon: '💊', color: 'text-green-600', bg: 'bg-green-50' },
  shopping: { icon: '🛍', color: 'text-pink-600', bg: 'bg-pink-50' },
  other: { icon: '📦', color: 'text-gray-600', bg: 'bg-gray-50' },
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)

  const fetchExpenses = useCallback(async () => {
    const res = await fetch('/api/expenses')
    if (res.ok) setExpenses(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  async function addExpense(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const exp = await res.json()
      setExpenses(prev => [exp, ...prev])
      setForm({ title: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0] })
      setShowForm(false)
    }
    setSaving(false)
  }

  async function deleteExpense(id: string) {
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    if (res.ok) setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7)
  const weekExpenses = expenses.filter(e => new Date(e.date) >= weekAgo)
  const weekTotal = weekExpenses.reduce((s, e) => s + e.amount, 0)

  // Category breakdown
  const byCategory: Record<string, number> = {}
  expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount })
  const sortedCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1])

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm mt-1">{expenses.length} transactions recorded</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
          <span className="text-lg leading-none">+</span> Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total', value: `$${total.toFixed(2)}`, sub: 'all time', color: 'bg-indigo-50 text-indigo-700' },
          { label: 'This Week', value: `$${weekTotal.toFixed(2)}`, sub: 'last 7 days', color: 'bg-amber-50 text-amber-700' },
          { label: 'Transactions', value: expenses.length.toString(), sub: 'total entries', color: 'bg-emerald-50 text-emerald-700' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <p className={`text-2xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</p>
            <p className="text-sm font-medium text-gray-500 mt-0.5">{s.label}</p>
            <p className="text-xs text-gray-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 animate-fade-in">
          <h3 className="font-semibold text-gray-900 mb-4">Add Expense</h3>
          <form onSubmit={addExpense} className="space-y-3">
            <div className="flex gap-3">
              <input type="text" placeholder="What did you spend on?" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <input type="number" placeholder="Amount" value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required min="0" step="0.01"
                className="w-32 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex gap-3">
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                {categories.map(c => <option key={c} value={c}>{categoryConfig[c].icon} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Expense List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-4xl mb-3">💸</p>
              <p className="text-gray-500 font-medium">No expenses yet</p>
              <p className="text-gray-400 text-sm mt-1">Start tracking your spending</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {expenses.map(exp => {
                const cfg = categoryConfig[exp.category] || categoryConfig.other
                return (
                  <div key={exp.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 group hover:border-gray-200 transition">
                    <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{exp.title}</p>
                      <p className="text-xs text-gray-400">{new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {exp.category}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">${exp.amount.toFixed(2)}</span>
                    <button onClick={() => deleteExpense(exp.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">✕</button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        {sortedCats.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 h-fit">
            <h3 className="font-semibold text-gray-900 mb-4">By Category</h3>
            <div className="space-y-3">
              {sortedCats.map(([cat, amount]) => {
                const cfg = categoryConfig[cat] || categoryConfig.other
                const pct = Math.round((amount / total) * 100)
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{cfg.icon}</span>
                        <span className="text-xs text-gray-600 capitalize">{cat}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">${amount.toFixed(0)}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
