import { requireAuth } from "@/app/lib/auth";
import { getTeacherDashboardStats } from "@/app/actions";
import { DashboardContent } from "@/app/components/DashboardContent";

export default async function DashboardPage() {
  const user = await requireAuth();
  const result = await getTeacherDashboardStats(user.userId);
  const stats = result.success ? result.data : null;

  return (
    <DashboardContent
      teacherName={`${user.firstname} ${user.surname}`}
      stats={stats}
    />
  );
}
