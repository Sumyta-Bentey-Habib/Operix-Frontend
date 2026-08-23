import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { InventoryItemCreate } from "@/features/inventory";

export default function InventoryItemCreatePage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="inventory" header={<></>}>
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
          <InventoryItemCreate />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
