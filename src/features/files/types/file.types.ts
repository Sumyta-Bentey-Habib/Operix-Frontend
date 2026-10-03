export interface FileAssetSummary {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedById?: string;
  uploadedBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export interface FileAttachmentResponse {
  id: string;
  file: FileAssetSummary;
  downloadUrl: string;
}

export interface SubmissionAttachmentResponse {
  file: FileAssetSummary;
  downloadUrl: string;
}
