import { AuthGuard, PermissionGuard } from "@/components/auth";
import { DashboardShell } from "@/components/layout";
import { SubmissionDetails } from "@/features/submissions";

export interface SubmissionDetailsPageProps {
  params: Promise<{
    submissionId: string;
  }>;
}

export default async function SubmissionDetailsPage({ params }: SubmissionDetailsPageProps) {
  const { submissionId } = await params;

  return (
    <AuthGuard>
      <DashboardShell activeTab="tasks">
        <PermissionGuard allowedRoles={["SUPER_ADMIN", "ADMIN", "MEMBER"]}>
          <SubmissionDetails submissionId={submissionId} />
        </PermissionGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
