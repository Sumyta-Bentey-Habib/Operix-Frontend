import type { FileAttachmentResponse } from "@/features/files";

export interface Submission {
  id: string;
  taskId: string;
  submittedById: string;
  version: number;
  submissionText: string | null;
  submittedAt: string;
  createdAt: string;
  attachments?: FileAttachmentResponse[];
}

export interface CreateSubmissionInput {
  submissionText: string;
  files: File[];
}
