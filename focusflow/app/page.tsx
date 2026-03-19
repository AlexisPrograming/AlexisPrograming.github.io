'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error); setLoading(false); return }
      }
      const result = await signIn('credentials', { email: form.email, password: form.password, remember: String(remember), redirect: false })
      if (result?.error) { setError('Invalid credentials'); setLoading(false); return }
      router.push('/dashboard')
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-violet-700 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">⚡</div>
            <span className="text-2xl font-bold tracking-tight">FocusFlow</span>
          </div>
          <p className="mt-2 text-indigo-200 text-sm">Your intelligent productivity companion</p>
        </div>
        <div className="space-y-8">
          <h1 className="text-4xl font-bold leading-tight">
            Build better habits,<br />accomplish more,<br />
            <span className="text-indigo-200">every single day.</span>
          </h1>
          <div className="grid grid-cols-2 gap-4">
            {[['✓','Task Manager'],['🔥','Habit Tracker'],['⏱','Focus Timer'],['🤖','AI Insights']].map(([icon, label]) => (
              <div key={label} className="flex items-center gap-2 text-sm text-indigo-100">
                <span>{icon}</span><span>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-300 text-sm">&copy; 2024 FocusFlow. Built for achievers.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">⚡</div>
            <span className="text-xl font-bold text-gray-900">FocusFlow</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {mode === 'login' ? 'Sign in to your dashboard' : 'Start your productivity journey'}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your name" required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com" required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••" required minLength={6}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white" />
            </div>
            {mode === 'login' && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 accent-indigo-600" />
                <span className="text-sm text-gray-600">Remember me for 30 days</span>
              </label>
            )}
            {error && <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition disabled:opacity-50">
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
              className="text-indigo-600 font-medium hover:underline">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
