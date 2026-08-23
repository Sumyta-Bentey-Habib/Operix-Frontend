import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout";
import { MemberDetails } from "@/features/members/components/MemberDetails";

interface MemberDetailsPageProps {
  params: Promise<{
    memberId: string;
  }>;
}

export default async function MemberDetailsPage({
  params,
}: MemberDetailsPageProps) {
  const { memberId } = await params;

  return (
    <AuthGuard>
      <DashboardShell activeTab="members">
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
          <MemberDetails memberId={memberId} />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
