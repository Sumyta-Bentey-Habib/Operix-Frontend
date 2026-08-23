import type { Metadata } from "next";
import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AdminList } from "@/features/admins/components/AdminList";

export const metadata: Metadata = {
  title: "Admins - Operix",
  description: "Manage Operix Admin accounts.",
};

export default function AdminsPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="admins">
        <PermissionGuard allowedRoles={["SUPER_ADMIN"]}>
          <AdminList />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
