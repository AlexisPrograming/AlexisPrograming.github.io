'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Mode = 'login' | 'register' | 'verify' | 'forgot' | 'reset'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [remember, setRemember] = useState(false)
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [pendingEmail, setPendingEmail] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function reset() { setError(''); setInfo(''); setCode(''); setNewPassword('') }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const result = await signIn('credentials', { email: form.email, password: form.password, remember: String(remember), redirect: false })
    setLoading(false)
    if (result?.error) {
      setError('Invalid credentials or account not verified.')
      return
    }
    router.push('/dashboard')
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setPendingEmail(form.email)
    setInfo(`A verification code was sent to ${form.email}`)
    setMode('verify')
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingEmail, code }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    const result = await signIn('credentials', { email: pendingEmail, password: form.password, remember: 'false', redirect: false })
    setLoading(false)
    if (result?.error) { setMode('login'); setInfo('Account verified! Please sign in.'); return }
    router.push('/dashboard')
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingEmail }),
    })
    setLoading(false)
    setInfo(`A reset code was sent to ${pendingEmail}`)
    setMode('reset')
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingEmail, code, password: newPassword }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setMode('login')
    setInfo('Password reset! You can now sign in.')
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

          {/* Login */}
          {mode === 'login' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
              <p className="text-gray-500 text-sm mb-8">Sign in to your dashboard</p>
              {info && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm">{info}</div>}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com" required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••" required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 accent-indigo-600" />
                    <span className="text-sm text-gray-600">Remember me for 30 days</span>
                  </label>
                  <button type="button" onClick={() => { reset(); setMode('forgot') }}
                    className="text-sm text-indigo-600 hover:underline">Forgot password?</button>
                </div>
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition disabled:opacity-50">
                  {loading ? 'Please wait...' : 'Sign in'}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <button onClick={() => { reset(); setMode('register') }} className="text-indigo-600 font-medium hover:underline">Sign up</button>
              </p>
            </>
          )}

          {/* Register */}
          {mode === 'register' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
              <p className="text-gray-500 text-sm mb-8">Start your productivity journey</p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your name" required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white" />
                </div>
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
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition disabled:opacity-50">
                  {loading ? 'Sending code...' : 'Create account'}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-500">
                Already have an account?{' '}
                <button onClick={() => { reset(); setMode('login') }} className="text-indigo-600 font-medium hover:underline">Sign in</button>
              </p>
            </>
          )}

          {/* Verify email */}
          {mode === 'verify' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Check your email</h2>
              {info && <p className="text-gray-500 text-sm mb-8">{info}</p>}
              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Verification code</label>
                  <input type="text" value={code} onChange={e => setCode(e.target.value)}
                    placeholder="123456" required maxLength={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white tracking-widest text-center text-lg font-bold" />
                </div>
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Verify account'}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-500">
                <button onClick={() => { reset(); setMode('login') }} className="text-indigo-600 font-medium hover:underline">Back to sign in</button>
              </p>
            </>
          )}

          {/* Forgot password */}
          {mode === 'forgot' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot password?</h2>
              <p className="text-gray-500 text-sm mb-8">Enter your email and we&apos;ll send a reset code.</p>
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input type="email" value={pendingEmail} onChange={e => setPendingEmail(e.target.value)}
                    placeholder="you@example.com" required
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white" />
                </div>
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send reset code'}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-500">
                <button onClick={() => { reset(); setMode('login') }} className="text-indigo-600 font-medium hover:underline">Back to sign in</button>
              </p>
            </>
          )}

          {/* Reset password */}
          {mode === 'reset' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Reset password</h2>
              {info && <p className="text-gray-500 text-sm mb-8">{info}</p>}
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Reset code</label>
                  <input type="text" value={code} onChange={e => setCode(e.target.value)}
                    placeholder="123456" required maxLength={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white tracking-widest text-center text-lg font-bold" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••" required minLength={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white" />
                </div>
                {error && <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
                <button type="submit" disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 transition disabled:opacity-50">
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-gray-500">
                <button onClick={() => { reset(); setMode('login') }} className="text-indigo-600 font-medium hover:underline">Back to sign in</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
