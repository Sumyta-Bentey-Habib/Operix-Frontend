import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout";
import { TaskCreatePage } from "@/features/tasks/components/TaskCreatePage";
import { TASK_CREATE_STRINGS } from "@/utils/task-strings";

export default function NewTaskPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="tasks" hideHeader title={TASK_CREATE_STRINGS.title}>
        <PermissionGuard allowedRoles={["ADMIN"]}>
          <TaskCreatePage />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}

