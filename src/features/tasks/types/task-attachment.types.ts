import type { FileAttachmentResponse } from "@/features/files";

export type AttachmentResponse = FileAttachmentResponse;

export interface SelectedAttachmentFile {
  file: File;
  error: string | null;
}
