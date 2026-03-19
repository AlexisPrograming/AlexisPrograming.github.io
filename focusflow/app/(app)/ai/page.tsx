'use client'
import { useState, useEffect } from 'react'

export default function AIPage() {
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchInsights() {
    const res = await fetch('/api/insights')
    if (res.ok) {
      const data = await res.json()
      setInsights(data.insights)
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { fetchInsights() }, [])

  function refresh() {
    setRefreshing(true)
    fetchInsights()
  }

  const insightTypes = [
    { keywords: ['complet', 'done', 'task'], icon: '✅', color: 'bg-green-50 border-green-100' },
    { keywords: ['streak', 'habit', 'consist'], icon: '🔥', color: 'bg-orange-50 border-orange-100' },
    { keywords: ['focus', 'minute', 'hour', 'session'], icon: '⏱', color: 'bg-violet-50 border-violet-100' },
    { keywords: ['spend', 'expense', 'week', 'categor', '$'], icon: '💰', color: 'bg-emerald-50 border-emerald-100' },
    { keywords: ['start', 'add', 'begin'], icon: '🚀', color: 'bg-indigo-50 border-indigo-100' },
  ]

  function getInsightStyle(text: string) {
    const lower = text.toLowerCase()
    for (const t of insightTypes) {
      if (t.keywords.some(k => lower.includes(k))) return t
    }
    return { icon: '💡', color: 'bg-blue-50 border-blue-100' }
  }

  return (
    <div className="p-8 max-w-3xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-500 text-sm mt-1">Personalized analysis of your productivity patterns</p>
        </div>
        <button onClick={refresh} disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50">
          <span className={refreshing ? 'animate-spin' : ''}>↻</span>
          {refreshing ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-8 mb-6 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">🤖</div>
          <div>
            <h2 className="font-bold text-lg mb-1">Your Personal AI Coach</h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Based on your tasks, habits, focus sessions, and expenses, here are personalized insights to help you optimize your daily routine and reach your goals faster.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const style = getInsightStyle(insight)
            return (
              <div key={i} className={`bg-white rounded-2xl border p-5 ${style.color} animate-fade-in`}
                style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                    {style.icon}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mt-1.5">{insight}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tips Section */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">📚 Productivity Tips</h3>
        <div className="space-y-3">
          {[
            { tip: 'Use the 2-minute rule', desc: 'If a task takes less than 2 minutes, do it now.' },
            { tip: 'Track your energy levels', desc: 'Schedule deep work during your peak focus hours.' },
            { tip: 'Review weekly', desc: 'Spend 15 minutes every Sunday reviewing your week.' },
            { tip: 'Batch similar tasks', desc: 'Group similar tasks together to reduce context switching.' },
          ].map(t => (
            <div key={t.tip} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-800">{t.tip}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
