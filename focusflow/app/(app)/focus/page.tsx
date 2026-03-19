'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

interface FocusSession { id: string; duration: number; date: string }

export default function FocusPage() {
  const [focusMinutes, setFocusMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [mode, setMode] = useState<'focus' | 'break'>('focus')
  const [timeLeft, setTimeLeft] = useState(focusMinutes * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState<FocusSession[]>([])
  const [sessionsDone, setSessionsDone] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const fetchSessions = useCallback(async () => {
    const res = await fetch('/api/focus')
    if (res.ok) setSessions(await res.json())
  }, [])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!)
          setRunning(false)
          if (mode === 'focus') {
            // Save focus session
            fetch('/api/focus', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ duration: focusMinutes }),
            }).then(() => fetchSessions())
            setSessionsDone(d => d + 1)
            setMode('break')
            setTimeLeft(breakMinutes * 60)
          } else {
            setMode('focus')
            setTimeLeft(focusMinutes * 60)
          }
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current!)
  }, [running, mode, focusMinutes, breakMinutes, fetchSessions])

  function toggle() { setRunning(r => !r) }
  function reset() {
    setRunning(false)
    clearInterval(intervalRef.current!)
    setMode('focus')
    setTimeLeft(focusMinutes * 60)
  }

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const total = (mode === 'focus' ? focusMinutes : breakMinutes) * 60
  const progress = ((total - timeLeft) / total) * 100

  const today = new Date().toISOString().split('T')[0]
  const todaySessions = sessions.filter(s => s.date === today)
  const todayMinutes = todaySessions.reduce((s, f) => s + f.duration, 0)

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="p-8 max-w-4xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Focus Timer</h1>
        <p className="text-gray-500 text-sm mt-1">Stay in flow, track your deep work</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Timer */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center">
          {/* Mode pill */}
          <div className="flex gap-2 mb-6">
            {(['focus', 'break'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setTimeLeft((m === 'focus' ? focusMinutes : breakMinutes) * 60); setRunning(false) }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  mode === m ? (m === 'focus' ? 'bg-indigo-600 text-white' : 'bg-green-500 text-white') : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}>
                {m === 'focus' ? '🎯 Focus' : '☕ Break'}
              </button>
            ))}
          </div>

          {/* SVG circle timer */}
          <div className="relative w-52 h-52 mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle cx="100" cy="100" r={radius} fill="none"
                stroke={mode === 'focus' ? '#6366f1' : '#10b981'}
                strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold text-gray-900 tabular-nums">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className="text-xs text-gray-400 mt-1">{mode === 'focus' ? 'Focus time' : 'Break time'}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button onClick={reset} className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition text-sm">
              ↺ Reset
            </button>
            <button onClick={toggle}
              className={`px-8 py-3 rounded-xl font-semibold text-white transition-all shadow-md ${
                running ? 'bg-red-500 hover:bg-red-600' : (mode === 'focus' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-500 hover:bg-green-600')
              }`}>
              {running ? '⏸ Pause' : '▶ Start'}
            </button>
          </div>

          {sessionsDone > 0 && (
            <p className="mt-4 text-sm text-gray-400">🏆 {sessionsDone} session{sessionsDone > 1 ? 's' : ''} completed</p>
          )}
        </div>

        {/* Settings + Stats */}
        <div className="space-y-4">
          {/* Settings */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Timer Settings</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-600">Focus duration</label>
                  <span className="text-sm font-semibold text-indigo-600">{focusMinutes} min</span>
                </div>
                <input type="range" min="5" max="90" step="5" value={focusMinutes}
                  onChange={e => { const v = +e.target.value; setFocusMinutes(v); if (!running && mode === 'focus') setTimeLeft(v * 60) }}
                  className="w-full accent-indigo-600" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-gray-600">Break duration</label>
                  <span className="text-sm font-semibold text-green-600">{breakMinutes} min</span>
                </div>
                <input type="range" min="1" max="30" step="1" value={breakMinutes}
                  onChange={e => { const v = +e.target.value; setBreakMinutes(v); if (!running && mode === 'break') setTimeLeft(v * 60) }}
                  className="w-full accent-green-500" />
              </div>
            </div>
          </div>

          {/* Today's stats */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Today&apos;s Focus</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-indigo-700">
                  {todayMinutes >= 60 ? `${Math.floor(todayMinutes / 60)}h ${todayMinutes % 60}m` : `${todayMinutes}m`}
                </p>
                <p className="text-xs text-indigo-500 mt-0.5">Total focus time</p>
              </div>
              <div className="bg-violet-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-violet-700">{todaySessions.length}</p>
                <p className="text-xs text-violet-500 mt-0.5">Sessions today</p>
              </div>
            </div>
          </div>

          {/* Session history */}
          {sessions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Sessions</h3>
              <div className="space-y-2">
                {sessions.slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-600">{new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span className="text-sm font-medium text-indigo-600">{s.duration} min</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
