import { defineConfig } from '@prisma/config'; // ou '@prisma/config' selon ton installation
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  schema: 'prisma/schema.prisma',
  
  // 🔗 On injecte explicitement l'URL pour Prisma Studio
  datasource: {
    url: process.env.DATABASE_URL,
  },
  
  migrations: {
    seed: 'ts-node --compiler-options "{\\"module\\":\\"CommonJS\\"}" prisma/seed.ts',
  },
});