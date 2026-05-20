import "dotenv/config"; // On garde uniquement dotenv pour charger le .env

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // On utilise directement le process.env standard de Node.js
    url: process.env.DATABASE_URL, 
  },
};