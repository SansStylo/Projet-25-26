-- CreateEnum
CREATE TYPE "role_utilisateur" AS ENUM ('administrateur', 'enseignant', 'responsable_pedagogique');

-- CreateEnum
CREATE TYPE "type_audit" AS ENUM ('creation', 'modification', 'suppression');

-- CreateTable
CREATE TABLE "utilisateur" (
    "id" UUID NOT NULL,
    "nom" VARCHAR(100) NOT NULL,
    "prenom" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mot_de_passe" TEXT NOT NULL,
    "role" "role_utilisateur" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "derniere_connexion" TIMESTAMP(3),
    "level" SMALLINT NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateur_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "class" (
    "ClassID" SMALLSERIAL NOT NULL,
    "Label" VARCHAR(100) NOT NULL,

    CONSTRAINT "class_pkey" PRIMARY KEY ("ClassID")
);

-- CreateTable
CREATE TABLE "group" (
    "GroupID" BIGSERIAL NOT NULL,
    "Label" VARCHAR(100) NOT NULL,

    CONSTRAINT "group_pkey" PRIMARY KEY ("GroupID")
);

-- CreateTable
CREATE TABLE "student" (
    "StudentID" BIGSERIAL NOT NULL,
    "ClassID" SMALLINT NOT NULL,
    "Firstname" VARCHAR(100) NOT NULL,
    "Surname" VARCHAR(100) NOT NULL,

    CONSTRAINT "student_pkey" PRIMARY KEY ("StudentID")
);

-- CreateTable
CREATE TABLE "student_assignments" (
    "StudentID" BIGINT NOT NULL,
    "GroupID" BIGINT NOT NULL,

    CONSTRAINT "student_assignments_pkey" PRIMARY KEY ("StudentID","GroupID")
);

-- CreateTable
CREATE TABLE "subject" (
    "SubjectID" SMALLSERIAL NOT NULL,
    "Label" VARCHAR(150) NOT NULL,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("SubjectID")
);

-- CreateTable
CREATE TABLE "subject_assignments" (
    "StudentID" BIGINT NOT NULL,
    "SubjectID" SMALLINT NOT NULL,

    CONSTRAINT "subject_assignments_pkey" PRIMARY KEY ("StudentID","SubjectID")
);

-- CreateTable
CREATE TABLE "teacher_assignments" (
    "SubjectID" SMALLINT NOT NULL,
    "TeacherID" UUID NOT NULL,

    CONSTRAINT "teacher_assignments_pkey" PRIMARY KEY ("SubjectID","TeacherID")
);

-- CreateTable
CREATE TABLE "subject_adding_cache" (
    "UserID" UUID NOT NULL,
    "SubjectID" SMALLINT NOT NULL,
    "Students" TEXT NOT NULL,

    CONSTRAINT "subject_adding_cache_pkey" PRIMARY KEY ("UserID","SubjectID")
);

-- CreateTable
CREATE TABLE "assessment" (
    "AssessmentID" BIGSERIAL NOT NULL,
    "SubjectID" SMALLINT NOT NULL,
    "Date" DATE NOT NULL,
    "MaxGrade" SMALLINT NOT NULL,
    "Weight" SMALLINT NOT NULL,
    "Teacher" VARCHAR(150) NOT NULL,
    "Label" VARCHAR(200) NOT NULL,

    CONSTRAINT "assessment_pkey" PRIMARY KEY ("AssessmentID")
);

-- CreateTable
CREATE TABLE "grade" (
    "AssessmentID" BIGINT NOT NULL,
    "StudentID" BIGINT NOT NULL,
    "Value" SMALLINT NOT NULL,
    "Feedback" TEXT,

    CONSTRAINT "grade_pkey" PRIMARY KEY ("AssessmentID","StudentID")
);

-- CreateTable
CREATE TABLE "audit_modification" (
    "id" BIGSERIAL NOT NULL,
    "utilisateur_id" UUID NOT NULL,
    "AssessmentID" BIGINT,
    "StudentID" BIGINT,
    "type_action" "type_audit" NOT NULL,
    "ancienne_valeur" JSONB,
    "nouvelle_valeur" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_modification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "session_utilisateur_id_idx" ON "session"("utilisateur_id");

-- CreateIndex
CREATE INDEX "session_token_idx" ON "session"("token");

-- CreateIndex
CREATE INDEX "audit_connexion_utilisateur_id_idx" ON "audit_connexion"("utilisateur_id");

-- CreateIndex
CREATE INDEX "audit_modification_utilisateur_id_idx" ON "audit_modification"("utilisateur_id");

-- CreateIndex
CREATE INDEX "audit_modification_AssessmentID_StudentID_idx" ON "audit_modification"("AssessmentID", "StudentID");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_connexion" ADD CONSTRAINT "audit_connexion_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_ClassID_fkey" FOREIGN KEY ("ClassID") REFERENCES "class"("ClassID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assignments" ADD CONSTRAINT "student_assignments_StudentID_fkey" FOREIGN KEY ("StudentID") REFERENCES "student"("StudentID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assignments" ADD CONSTRAINT "student_assignments_GroupID_fkey" FOREIGN KEY ("GroupID") REFERENCES "group"("GroupID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_assignments" ADD CONSTRAINT "subject_assignments_StudentID_fkey" FOREIGN KEY ("StudentID") REFERENCES "student"("StudentID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_assignments" ADD CONSTRAINT "subject_assignments_SubjectID_fkey" FOREIGN KEY ("SubjectID") REFERENCES "subject"("SubjectID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_SubjectID_fkey" FOREIGN KEY ("SubjectID") REFERENCES "subject"("SubjectID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_TeacherID_fkey" FOREIGN KEY ("TeacherID") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_adding_cache" ADD CONSTRAINT "subject_adding_cache_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "utilisateur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_adding_cache" ADD CONSTRAINT "subject_adding_cache_SubjectID_fkey" FOREIGN KEY ("SubjectID") REFERENCES "subject"("SubjectID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assessment" ADD CONSTRAINT "assessment_SubjectID_fkey" FOREIGN KEY ("SubjectID") REFERENCES "subject"("SubjectID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade" ADD CONSTRAINT "grade_AssessmentID_fkey" FOREIGN KEY ("AssessmentID") REFERENCES "assessment"("AssessmentID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade" ADD CONSTRAINT "grade_StudentID_fkey" FOREIGN KEY ("StudentID") REFERENCES "student"("StudentID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_modification" ADD CONSTRAINT "audit_modification_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_modification" ADD CONSTRAINT "audit_modification_AssessmentID_StudentID_fkey" FOREIGN KEY ("AssessmentID", "StudentID") REFERENCES "grade"("AssessmentID", "StudentID") ON DELETE SET NULL ON UPDATE CASCADE;
