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
  updatedAt: string;
  lastEditedBy?: { id: string; name: string } | null;
  attachments?: SubmissionAttachmentResponse[];
}

export interface CreateSubmissionInput {
  submissionText: string;
  files: File[];
}

export interface UpdateSubmissionInput {
  submissionText: string;
}
