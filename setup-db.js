require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function setup() {
  const client = await pool.connect();
  try {
    // Créer la table utilisateur pour la connexion
    await client.query(`
      DROP TABLE IF EXISTS utilisateur CASCADE;
      
      CREATE TABLE utilisateur (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nom VARCHAR(100),
        prenom VARCHAR(100),
        email VARCHAR(255) NOT NULL UNIQUE,
        mot_de_passe TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'enseignant',
        actif BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('✅ Table utilisateur créée!');
    
    // Ajouter un utilisateur de test (sans hash, juste du plain text pour tester)
    await client.query(`
      INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, role) 
      VALUES ($1, $2, $3, $4, $5)
    `, ['Dupont', 'Jean', 'prof@isen.fr', 'password123', 'enseignant']);
    
    console.log('✅ Utilisateur de test créé: prof@isen.fr / password123');
  } catch (err) {
    console.error('❌ Erreur:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

setup();
