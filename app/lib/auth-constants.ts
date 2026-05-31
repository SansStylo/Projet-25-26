/**
 * app/lib/auth-constants.ts
 * 
 * Types et constantes d'authentification
 * 
 * Ce fichier sert à ccause de nextjs qui ne gère pas les types dans les fonctions server,
 *  on doit définir les types d'utilisateur et les labels de rôle dans un fichier séparé pour 
 * pouvoir les utiliser à la fois dans auth.ts et dans les pages protégées. 
 */

export type UserLevel = 0 | 1 | 2;

export const ROLE_LABELS = {
  0: "Enseignant",
  1: "Responsable pédagogique",
  2: "Administrateur",
} as const;
