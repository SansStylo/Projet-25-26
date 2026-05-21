/**
 * prisma/seed.ts
 * 
 * Script d'initialisation et de peuplement de la base de données
 * 
 * Rôle:
 * - Vide complètement la table Utilisateur
 * - Crée 4 utilisateurs de test avec des rôles différents
 * - Permet de tester rapidement l'application avec des données
 * 
 * Utilisateurs créés:
 * 1. prof@isen.fr (enseignant) - password123
 * 2. marie.martin@isen.fr (enseignant) - secure123
 * 3. admin@isen.fr (administrateur) - admin123
 * 4. responsable@isen.fr (responsable_pedagogique) - resp123
 * 
 * Fonctionnement:
 * - Utilise l'adaptateur Prisma PostgreSQL (PrismaPg)
 * - Crée un pool de connexions PostgreSQL
 * - Supprime tous les utilisateurs existants
 * - Crée les 4 utilisateurs de test
 * - Ferme la connexion à la fin
 */

// prisma/seed.ts
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Utiliser le même setup que db.ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('⏳ Nettoyage de la base de données...')
  await prisma.utilisateur.deleteMany({}) 

  console.log('🌱 Injection des données de test...')

  // 1. Création de ton compte enseignant pour tester la connexion
  const userTest = await prisma.utilisateur.create({
    data: {
      email: 'prof@isen.fr',
      motDePasse: 'password123',
      prenom: 'Jean',
      nom: 'Dupont',
      role: 'enseignant',
    },
  })

  // 2. Autres utilisateurs de test
  await prisma.utilisateur.create({
    data: {
      email: 'marie.martin@isen.fr',
      motDePasse: 'secure123',
      prenom: 'Marie',
      nom: 'Martin',
      role: 'enseignant',
    },
  })

  await prisma.utilisateur.create({
    data: {
      email: 'admin@isen.fr',
      motDePasse: 'admin123',
      prenom: 'Pierre',
      nom: 'Legrand',
      role: 'administrateur',
    },
  })

  await prisma.utilisateur.create({
    data: {
      email: 'responsable@isen.fr',
      motDePasse: 'resp123',
      prenom: 'Sophie',
      nom: 'Rousseau',
      role: 'responsable_pedagogique',
    },
  })

}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })