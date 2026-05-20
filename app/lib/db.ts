import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// 1. On crée le pool de connexion natif de PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// 2. On le passe à l'adaptateur Prisma 7
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// 3. On instancie le client avec cet adaptateur
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma