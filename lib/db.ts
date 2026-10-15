import { PrismaClient } from '@prisma/client'

/**
 * Единственный экземпляр Prisma Client на процесс.
 * В режиме разработки Next.js перезагружает модули при каждом изменении,
 * поэтому клиент кладётся в globalThis — иначе соединения утекают.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
