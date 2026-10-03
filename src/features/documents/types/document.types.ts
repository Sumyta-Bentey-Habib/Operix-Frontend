import type { PaginatedResponse } from "@/types/pagination";

export type DocumentSourceType = "TASK_ATTACHMENT" | "SUBMISSION_ATTACHMENT";

export type DocumentSort = "CREATED_AT_DESC" | "CREATED_AT_ASC";

export interface DocumentUploader {
  id: string;
  name: string;
}

export interface DocumentTaskReference {
  id: string;
  title: string;
}

export interface DocumentSubmissionReference {
  id: string;
  version: number;
}

export interface DocumentListItem {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy: DocumentUploader;
  source: {
    type: DocumentSourceType;
    task: DocumentTaskReference | null;
    submission: DocumentSubmissionReference | null;
  };
  downloadUrl: string;
}

export type DocumentListResponse = PaginatedResponse<DocumentListItem>;

export interface DocumentFilterState {
  search: string;
  source: "" | DocumentSourceType;
  memberId: string;
  teamId: string;
  sort: DocumentSort;
}

export const DEFAULT_DOCUMENT_FILTERS: DocumentFilterState = {
  search: "",
  source: "",
  memberId: "",
  teamId: "",
  sort: "CREATED_AT_DESC",
};

export interface DocumentListQuery {
  page: number;
  limit: number;
  search?: string;
  source?: DocumentSourceType;
  memberId?: string;
  teamId?: string;
  sort?: DocumentSort;
}

export const buildDocumentListQuery = (input: {
  filters: DocumentFilterState;
  page: number;
  limit: number;
}): DocumentListQuery => {
  const query: DocumentListQuery = {
    page: input.page,
    limit: input.limit,
  };

  const search = input.filters.search.trim();
  if (search) query.search = search;
  if (input.filters.source) query.source = input.filters.source;
  if (input.filters.memberId) query.memberId = input.filters.memberId;
  if (input.filters.teamId) query.teamId = input.filters.teamId;
  if (input.filters.sort) query.sort = input.filters.sort;

  return query;
};
