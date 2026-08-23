import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { InventoryTransactionList } from "@/features/inventory";

export default function InventoryTransactionsPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="inventory" header={<></>}>
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
          <InventoryTransactionList />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
