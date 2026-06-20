/**
 * app/layout.tsx
 * 
 * Layout racine (RootLayout) de l'application Next.js
 * 
 * Rôle:
 * - Définit la structure HTML globale de l'application
 * - Configure les métadonnées du site (titre, description)
 * - Charge la police Inter depuis Google Fonts
 * - Applique les styles globaux à tous les enfants
 * 
 * Fonctionnement:
 * - Structure HTML avec langue française
 * - Body avec classe de style global et hauteur minimale
 * - Les enfants (pages) sont injected dans {children}
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Junia'lytics",
  description: "Plateforme de suivi pédagogique",
  icons: {
    icon:"/logo.png?v=2"},
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          })()
        `}} />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}