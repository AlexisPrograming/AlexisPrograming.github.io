import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import db from '@/lib/db'
import bcrypt from 'bcryptjs'

const ADMIN_EMAIL = 'alexis97maga@gmail.com'

async function isAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.email === ADMIN_EMAIL
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await db.user.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  const { password } = await req.json()
  if (!password) return NextResponse.json({ error: 'Password required' }, { status: 400 })
  const hashed = await bcrypt.hash(password, 12)
  await db.user.update({ where: { id }, data: { password: hashed } })
  return NextResponse.json({ ok: true })
}
