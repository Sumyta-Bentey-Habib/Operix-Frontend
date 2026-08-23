const BYTES_PER_KIB = 1024;
const BYTES_PER_MIB = BYTES_PER_KIB * 1024;

export const formatFileSize = (sizeBytes: number): string => {
  if (sizeBytes < BYTES_PER_KIB) {
    return `${sizeBytes} B`;
  }

  if (sizeBytes < BYTES_PER_MIB) {
    return `${(sizeBytes / BYTES_PER_KIB).toFixed(sizeBytes < 10 * BYTES_PER_KIB ? 1 : 0)} KB`;
  }

  return `${(sizeBytes / BYTES_PER_MIB).toFixed(1)} MB`;
};

export const formatFileType = (mimeType: string, originalName: string): string => {
  const lowerName = originalName.toLowerCase();

  if (mimeType === "application/pdf" || lowerName.endsWith(".pdf")) return "PDF";
  if (mimeType === "image/jpeg" || lowerName.endsWith(".jpg") || lowerName.endsWith(".jpeg")) {
    return "JPEG image";
  }
  if (mimeType === "image/png" || lowerName.endsWith(".png")) return "PNG image";
  if (mimeType === "image/webp" || lowerName.endsWith(".webp")) return "WebP image";
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  ) {
    return "Word document";
  }
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    lowerName.endsWith(".xlsx")
  ) {
    return "Excel workbook";
  }
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    lowerName.endsWith(".pptx")
  ) {
    return "PowerPoint deck";
  }

  return mimeType || "File";
};
