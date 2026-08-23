import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout";
import { MemberList } from "@/features/members/components/MemberList";

export default function MembersPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="members">
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
          <MemberList />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
