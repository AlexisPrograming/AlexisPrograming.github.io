import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import db from '@/lib/db'
import { AdminClient } from './AdminClient'

const ADMIN_EMAIL = 'alexis97maga@gmail.com'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user?.email !== ADMIN_EMAIL) redirect('/dashboard')

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, createdAt: true },
  })

  return <AdminClient users={users} />
}
