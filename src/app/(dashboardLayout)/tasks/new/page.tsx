import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout";
import { TaskCreatePage } from "@/features/tasks/components/TaskCreatePage";

export default function NewTaskPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="tasks">
        <PermissionGuard allowedRoles={["ADMIN"]}>
          <TaskCreatePage />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
