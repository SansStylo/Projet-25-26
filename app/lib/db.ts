/**
 * app/lib/db.ts
 * 
 * Initialisation du client Prisma avec adaptateur PostgreSQL
 * 
 * Rôle:
 * - Configure la connexion à la base de données PostgreSQL
 * - Initialise le client Prisma de manière optimisée (singleton pattern)
 * - Utilise l'adaptateur @prisma/adapter-pg pour une connexion native PostgreSQL
 * 
 * Fonctionnement:
 * - Crée un pool de connexions PostgreSQL (réutilisé)
 * - Passe le pool à l'adaptateur Prisma
 * - Exporte une instance globale du client Prisma
 * - En développement, stocke l'instance dans globalThis pour éviter les réinitialisations
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// On crée le pool de connexion natif de PostgreSQL
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// On le passe à l'adaptateur Prisma 
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// On instancie le client avec cet adaptateur
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma