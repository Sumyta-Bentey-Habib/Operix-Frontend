import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { InventoryCategoryDetails } from "@/features/inventory";

export default async function InventoryCategoryDetailsPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;

  return (
    <AuthGuard>
      <DashboardShell activeTab="inventory" header={<></>}>
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
          <InventoryCategoryDetails categoryId={categoryId} />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
