import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { InventoryItemDetails } from "@/features/inventory";

export default async function InventoryItemDetailsPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;

  return (
    <AuthGuard>
      <DashboardShell activeTab="inventory" header={<></>}>
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
          <InventoryItemDetails itemId={itemId} />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
