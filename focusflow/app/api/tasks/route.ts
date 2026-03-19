import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import db from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const tasks = await db.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(tasks)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { title, description, priority, status, dueDate } = await request.json()

  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 })

  const task = await db.task.create({
    data: { title, description, priority: priority || 'medium', status: status || 'todo', dueDate: dueDate ? new Date(dueDate) : null, userId },
  })
  return NextResponse.json(task, { status: 201 })
}
