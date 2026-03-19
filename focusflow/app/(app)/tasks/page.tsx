'use client'
import { useState, useEffect, useCallback } from 'react'

interface Task { id: string; title: string; description?: string; priority: string; status: string; createdAt: string }

const priorities = ['low', 'medium', 'high']
const statuses = ['todo', 'in_progress', 'done']
const statusLabels: Record<string, string> = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' }
const priorityColors: Record<string, string> = { high: 'text-red-600 bg-red-50 border-red-100', medium: 'text-amber-600 bg-amber-50 border-amber-100', low: 'text-green-600 bg-green-50 border-green-100' }

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo' })
  const [saving, setSaving] = useState(false)

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks')
    if (res.ok) setTasks(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const t = await res.json()
      setTasks(prev => [t, ...prev])
      setForm({ title: '', description: '', priority: 'medium', status: 'todo' })
      setShowForm(false)
    }
    setSaving(false)
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
  }

  async function deleteTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (res.ok) setTasks(prev => prev.filter(t => t.id !== id))
  }

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)
  const counts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">{tasks.length} total · {counts.done} completed</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
          <span className="text-lg leading-none">+</span> Add Task
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 animate-fade-in">
          <h3 className="font-semibold text-gray-900 mb-4">New Task</h3>
          <form onSubmit={addTask} className="space-y-3">
            <input type="text" placeholder="Task title" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <textarea placeholder="Description (optional)" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
            <div className="flex gap-3">
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50">
                {saving ? 'Adding...' : 'Add Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 border border-gray-100 w-fit">
        {[['all', 'All'], ['todo', 'To Do'], ['in_progress', 'In Progress'], ['done', 'Done']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all ${
              filter === val ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label} <span className="text-xs opacity-70">({counts[val as keyof typeof counts]})</span>
          </button>
        ))}
      </div>

      {/* Task List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">✓</p>
          <p className="text-gray-500 font-medium">No tasks here</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter === 'all' ? 'Add your first task above' : `No ${statusLabels[filter]?.toLowerCase()} tasks`}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(t => (
            <div key={t.id} className={`bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-4 hover:border-gray-200 transition group ${t.status === 'done' ? 'opacity-70' : ''}`}>
              {/* Status toggle */}
              <button onClick={() => updateStatus(t.id, t.status === 'done' ? 'todo' : 'done')}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  t.status === 'done' ? 'bg-green-400 border-green-400' : 'border-gray-300 hover:border-indigo-400'
                }`}>
                {t.status === 'done' && <span className="text-white text-xs">✓</span>}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{t.title}</p>
                {t.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{t.description}</p>}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${priorityColors[t.priority] || ''}`}>{t.priority}</span>
                <select value={t.status} onChange={e => updateStatus(t.id, e.target.value)}
                  onClick={e => e.stopPropagation()}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 text-gray-600">
                  {statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
                </select>
                <button onClick={() => deleteTask(t.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
