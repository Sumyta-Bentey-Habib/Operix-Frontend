import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { InventoryCategoryList } from "@/features/inventory";

export default function InventoryCategoriesPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="inventory" header={<></>}>
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
          <InventoryCategoryList />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
