'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/tasks', label: 'Tasks', icon: '✓' },
  { href: '/habits', label: 'Habits', icon: '🔥' },
  { href: '/focus', label: 'Focus', icon: '⏱' },
  { href: '/expenses', label: 'Expenses', icon: '💰' },
  { href: '/ai', label: 'AI', icon: '🤖' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 bg-white border-r border-gray-100 flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">⚡</div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">FocusFlow</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}>
                <span className={`text-base ${active ? 'opacity-100' : 'opacity-60'}`}>{item.icon}</span>
                {item.label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {session?.user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{session?.user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/' })}
            className="mt-1 w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">⚡</div>
          <span className="font-bold text-gray-900 tracking-tight">FocusFlow</span>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/' })}
          className="text-xs text-gray-500 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50">
          Sign out
        </button>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex">
        {nav.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                active ? 'text-indigo-600' : 'text-gray-400'
              }`}>
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px]">{item.label}</span>
              {active && <div className="w-1 h-1 rounded-full bg-indigo-600 mt-0.5" />}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
