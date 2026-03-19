'use client'
import { useState } from 'react'

interface User { id: string; name: string; email: string; createdAt: Date }

export function AdminClient({ users: initial }: { users: User[] }) {
  const [users, setUsers] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  function notify(text: string, type: 'success' | 'error') {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 4000)
  }

  async function deleteUser(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    setLoading(id + '-delete')
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    setLoading(null)
    if (res.ok) {
      setUsers(u => u.filter(u => u.id !== id))
      notify(`${name} deleted.`, 'success')
    } else {
      notify('Failed to delete user.', 'error')
    }
  }

  async function resetPassword(id: string, name: string) {
    const newPassword = prompt(`Enter new password for ${name}:`)
    if (!newPassword) return
    setLoading(id + '-reset')
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    })
    setLoading(null)
    if (res.ok) {
      notify(`Password updated for ${name}.`, 'success')
    } else {
      notify('Failed to reset password.', 'error')
    }
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
      </div>

      {message && (
        <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                <td className="px-6 py-4 font-medium text-gray-900">{u.name}</td>
                <td className="px-6 py-4 text-gray-500">{u.email}</td>
                <td className="px-6 py-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => resetPassword(u.id, u.name)}
                      disabled={loading === u.id + '-reset'}
                      className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      {loading === u.id + '-reset' ? 'Saving...' : 'Reset password'}
                    </button>
                    <button
                      onClick={() => deleteUser(u.id, u.name)}
                      disabled={loading === u.id + '-delete'}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {loading === u.id + '-delete' ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
