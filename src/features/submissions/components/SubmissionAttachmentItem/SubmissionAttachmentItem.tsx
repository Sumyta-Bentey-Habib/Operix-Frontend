"use client";

import { cleanFilename, formatFileSize, formatFileType } from "@/features/files";
import type { SubmissionAttachmentResponse } from "@/features/files";
import { formatDisplayDate } from "@/utils/date";

export interface SubmissionAttachmentItemProps {
  attachment: SubmissionAttachmentResponse;
  downloading: boolean;
  onDownload: (attachment: SubmissionAttachmentResponse) => void;
  onView?: (attachment: SubmissionAttachmentResponse) => void;
}

const ACTION_BUTTON_CLASS =
  "inline-flex min-h-10 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-card-subtle)] px-4 py-2 text-sm font-bold text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-emerald)] disabled:cursor-not-allowed disabled:opacity-60";

const DT_CLASS = "text-[0.72rem] font-bold uppercase text-[var(--text-muted)]";
const DD_CLASS = "mt-0.5 break-words text-[0.82rem] text-[var(--text-primary)]";

export const SubmissionAttachmentItem = ({
  attachment,
  downloading,
  onDownload,
  onView,
}: SubmissionAttachmentItemProps) => {
  const { file } = attachment;
  const displayName = cleanFilename(file.originalName);

  const metaItems: Array<[string, string]> = [
    ["Type", formatFileType(file.mimeType, displayName)],
    ["Size", formatFileSize(file.sizeBytes)],
    ["Uploaded", formatDisplayDate(file.createdAt)],
    ["Uploaded By", file.uploadedBy?.name ?? "Unknown"],
  ];

  return (
    <article className="grid gap-3.5 rounded-[18px] border border-(--border-default) bg-(--bg-card) p-4.5 shadow-(--card-shadow) transition-all duration-200 hover:border-(--border-hover) hover:shadow-(--card-hover-shadow)">
      <div className="grid gap-3">
        <h3 className="wrap-break-word text-[0.95rem] font-bold text-(--text-primary)">
          {displayName}
        </h3>
        <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
          {metaItems.map(([label, value]) => (
            <div key={label}>
              <dt className={DT_CLASS}>{label}</dt>
              <dd className={DD_CLASS}>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="flex flex-wrap gap-2">
        {onView && (
          <button
            type="button"
            className={ACTION_BUTTON_CLASS}
            aria-label={`Preview ${displayName}`}
            onClick={() => onView(attachment)}
          >
            View
          </button>
        )}
        <button
          type="button"
          className={ACTION_BUTTON_CLASS}
          aria-label={`Download ${displayName}`}
          onClick={() => onDownload(attachment)}
          disabled={downloading}
        >
          {downloading ? "Downloading..." : "Download"}
        </button>
      </div>
    </article>
  );
};
