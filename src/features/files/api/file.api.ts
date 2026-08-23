import { apiDownload } from "@/lib/api";

export const fileApi = {
  download: (fileId: string) => apiDownload(`/files/${fileId}/download`),
};
