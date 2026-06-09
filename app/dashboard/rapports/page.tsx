import { getCurrentUser } from "@/app/lib/auth";
import { getTeacherSubjects } from "@/app/actions";
import { EnseignantRapportsContent } from "@/app/components/enseignant/RapportsContent";

export default async function RapportsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const teacherSubjects = await getTeacherSubjects(user.userId);
  const subjects = teacherSubjects.map((ta) => ({
    subjectId: ta.subjectId,
    label: ta.subject.label,
  }));

  return (
    <EnseignantRapportsContent
      subjects={subjects}
      teacherId={user.userId.toString()}
    />
  );
}
