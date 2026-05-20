/*
  Warnings:

  - You are about to drop the `absence` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `affectation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `alerte` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `audit_log` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `enseignant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `etudiant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `evaluation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `formation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `groupe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `import_csv` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `matiere` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `moyenne_matiere` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `moyenne_semestre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `note` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `parametre_systeme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `programme` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `promotion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `rapport` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `remarque` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `score_risque` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `simulation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "absence" DROP CONSTRAINT "absence_affectation_id_fkey";

-- DropForeignKey
ALTER TABLE "absence" DROP CONSTRAINT "absence_etudiant_id_fkey";

-- DropForeignKey
ALTER TABLE "affectation" DROP CONSTRAINT "affectation_enseignant_id_fkey";

-- DropForeignKey
ALTER TABLE "affectation" DROP CONSTRAINT "affectation_groupe_id_fkey";

-- DropForeignKey
ALTER TABLE "affectation" DROP CONSTRAINT "affectation_matiere_id_fkey";

-- DropForeignKey
ALTER TABLE "alerte" DROP CONSTRAINT "alerte_assignee_a_fkey";

-- DropForeignKey
ALTER TABLE "alerte" DROP CONSTRAINT "alerte_etudiant_id_fkey";

-- DropForeignKey
ALTER TABLE "alerte" DROP CONSTRAINT "alerte_resolue_par_fkey";

-- DropForeignKey
ALTER TABLE "audit_log" DROP CONSTRAINT "audit_log_effectue_par_fkey";

-- DropForeignKey
ALTER TABLE "enseignant" DROP CONSTRAINT "enseignant_utilisateur_id_fkey";

-- DropForeignKey
ALTER TABLE "etudiant" DROP CONSTRAINT "etudiant_groupe_id_fkey";

-- DropForeignKey
ALTER TABLE "etudiant" DROP CONSTRAINT "etudiant_promotion_id_fkey";

-- DropForeignKey
ALTER TABLE "evaluation" DROP CONSTRAINT "evaluation_affectation_id_fkey";

-- DropForeignKey
ALTER TABLE "groupe" DROP CONSTRAINT "groupe_promotion_id_fkey";

-- DropForeignKey
ALTER TABLE "import_csv" DROP CONSTRAINT "import_csv_importe_par_fkey";

-- DropForeignKey
ALTER TABLE "moyenne_matiere" DROP CONSTRAINT "moyenne_matiere_etudiant_id_fkey";

-- DropForeignKey
ALTER TABLE "moyenne_matiere" DROP CONSTRAINT "moyenne_matiere_matiere_id_fkey";

-- DropForeignKey
ALTER TABLE "moyenne_semestre" DROP CONSTRAINT "moyenne_semestre_etudiant_id_fkey";

-- DropForeignKey
ALTER TABLE "note" DROP CONSTRAINT "note_etudiant_id_fkey";

-- DropForeignKey
ALTER TABLE "note" DROP CONSTRAINT "note_evaluation_id_fkey";

-- DropForeignKey
ALTER TABLE "note" DROP CONSTRAINT "note_saisie_par_fkey";

-- DropForeignKey
ALTER TABLE "programme" DROP CONSTRAINT "programme_matiere_id_fkey";

-- DropForeignKey
ALTER TABLE "programme" DROP CONSTRAINT "programme_promotion_id_fkey";

-- DropForeignKey
ALTER TABLE "promotion" DROP CONSTRAINT "promotion_formation_id_fkey";

-- DropForeignKey
ALTER TABLE "promotion" DROP CONSTRAINT "promotion_responsable_id_fkey";

-- DropForeignKey
ALTER TABLE "rapport" DROP CONSTRAINT "rapport_genere_par_fkey";

-- DropForeignKey
ALTER TABLE "remarque" DROP CONSTRAINT "remarque_auteur_id_fkey";

-- DropForeignKey
ALTER TABLE "remarque" DROP CONSTRAINT "remarque_etudiant_id_fkey";

-- DropForeignKey
ALTER TABLE "score_risque" DROP CONSTRAINT "score_risque_etudiant_id_fkey";

-- DropForeignKey
ALTER TABLE "simulation" DROP CONSTRAINT "simulation_cree_par_fkey";

-- AlterTable
ALTER TABLE "utilisateur" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "derniere_connexion" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- DropTable
DROP TABLE "absence";

-- DropTable
DROP TABLE "affectation";

-- DropTable
DROP TABLE "alerte";

-- DropTable
DROP TABLE "audit_log";

-- DropTable
DROP TABLE "enseignant";

-- DropTable
DROP TABLE "etudiant";

-- DropTable
DROP TABLE "evaluation";

-- DropTable
DROP TABLE "formation";

-- DropTable
DROP TABLE "groupe";

-- DropTable
DROP TABLE "import_csv";

-- DropTable
DROP TABLE "matiere";

-- DropTable
DROP TABLE "moyenne_matiere";

-- DropTable
DROP TABLE "moyenne_semestre";

-- DropTable
DROP TABLE "note";

-- DropTable
DROP TABLE "parametre_systeme";

-- DropTable
DROP TABLE "programme";

-- DropTable
DROP TABLE "promotion";

-- DropTable
DROP TABLE "rapport";

-- DropTable
DROP TABLE "remarque";

-- DropTable
DROP TABLE "score_risque";

-- DropTable
DROP TABLE "simulation";

-- DropEnum
DROP TYPE "niveau_alerte";

-- DropEnum
DROP TYPE "semestre";

-- DropEnum
DROP TYPE "statut_alerte";

-- DropEnum
DROP TYPE "statut_etudiant";

-- DropEnum
DROP TYPE "statut_validation";

-- DropEnum
DROP TYPE "type_evaluation";

-- CreateTable
CREATE TABLE "session" (
    "id" UUID NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "ip_adresse" TEXT,
    "user_agent" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_connexion" (
    "id" BIGSERIAL NOT NULL,
    "utilisateur_id" UUID,
    "email_tente" VARCHAR(255),
    "succes" BOOLEAN NOT NULL,
    "ip_adresse" TEXT,
    "user_agent" TEXT,
    "raison_echec" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_connexion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_utilisateur_id_idx" ON "session"("utilisateur_id");

-- CreateIndex
CREATE INDEX "session_token_idx" ON "session"("token");

-- CreateIndex
CREATE INDEX "audit_connexion_utilisateur_id_idx" ON "audit_connexion"("utilisateur_id");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_connexion" ADD CONSTRAINT "audit_connexion_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
