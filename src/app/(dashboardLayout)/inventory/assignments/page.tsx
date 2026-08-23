import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { InventoryAssignmentList } from "@/features/inventory";

export default function InventoryAssignmentsPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="inventory" header={<></>}>
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "MEMBER"]}>
          <InventoryAssignmentList />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
