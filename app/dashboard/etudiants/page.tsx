/**
 * app/dashboard/etudiants/page.tsx
 * 
 * Page de recherche et gestion des étudiants - Enseignants
 * 
 * Rôle:
 * - Interface de recherche des étudiants avec affichage de leurs fiches complètes
 * - Permet de consulter les matières suivies et les notes des étudiants
 * - Protégée par dashboard/layout.tsx - seuls les enseignants (level=0) peuvent accéder
 * 
 * Fonctionnement:
 * - Utilise le composant StudentSearchContent avec role="teacher"
 * - Affiche les liens appropriés pour les enseignants (/dashboard/*)
 * - Design responsive et adapté aux enseignants (sidebar enseignant)
 */

"use client";

import React from 'react';
import { StudentSearchContent } from '@/app/components/StudentSearchContent';

export default function TeacherStudentsPage() {
  return <StudentSearchContent role="teacher" />;
}