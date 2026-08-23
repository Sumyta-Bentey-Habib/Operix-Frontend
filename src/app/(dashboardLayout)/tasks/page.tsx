import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout";
import { TaskList } from "@/features/tasks/components/TaskList";

export default function TasksPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="tasks">
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "MEMBER"]}>
          <TaskList />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
