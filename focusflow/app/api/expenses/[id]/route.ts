import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import db from '@/lib/db'

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/expenses/[id]'>) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const userId = (session.user as { id: string }).id
  const { id } = await ctx.params

  const expense = await db.expense.findUnique({ where: { id } })
  if (!expense || expense.userId !== userId) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.expense.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
