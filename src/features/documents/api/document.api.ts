import { apiRequest } from "@/lib/api";
import type { DocumentAiAnalysis } from "../types/document-ai.types";
import type { DocumentListQuery, DocumentListResponse } from "../types/document.types";

export const documentApi = {
  list: (query: DocumentListQuery, options?: { signal?: AbortSignal }) =>
    apiRequest<DocumentListResponse>("/documents", {
      method: "GET",
      query: { ...query },
      signal: options?.signal,
    }),
  analyze: (documentId: string, signal?: AbortSignal): Promise<DocumentAiAnalysis> =>
    apiRequest(`/documents/${documentId}/ai-analysis`, {
      method: "POST",
      ...(signal ? { signal } : {}),
    }),
};
