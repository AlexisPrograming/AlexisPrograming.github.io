import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, code, password } = await request.json()

    const token = await db.passwordResetToken.findFirst({ where: { email, code } })
    if (!token) return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    if (token.expiresAt < new Date()) return NextResponse.json({ error: 'Code expired' }, { status: 400 })

    const hashed = await bcrypt.hash(password, 12)
    await db.user.update({ where: { email }, data: { password: hashed } })
    await db.passwordResetToken.deleteMany({ where: { email } })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 })
  }
}
