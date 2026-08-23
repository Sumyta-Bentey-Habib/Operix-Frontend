import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { InventoryAssignmentDetails } from "@/features/inventory";

export default async function InventoryAssignmentDetailsPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;

  return (
    <AuthGuard>
      <DashboardShell activeTab="inventory" header={<></>}>
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "MEMBER"]}>
          <InventoryAssignmentDetails assignmentId={assignmentId} />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
