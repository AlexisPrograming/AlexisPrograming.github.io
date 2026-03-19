import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'dev.db')

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  return new PrismaClient({ adapter })
}

const db = globalThis.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}

export default db
