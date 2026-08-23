import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout";
import { TeamList } from "@/features/teams/components/TeamList";

export default function TeamsPage() {
  return (
    <AuthGuard>
      <DashboardShell activeTab="teams">
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
          <TeamList />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
