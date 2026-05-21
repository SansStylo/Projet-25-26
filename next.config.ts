/**
 * next.config.ts
 * 
 * Configuration Next.js
 * 
 * Rôle:
 * - Configure les paramètres de build et d'exécution de Next.js
 * - Définit les options du compilateur et des origines autorisées
 * 
 * Configuration actuelle:
 * - allowedDevOrigins: ['*'] - Autorise toutes les origines en développement
 */

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
};
module.exports = {
  allowedDevOrigins: ['*'],
}
export default nextConfig;
