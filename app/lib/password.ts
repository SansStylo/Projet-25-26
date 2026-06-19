/**
 * app/lib/password.ts
 *
 * Utilitaires de hachage et de vérification des mots de passe
 *
 * - hashPassword : transforme un mot de passe en clair en hash bcrypt (à stocker en BDD)
 * - verifyPassword : compare un mot de passe en clair avec un hash bcrypt stocké
 */

"use server";

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
