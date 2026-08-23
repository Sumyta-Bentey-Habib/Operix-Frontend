import type { Metadata } from "next";
import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AdminDetails } from "@/features/admins/components/AdminDetails";

export const metadata: Metadata = {
  title: "Admin Detail - Operix",
  description: "View and manage an Operix Admin account.",
};

export default async function AdminDetailPage({
  params,
}: {
  params: Promise<{ adminId: string }>;
}) {
  const { adminId } = await params;

  return (
    <AuthGuard>
      <DashboardShell activeTab="admins">
        <PermissionGuard allowedRoles={["SUPER_ADMIN"]}>
          <AdminDetails adminId={adminId} />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
