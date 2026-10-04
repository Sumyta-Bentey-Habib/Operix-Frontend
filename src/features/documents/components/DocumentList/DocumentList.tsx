"use client";

import { cleanFilename, formatFileSize, formatFileType } from "@/features/files";
import { formatDisplayDate } from "@/utils/date";
import type { DocumentListItem } from "../../types/document.types";

const ACTION_BUTTON_CLASS =
  "inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-card-subtle)] px-4 py-2 text-sm font-bold text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-emerald)] disabled:cursor-not-allowed disabled:opacity-60";

const DT_CLASS = "text-[0.72rem] font-bold uppercase text-[var(--text-muted)]";
const DD_CLASS = "mt-0.5 break-words text-[0.82rem] text-[var(--text-primary)]";

export interface DocumentListProps {
  documents: DocumentListItem[];
  downloadingFileId: string | null;
  onDownload: (document: DocumentListItem) => void;
  onPreview: (document: DocumentListItem) => void;
}

const formatSource = (document: DocumentListItem): string => {
  if (document.source.type === "SUBMISSION_ATTACHMENT") {
    const version = document.source.submission?.version;
    return version === undefined || version === null ? "Submission" : `Submission · V${version}`;
  }
  return "Task";
};

export const DocumentList = ({
  documents,
  downloadingFileId,
  onDownload,
  onPreview,
}: DocumentListProps) => (
  <div className="grid gap-3">
    {documents.map((document) => {
      const displayName = cleanFilename(document.name);
      const downloading = downloadingFileId === document.id;
      const meta: Array<[string, string]> = [
        ["Source", formatSource(document)],
        ["Task", document.source.task?.title ?? "—"],
        ["Uploaded By", document.uploadedBy.name ?? "Unknown"],
        ["Type", formatFileType(document.mimeType, displayName)],
        ["Size", formatFileSize(document.sizeBytes)],
        ["Uploaded", formatDisplayDate(document.uploadedAt)],
      ];
      return (
        <article
          key={document.id}
          className="grid gap-3.5 rounded-[18px] border border-(--border-default) bg-(--bg-card) p-4.5 shadow-(--card-shadow) transition-all duration-200 hover:border-(--border-hover) hover:shadow-(--card-hover-shadow)"
        >
          <div className="grid gap-3">
            <h3 className="wrap-break-word text-[0.95rem] font-bold text-(--text-primary)">
              {displayName}
            </h3>
            <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
              {meta.map(([label, value]) => (
                <div key={label}>
                  <dt className={DT_CLASS}>{label}</dt>
                  <dd className={DD_CLASS}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={ACTION_BUTTON_CLASS}
              aria-label={`Preview ${displayName}`}
              onClick={() => onPreview(document)}
            >
              View
            </button>
            <button
              type="button"
              className={ACTION_BUTTON_CLASS}
              aria-label={`Download ${displayName}`}
              onClick={() => onDownload(document)}
              disabled={downloading}
            >
              {downloading ? "Downloading..." : "Download"}
            </button>
          </div>
        </article>
      );
    })}
  </div>
);

