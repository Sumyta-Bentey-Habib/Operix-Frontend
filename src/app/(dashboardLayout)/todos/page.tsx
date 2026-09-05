import type { Metadata } from "next";
import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { TodoList } from "@/features/todos";

export const metadata: Metadata = {
  title: "Admin Todo List - Operix",
  description: "Session-scoped tasks and operational checklist for administrators.",
};

export default function AdminTodosPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="todos">
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
          <TodoList />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
