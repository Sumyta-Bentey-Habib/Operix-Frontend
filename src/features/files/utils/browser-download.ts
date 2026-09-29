import { cleanFilename } from "./clean-filename";

export interface BrowserDownloadInput {
  blob: Blob;
  filename?: string | null;
  fallbackFilename?: string | null;
}

export const resolveBrowserDownloadFilename = (
  filename?: string | null,
  fallbackFilename?: string | null,
): string => {
  const explicit = cleanFilename(filename);
  if (explicit) return explicit;

  const fallback = cleanFilename(fallbackFilename);
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
