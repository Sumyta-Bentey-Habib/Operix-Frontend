import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout";
import { TaskDetails } from "@/features/tasks/components/TaskDetails";

import { TASK_DETAILS_STRINGS } from "@/utils/task-strings";

export interface TaskDetailsPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function TaskDetailsPage({ params }: TaskDetailsPageProps) {
  const { taskId } = await params;

  return (
    <AuthGuard>
      <DashboardShell activeTab="tasks" header={<></>} title={TASK_DETAILS_STRINGS.eyebrow}>
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "MEMBER"]}>
          <TaskDetails taskId={taskId} />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
