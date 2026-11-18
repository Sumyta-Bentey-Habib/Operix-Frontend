import { apiMultipartRequest, apiRequest } from "@/lib/api";
import type { PaginatedResponse } from "@/types/pagination";
import type { SubmissionAttachmentResponse } from "@/features/files";
import type {
  CreateSubmissionInput,
  Submission,
  UpdateSubmissionInput,
} from "../types/submission.types";

const buildSubmissionFormData = (input: CreateSubmissionInput): FormData => {
  const formData = new FormData();
  formData.append("submissionText", input.submissionText.trim());
  input.files.forEach((file) => formData.append("files", file));
  return formData;
};

export const submissionApi = {
  listForTask: (
    taskId: string,
    params: { page: number; limit: number },
    options?: { signal?: AbortSignal },
  ): Promise<PaginatedResponse<Submission>> =>
    apiRequest(`/tasks/${taskId}/submissions`, {
      query: {
        page: params.page,
        limit: params.limit,
      },
      signal: options?.signal,
    }),

  getById: (submissionId: string, options?: { signal?: AbortSignal }): Promise<Submission> =>
    apiRequest(`/submissions/${submissionId}`, {
      signal: options?.signal,
    }),

  listAttachments: (
    submissionId: string,
    options?: { signal?: AbortSignal },
  ): Promise<SubmissionAttachmentResponse[]> =>
    apiRequest(`/submissions/${submissionId}/attachments`, {
      signal: options?.signal,
    }),

  create: (taskId: string, input: CreateSubmissionInput): Promise<Submission> =>
    apiMultipartRequest(`/tasks/${taskId}/submissions`, buildSubmissionFormData(input), {
      method: "POST",
    }),

  update: (submissionId: string, input: UpdateSubmissionInput): Promise<Submission> =>
    apiRequest(`/submissions/${submissionId}`, {
      method: "PATCH",
      json: input,
    }),

  uploadAttachments: (
    submissionId: string,
    files: File[],
  ): Promise<SubmissionAttachmentResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    return apiMultipartRequest(`/submissions/${submissionId}/attachments`, formData, {
      method: "POST",
    });
  },

  deleteAttachment: (submissionId: string, fileId: string): Promise<void> =>
    apiRequest(`/submissions/${submissionId}/attachments/${fileId}`, {
      method: "DELETE",
    }),
};
