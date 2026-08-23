import type { FileAssetSummary } from "@/features/files";

export interface AttachmentResponse {
  id: string;
  file: FileAssetSummary;
  downloadUrl: string;
}

export interface SelectedAttachmentFile {
  file: File;
  error: string | null;
}
