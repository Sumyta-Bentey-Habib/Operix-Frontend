import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OperixApiError } from "@/lib/api";
import { SubmissionDetails } from "@/features/submissions/components/SubmissionDetails/SubmissionDetails";

const mocks = vi.hoisted(() => ({
  useSubmission: vi.fn(),
  download: vi.fn(),
  triggerBrowserDownload: vi.fn(),
}));

vi.mock("@/features/submissions/hooks/use-submission", () => ({
  useSubmission: mocks.useSubmission,
}));

vi.mock("@/features/files", () => ({
  fileApi: {
    download: mocks.download,
  },
  triggerBrowserDownload: mocks.triggerBrowserDownload,
  formatFileSize: (value: number) => `${value} B`,
  formatFileType: () => "PDF",
}));

const submission = {
  id: "submission-1",
  taskId: "task-1",
  submittedById: "member-1",
  version: 1,
  submissionText: "Finished work",
  submittedAt: "2026-08-23T00:00:00.000Z",
  createdAt: "2026-08-23T00:00:00.000Z",
  attachments: [
    {
      id: "attachment-1",
      downloadUrl: "/api/v1/files/file-1/download",
      file: {
        id: "file-1",
        originalName: "evidence.pdf",
        mimeType: "application/pdf",
        sizeBytes: 123,
        uploadedById: "member-1",
        createdAt: "2026-08-23T00:00:00.000Z",
      },
    },
  ],
};

describe("SubmissionDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders immutable Submission details and downloads by file id", async () => {
    mocks.useSubmission.mockReturnValue({
      submission,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });
    mocks.download.mockResolvedValueOnce({
      blob: new Blob(["content"]),
      filename: "server.pdf",
    });

    render(<SubmissionDetails submissionId="submission-1" />);

    expect(screen.getByText("Version 1")).toBeInTheDocument();
    expect(screen.queryByText(/Review History/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Remove|Delete|Upload/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Download" }));

    await waitFor(() => expect(mocks.download).toHaveBeenCalledWith("file-1"));
    expect(mocks.download).not.toHaveBeenCalledWith("attachment-1");
    expect(mocks.download).not.toHaveBeenCalledWith("/api/v1/files/file-1/download");
    expect(mocks.triggerBrowserDownload).toHaveBeenCalledWith({
      blob: expect.any(Blob),
      filename: "server.pdf",
      fallbackFilename: "evidence.pdf",
    });
  });

  it("renders privacy safe not found state", () => {
    mocks.useSubmission.mockReturnValue({
      submission: null,
      loading: false,
      error: new OperixApiError("Missing", {
        status: 404,
        code: "SUBMISSION_NOT_FOUND",
      }),
      refresh: vi.fn(),
    });

    render(<SubmissionDetails submissionId="submission-1" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Submission unavailable");
    expect(screen.getByRole("alert")).not.toHaveTextContent("another");
  });
});
