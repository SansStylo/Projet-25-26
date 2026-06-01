-- CreateTable
CREATE TABLE "user" (
    "user_id" BIGSERIAL NOT NULL,
    "mail" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "firstname" VARCHAR(100) NOT NULL,
    "surname" VARCHAR(100) NOT NULL,
    "level" SMALLINT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "session" (
    "session_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "student" (
    "student_id" BIGSERIAL NOT NULL,
    "class_id" SMALLINT,
    "firstname" VARCHAR(100) NOT NULL,
    "surname" VARCHAR(100) NOT NULL,

    CONSTRAINT "student_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "class" (
    "class_id" SMALLSERIAL NOT NULL,
    "label" VARCHAR(100) NOT NULL,

    CONSTRAINT "class_pkey" PRIMARY KEY ("class_id")
);

-- CreateTable
CREATE TABLE "subject" (
    "subject_id" SMALLSERIAL NOT NULL,
    "label" VARCHAR(100) NOT NULL,

    CONSTRAINT "subject_pkey" PRIMARY KEY ("subject_id")
);

-- CreateTable
CREATE TABLE "student_assignments" (
    "student_id" BIGINT NOT NULL,
    "group_id" BIGINT NOT NULL,

    CONSTRAINT "student_assignments_pkey" PRIMARY KEY ("student_id","group_id")
);

-- CreateTable
CREATE TABLE "group" (
    "group_id" BIGSERIAL NOT NULL,
    "label" VARCHAR(100) NOT NULL,

    CONSTRAINT "group_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "subject_assignments" (
    "student_id" BIGINT NOT NULL,
    "subject_id" SMALLINT NOT NULL,

    CONSTRAINT "subject_assignments_pkey" PRIMARY KEY ("student_id","subject_id")
);

-- CreateTable
CREATE TABLE "teacher_assignments" (
    "subject_id" SMALLINT NOT NULL,
    "teacher_id" BIGINT NOT NULL,

    CONSTRAINT "teacher_assignments_pkey" PRIMARY KEY ("subject_id","teacher_id")
);

-- CreateTable
CREATE TABLE "subject_adding_cache" (
    "user_id" BIGINT NOT NULL,
    "subject_id" SMALLINT NOT NULL,
    "students" TEXT NOT NULL,

    CONSTRAINT "subject_adding_cache_pkey" PRIMARY KEY ("user_id","subject_id")
);

-- CreateTable
CREATE TABLE "assessment" (
    "assessment_id" BIGSERIAL NOT NULL,
    "subject_id" SMALLINT NOT NULL,
    "date" DATE NOT NULL,
    "max_grade" SMALLINT NOT NULL,
    "weight" SMALLINT NOT NULL,
    "teacher" VARCHAR(100) NOT NULL,
    "label" VARCHAR(255) NOT NULL,

    CONSTRAINT "assessment_pkey" PRIMARY KEY ("assessment_id")
);

-- CreateTable
CREATE TABLE "grade" (
    "assessment_id" BIGINT NOT NULL,
    "student_id" BIGINT NOT NULL,
    "value" SMALLINT NOT NULL,
    "feedback" TEXT NOT NULL,

    CONSTRAINT "grade_pkey" PRIMARY KEY ("assessment_id","student_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_mail_key" ON "user"("mail");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student" ADD CONSTRAINT "student_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "class"("class_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assignments" ADD CONSTRAINT "student_assignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_assignments" ADD CONSTRAINT "student_assignments_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "group"("group_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_assignments" ADD CONSTRAINT "subject_assignments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_assignments" ADD CONSTRAINT "subject_assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subject"("subject_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subject"("subject_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_adding_cache" ADD CONSTRAINT "subject_adding_cache_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subject_adding_cache" ADD CONSTRAINT "subject_adding_cache_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subject"("subject_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade" ADD CONSTRAINT "grade_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "assessment"("assessment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade" ADD CONSTRAINT "grade_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("student_id") ON DELETE CASCADE ON UPDATE CASCADE;
