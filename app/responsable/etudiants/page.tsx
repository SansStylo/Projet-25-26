/**
 * app/responsable/etudiants/page.tsx
 * 
 * Page de gestion des étudiants pour les responsables pédagogiques
 * 
 * Rôle:
 * - Affiche une interface de recherche des étudiants
 * - Permet de voir la fiche complète d'un étudiant
 * - Affiche les matières suivies et les notes
 * 
 * Fonctionnement:
 * - Utilise le composant StudentSearchContent qui inclut le layout complet
 * - Design responsive utilisant Tailwind CSS
 */

"use client";

import React from 'react';
import { StudentSearchContent } from '@/app/components/StudentSearchContent';

export default function ResponsableStudentsPage() {
  return <StudentSearchContent role="responsable" />;
}
