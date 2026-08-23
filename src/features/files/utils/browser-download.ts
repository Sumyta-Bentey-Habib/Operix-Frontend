export interface BrowserDownloadInput {
  blob: Blob;
  filename?: string | null;
  fallbackFilename?: string | null;
}

export const resolveBrowserDownloadFilename = (
  filename?: string | null,
  fallbackFilename?: string | null,
): string => {
  const explicit = filename?.trim();
  if (explicit) return explicit;

  const fallback = fallbackFilename?.trim();
  if (fallback) return fallback;

  return "download";
};

export const triggerBrowserDownload = ({
  blob,
  filename,
  fallbackFilename,
}: BrowserDownloadInput): void => {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  try {
    anchor.href = objectUrl;
    anchor.download = resolveBrowserDownloadFilename(filename, fallbackFilename);
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }
};
