"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Pagination } from "@/components/ui/Pagination";
import { useAuth } from "@/context/AuthContext";
import {
  FilePreviewModal,
  cleanFilename,
  fileApi,
  triggerBrowserDownload,
  type FilePreviewTarget,
} from "@/features/files";
import { getDocumentErrorMessage } from "../../document-errors";
import { useDocuments } from "../../hooks/use-documents";
import { DEFAULT_DOCUMENT_FILTERS, type DocumentListItem } from "../../types/document.types";
import { DocumentFilters } from "../DocumentFilters/DocumentFilters";
import { DocumentScopeOptions } from "../DocumentScopeOptions/DocumentScopeOptions";
import { DocumentList } from "../DocumentList/DocumentList";

const ROLE_DESCRIPTIONS: Record<string, string> = {
  MEMBER: "View and download documents you have uploaded through your tasks and submissions.",
  ADMIN: "View your documents and documents uploaded by members of your current teams.",
  SUPER_ADMIN: "View and audit documents across the organization.",
};

const ROLE_EMPTY_TITLES: Record<string, string> = {
  MEMBER: "No documents yet",
  ADMIN: "No documents available",
  SUPER_ADMIN: "No documents have been uploaded yet",
};

const ROLE_EMPTY_MESSAGES: Record<string, string> = {
  MEMBER: "Files you upload through Tasks and Submissions will appear here automatically.",
  ADMIN: "Your uploads and documents from members of your teams will appear here.",
  SUPER_ADMIN: "Uploaded task and submission files will appear here.",
};

const toPreviewTarget = (document: DocumentListItem): FilePreviewTarget => ({
  id: document.id,
  originalName: document.name,
  mimeType: document.mimeType,
  sizeBytes: document.sizeBytes,
  createdAt: document.uploadedAt,
});

export const DocumentsPage = () => {
  const { viewer } = useAuth();
  const {
    documents,
    meta,
    draftFilters,
    appliedFilters,
    loading,
    error,
    setPage,
    setDraftFilters,
    applyFilters,
    resetFilters,
    refresh,
  } = useDocuments(viewer);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<DocumentListItem | null>(null);

  if (!viewer) return null;

  const hasActiveFilters =
    JSON.stringify(appliedFilters) !== JSON.stringify(DEFAULT_DOCUMENT_FILTERS);

  const handleDownload = async (document: DocumentListItem) => {
    if (downloadingFileId) return;
    setDownloadingFileId(document.id);
    setDownloadError(null);

    try {
      const result = await fileApi.download(document.id);
      triggerBrowserDownload({
        blob: result.blob,
        filename: result.filename,
        fallbackFilename: cleanFilename(document.name),
      });
    } catch {
      setDownloadError("Unable to download this document. Try again.");
    } finally {
      setDownloadingFileId(null);
    }
  };

  return (
    <section className="grid gap-5">
      <header className="grid gap-1.5">
        <h1 className="text-[1.45rem] font-black text-[var(--text-primary)]">Documents</h1>
        <p className="max-w-[760px] text-[0.9rem] leading-normal text-[var(--text-secondary)]">
          {ROLE_DESCRIPTIONS[viewer.role] ?? ROLE_DESCRIPTIONS.MEMBER}
        </p>
        <p className="text-[0.82rem] font-extrabold text-[var(--text-muted)]">
          Current query total: {meta.total}
        </p>
      </header>

      <DocumentFilters
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={applyFilters}
        onReset={resetFilters}
      >
        {viewer.role !== "MEMBER" && (
          <DocumentScopeOptions filters={draftFilters} onChange={setDraftFilters} />
        )}
      </DocumentFilters>

      {downloadError && (
        <p className="font-extrabold text-[var(--destructive)]" role="alert">
          {downloadError}
        </p>
      )}

      {loading && <LoadingState message="Loading Documents..." />}
      {error && !loading && (
        <ErrorState message={getDocumentErrorMessage(error)} onRetry={() => void refresh()} />
      )}
      {!loading && !error && documents.length === 0 && hasActiveFilters && (
        <EmptyState title="No documents found" message="No documents match your filters." />
      )}
      {!loading && !error && documents.length === 0 && !hasActiveFilters && (
        <EmptyState
          title={ROLE_EMPTY_TITLES[viewer.role] ?? ROLE_EMPTY_TITLES.MEMBER}
          message={ROLE_EMPTY_MESSAGES[viewer.role] ?? ROLE_EMPTY_MESSAGES.MEMBER}
        />
      )}
      {!loading && !error && documents.length > 0 && (
        <>
          <DocumentList
            documents={documents}
            downloadingFileId={downloadingFileId}
            onDownload={(document) => void handleDownload(document)}
            onPreview={setPreviewDocument}
          />
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </>
      )}

      <FilePreviewModal
        open={Boolean(previewDocument)}
        file={previewDocument ? toPreviewTarget(previewDocument) : null}
        onClose={() => setPreviewDocument(null)}
        onDownload={() => {
          if (previewDocument) {
            void handleDownload(previewDocument);
          }
        }}
      />
    </section>
  );
};
