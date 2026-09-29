"use client";

import { useEffect, useRef, useState } from "react";
import { cleanFilename } from "../../utils/clean-filename";
import { formatFileSize, formatFileType } from "../../utils/format-file-size";
import { triggerBrowserDownload } from "../../utils/browser-download";
import { fileApi } from "../../api/file.api";
import styles from "./FilePreviewModal.module.css";

export interface FilePreviewTarget {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt?: string;
}

export interface FilePreviewModalProps {
  open: boolean;
  file: FilePreviewTarget | null;
  onClose: () => void;
  onDownload?: () => void;
}

const isImageFile = (mimeType: string, filename: string): boolean => {
  const lower = filename.toLowerCase();
  return (
    mimeType.startsWith("image/") ||
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".webp") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".svg")
  );
};

const isPdfFile = (mimeType: string, filename: string): boolean => {
  const lower = filename.toLowerCase();
  return mimeType === "application/pdf" || lower.endsWith(".pdf");
};

const isVideoFile = (mimeType: string, filename: string): boolean => {
  const lower = filename.toLowerCase();
  return (
    mimeType.startsWith("video/") ||
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".ogg")
  );
};

const isAudioFile = (mimeType: string, filename: string): boolean => {
  const lower = filename.toLowerCase();
  return (
    mimeType.startsWith("audio/") ||
    lower.endsWith(".mp3") ||
    lower.endsWith(".wav") ||
    lower.endsWith(".ogg") ||
    lower.endsWith(".aac")
  );
};

const isTextFile = (mimeType: string, filename: string): boolean => {
  const lower = filename.toLowerCase();
  return (
    mimeType.startsWith("text/") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".json") ||
    lower.endsWith(".csv") ||
    lower.endsWith(".md") ||
    lower.endsWith(".log")
  );
};

interface ActivePreviewProps {
  file: FilePreviewTarget;
  onClose: () => void;
  onDownload?: () => void;
}

const ActivePreviewDialog = ({ file, onClose, onDownload }: ActivePreviewProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    let isSubscribed = true;
    let activeUrl: string | null = null;

    const loadBlob = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fileApi.download(file.id);
        if (!isSubscribed) return;

        setBlob(result.blob);
        activeUrl = URL.createObjectURL(result.blob);
        setBlobUrl(activeUrl);

        if (isTextFile(file.mimeType, file.originalName)) {
          const text = await result.blob.text();
          if (isSubscribed) {
            setTextContent(text);
          }
        }
      } catch (err: unknown) {
        if (!isSubscribed) return;
        const message = err instanceof Error ? err.message : "Failed to load file preview.";
        setError(message);
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    void loadBlob();

    return () => {
      isSubscribed = false;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [file.id, file.mimeType, file.originalName]);

  const displayName = cleanFilename(file.originalName);
  const typeDisplay = formatFileType(file.mimeType, file.originalName);
  const sizeDisplay = formatFileSize(file.sizeBytes);

  const handleOpenNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload();
      return;
    }
    if (blob) {
      triggerBrowserDownload({
        blob,
        filename: displayName,
        fallbackFilename: displayName,
      });
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.statusBox}>
          <p>Loading preview...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.statusBox}>
          <p className={styles.errorText}>{error}</p>
          <button
            type="button"
            className={styles.actionButton}
            onClick={() => {
              setError(null);
              setLoading(true);
              void fileApi
                .download(file.id)
                .then((result) => {
                  setBlob(result.blob);
                  setBlobUrl(URL.createObjectURL(result.blob));
                })
                .catch((e: unknown) => {
                  setError(e instanceof Error ? e.message : "Failed to load file preview.");
                })
                .finally(() => setLoading(false));
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    if (!blobUrl) return null;

    if (isImageFile(file.mimeType, file.originalName)) {
      return (
        <div className={styles.imageWrapper}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={blobUrl}
            alt={displayName}
            className={styles.previewImage}
          />
        </div>
      );
    }

    if (isPdfFile(file.mimeType, file.originalName)) {
      return (
        <iframe
          src={blobUrl}
          title={displayName}
          className={styles.previewIframe}
        />
      );
    }

    if (isVideoFile(file.mimeType, file.originalName)) {
      return (
        <video controls src={blobUrl} className={styles.previewVideo}>
          Your browser does not support the video tag.
        </video>
      );
    }

    if (isAudioFile(file.mimeType, file.originalName)) {
      return (
        <audio controls src={blobUrl} className={styles.previewAudio}>
          Your browser does not support the audio element.
        </audio>
      );
    }

    if (textContent !== null) {
      return (
        <pre className={styles.previewText}>
          <code>{textContent}</code>
        </pre>
      );
    }

    return (
      <div className={styles.docFallback}>
        <div className={styles.docBadge}>
          {typeDisplay.slice(0, 3).toUpperCase()}
        </div>
        <div>
          <h3 className={styles.docTitle}>{displayName}</h3>
          <p className={styles.docDesc}>
            Inline browser preview is not supported for {typeDisplay} files. You can open or download the file to inspect it.
          </p>
        </div>
        <div className={styles.docActions}>
          <button
            type="button"
            className={styles.downloadButton}
            onClick={handleDownloadClick}
          >
            Download File
          </button>
          <button
            type="button"
            className={styles.actionButton}
            onClick={handleOpenNewTab}
          >
            Open in New Tab
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onClick={(e) => {
        if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={`Preview ${displayName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <h2 className={styles.title} title={displayName}>
              {displayName}
            </h2>
            <div className={styles.meta}>
              <span>{typeDisplay}</span>
              <span className={styles.dot}>•</span>
              <span>{sizeDisplay}</span>
            </div>
          </div>
          <div className={styles.headerActions}>
            {blobUrl && (
              <button
                type="button"
                className={styles.actionButton}
                onClick={handleOpenNewTab}
                title="Open in new window"
              >
                Open in New Tab
              </button>
            )}
            <button
              type="button"
              className={styles.downloadButton}
              onClick={handleDownloadClick}
            >
              Download
            </button>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close preview"
            >
              ✕
            </button>
          </div>
        </header>
        <div className={styles.body}>{renderContent()}</div>
      </section>
    </div>
  );
};

export const FilePreviewModal = ({
  open,
  file,
  onClose,
  onDownload,
}: FilePreviewModalProps) => {
  if (!open || !file) return null;

  return (
    <ActivePreviewDialog
      key={file.id}
      file={file}
      onClose={onClose}
      onDownload={onDownload}
    />
  );
};
