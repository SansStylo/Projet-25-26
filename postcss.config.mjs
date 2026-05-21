/**
 * postcss.config.mjs
 * 
 * Configuration PostCSS
 * 
 * Rôle:
 * - Configure les transformations CSS via PostCSS
 * - Active le plugin Tailwind CSS v4 pour traiter les classes utilitaires
 * 
 * Fonctionnement:
 * - Transforme les directives Tailwind (@tailwind, etc.) en CSS
 * - Génère les classes utilitaires nécessaires au design
 */

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
