import { apiMultipartRequest, apiRequest } from "@/lib/api";
import type { AttachmentResponse } from "../types/task-attachment.types";

export const taskAttachmentApi = {
  list: (taskId: string, options?: { signal?: AbortSignal }): Promise<AttachmentResponse[]> =>
    apiRequest(`/tasks/${taskId}/attachments`, {
      signal: options?.signal,
    }),

  upload: (taskId: string, files: File[]): Promise<AttachmentResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    return apiMultipartRequest(`/tasks/${taskId}/attachments`, formData, {
      method: "POST",
    });
  },

  remove: (taskId: string, attachmentId: string): Promise<void> =>
    apiRequest(`/tasks/${taskId}/attachments/${attachmentId}`, {
      method: "DELETE",
    }),
};
