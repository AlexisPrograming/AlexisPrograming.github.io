import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    const user = await db.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.emailVerified) return NextResponse.json({ ok: true })

    if (!user.verifyCode || user.verifyCode !== code) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 400 })
    }

    if (!user.verifyExpiry || user.verifyExpiry < new Date()) {
      return NextResponse.json({ error: 'Code expired' }, { status: 400 })
    }

    await db.user.update({
      where: { email },
      data: { emailVerified: true, verifyCode: null, verifyExpiry: null },
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
