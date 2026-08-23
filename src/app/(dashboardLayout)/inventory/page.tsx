import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { InventoryLanding } from "@/features/inventory";

export default function InventoryPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="inventory" header={<></>}>
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "MEMBER"]}>
          <InventoryLanding />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
