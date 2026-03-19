import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'FocusFlow — Your Intelligent Productivity Dashboard',
  description: 'Manage tasks, track habits, focus with timers, and get AI-powered insights.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-[#f8f7f4]">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
