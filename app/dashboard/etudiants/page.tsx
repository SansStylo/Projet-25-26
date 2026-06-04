import { requireAuth } from "@/app/lib/auth";
import { StudentSearchContent } from '@/app/components/StudentSearchContent';

export default async function TeacherStudentsPage() {
  const user = await requireAuth();
  return <StudentSearchContent role="teacher" teacherIdStr={user.userId.toString()} />;
}
