import type { SubmissionAttachmentResponse } from "@/features/files";

export interface Submission {
  id: string;
  taskId: string;
  submittedById: string;
  submittedBy?: { id?: string; name?: string | null } | null;
  version: number;
  submissionText: string | null;
  submittedAt: string;
  createdAt: string;
  attachments?: SubmissionAttachmentResponse[];
}

export interface CreateSubmissionInput {
  submissionText: string;
  files: File[];
}
