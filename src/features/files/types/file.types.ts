export interface FileAssetSummary {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedById: string;
  createdAt: string;
}

export interface FileAttachmentResponse {
  id: string;
  file: FileAssetSummary;
  downloadUrl: string;
}
