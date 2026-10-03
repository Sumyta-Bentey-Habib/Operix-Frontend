import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SubmissionAttachmentResponse } from "@/features/files";
import { SubmissionAttachments } from "@/features/submissions/components/SubmissionAttachments/SubmissionAttachments";

vi.mock("@/features/files", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/files")>();
  return {
    ...actual,
    fileApi: { download: vi.fn() },
    triggerBrowserDownload: vi.fn(),
    formatFileSize: (value: number) => `${value} B`,
    formatFileType: () => "PDF",
    cleanFilename: (name: string) => name,
    FilePreviewModal: () => null,
  };
});

const buildAttachment = (
  fileId: string,
  overrides: Partial<SubmissionAttachmentResponse["file"]> = {},
): SubmissionAttachmentResponse => ({
  downloadUrl: `/api/v1/files/${fileId}/download`,
  file: {
    id: fileId,
    originalName: `${fileId}.pdf`,
    mimeType: "application/pdf",
    sizeBytes: 100,
    uploadedBy: { id: `uploader-${fileId}`, name: `Uploader ${fileId}` },
    createdAt: "2026-08-23T00:00:00.000Z",
    ...overrides,
  },
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SubmissionAttachments", () => {
  it("renders attachments without top-level ids and without React key warnings", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const attachments = [
      buildAttachment("file-1"),
      buildAttachment("file-2"),
      buildAttachment("file-3"),
    ];

    render(<SubmissionAttachments attachments={attachments} />);

    expect(screen.getByText("file-1.pdf")).toBeInTheDocument();
    expect(screen.getByText("file-2.pdf")).toBeInTheDocument();
    expect(screen.getByText("file-3.pdf")).toBeInTheDocument();
    const keyWarnings = consoleError.mock.calls.filter((call) =>
      String(call[0] ?? "").includes('unique "key" prop'),
    );
    expect(keyWarnings).toHaveLength(0);
  });

  it("displays the safe uploader name", () => {
    render(<SubmissionAttachments attachments={[buildAttachment("file-1")]} />);

    expect(screen.getByText("Uploader file-1")).toBeInTheDocument();
  });

  it('displays "Unknown" when uploader metadata is absent', () => {
    render(
      <SubmissionAttachments
        attachments={[buildAttachment("file-9", { uploadedBy: undefined })]}
      />,
    );

    expect(screen.getByText("Unknown")).toBeInTheDocument();
  });
});
