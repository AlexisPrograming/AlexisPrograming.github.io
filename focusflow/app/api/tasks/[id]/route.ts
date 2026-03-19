import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import db from '@/lib/db'

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/tasks/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { id } = await ctx.params
  const body = await request.json()

  const task = await db.task.findUnique({ where: { id } })
  if (!task || task.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const updated = await db.task.update({ where: { id }, data: body })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/tasks/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { id } = await ctx.params

  const task = await db.task.findUnique({ where: { id } })
  if (!task || task.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.task.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
