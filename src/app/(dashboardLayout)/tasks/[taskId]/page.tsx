import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout";
import { TaskDetails } from "@/features/tasks/components/TaskDetails";

export interface TaskDetailsPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function TaskDetailsPage({ params }: TaskDetailsPageProps) {
  const { taskId } = await params;

  return (
    <AuthGuard>
      <DashboardShell activeTab="tasks">
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "MEMBER"]}>
          <TaskDetails taskId={taskId} />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
