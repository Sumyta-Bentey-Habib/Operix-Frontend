import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout";
import { TeamDetails } from "@/features/teams/components/TeamDetails";

export interface TeamDetailsPageProps {
  params: Promise<{
    teamId: string;
  }>;
}

export default async function TeamDetailsPage({ params }: TeamDetailsPageProps) {
  const { teamId } = await params;

  return (
    <AuthGuard>
      <DashboardShell activeTab="teams">
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
          <TeamDetails teamId={teamId} />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
