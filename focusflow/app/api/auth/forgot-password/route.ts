import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    const user = await db.user.findUnique({ where: { email } })
    // Always return ok to not reveal if email exists
    if (!user) return NextResponse.json({ ok: true })

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await db.passwordResetToken.deleteMany({ where: { email } })
    await db.passwordResetToken.create({ data: { email, code, expiresAt } })

    await sendPasswordResetEmail(email, code)

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 })
  }
}
