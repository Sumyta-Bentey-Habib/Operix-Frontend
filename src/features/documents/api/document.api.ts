import { apiRequest } from "@/lib/api";
import type { DocumentListQuery, DocumentListResponse } from "../types/document.types";

export const documentApi = {
  list: (query: DocumentListQuery, options?: { signal?: AbortSignal }) =>
    apiRequest<DocumentListResponse>("/documents", {
      method: "GET",
      query: { ...query },
      signal: options?.signal,
    }),
};
