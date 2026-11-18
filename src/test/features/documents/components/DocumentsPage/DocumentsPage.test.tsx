import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentsPage } from "@/features/documents/components/DocumentsPage/DocumentsPage";
import type { DocumentAiAnalysis } from "@/features/documents/types/document-ai.types";
import type { DocumentListItem } from "@/features/documents/types/document.types";
import { OperixApiError } from "@/lib/api";
import type { OperixViewer } from "@/types/auth";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useMembers: vi.fn(),
  useTeams: vi.fn(),
  download: vi.fn(),
  analyze: vi.fn(),
  triggerBrowserDownload: vi.fn(),
  documents: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/features/members/hooks/use-members", () => ({
  useMembers: mocks.useMembers,
}));

vi.mock("@/features/teams/hooks/use-teams", () => ({
  useTeams: mocks.useTeams,
}));

vi.mock("@/features/documents/hooks/use-documents", () => ({
  useDocuments: () => ({
    documents: mocks.documents(),
    meta: { page: 1, limit: 20, total: mocks.documents().length, totalPages: 1 },
    draftFilters: {
      search: "",
      source: "",
      memberId: "",
      teamId: "",
      sort: "CREATED_AT_DESC",
    },
    appliedFilters: {
      search: "",
      source: "",
      memberId: "",
      teamId: "",
      sort: "CREATED_AT_DESC",
    },
    loading: false,
    error: null,
    setPage: vi.fn(),
    setDraftFilters: vi.fn(),
    applyFilters: vi.fn(),
    resetFilters: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/features/documents/api/document.api", () => ({
  documentApi: { analyze: mocks.analyze },
}));

vi.mock("@/features/files", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/files")>();
  return {
    ...actual,
    fileApi: { download: mocks.download },
    triggerBrowserDownload: mocks.triggerBrowserDownload,
    formatFileSize: (value: number) => `${value} B`,
    formatFileType: () => "PDF",
    cleanFilename: (name: string) => name,
    FilePreviewModal: ({ open, file }: { open: boolean; file: { originalName: string } | null }) =>
      open ? (
        <div role="dialog" aria-label={`Preview ${file?.originalName ?? "document"}`} />
      ) : null,
  };
});

const memberViewer: OperixViewer = {
  userId: "member-user-1",
  role: "MEMBER",
  status: "ACTIVE",
  scope: { type: "MEMBER", teamId: "team-1" },
};

const adminViewer: OperixViewer = {
  userId: "admin-user-1",
  role: "ADMIN",
  status: "ACTIVE",
  scope: { type: "ADMIN", teamIds: ["team-1"] },
};

const superAdminViewer: OperixViewer = {
  userId: "chief-user-1",
  role: "SUPER_ADMIN",
  status: "ACTIVE",
  scope: { type: "GLOBAL" },
};

const submissionDoc: DocumentListItem = {
  id: "file-public-1",
  name: "Assignment.pdf",
  mimeType: "application/pdf",
  sizeBytes: 123,
  uploadedAt: "2026-10-04T00:00:00.000Z",
  uploadedBy: { id: "member-public-1", name: "Rz Arnab" },
  source: {
    type: "SUBMISSION_ATTACHMENT",
    task: { id: "task-public-1", title: "Test Task 2" },
    submission: { id: "submission-public-1", version: 1 },
  },
  downloadUrl: "/api/v1/files/file-public-1/download",
};

const taskDoc: DocumentListItem = {
  id: "file-public-2",
  name: "Reference.pdf",
  mimeType: "application/pdf",
  sizeBytes: 456,
  uploadedAt: "2026-10-03T00:00:00.000Z",
  uploadedBy: { id: "admin-public-1", name: "Admin One" },
  source: {
    type: "TASK_ATTACHMENT",
    task: { id: "task-public-1", title: "Test Task 2" },
    submission: null,
  },
  downloadUrl: "/api/v1/files/file-public-2/download",
};

const analysisResult: DocumentAiAnalysis = {
  documentId: submissionDoc.id,
  summary: "The document describes the October quality review.",
  keyPoints: ["Batch documentation is complete."],
  actionItems: [
    {
      action: "Review the deviation record.",
      ownerMentioned: "Quality Manager",
      dueDateMentioned: "31 Oct 2026",
    },
  ],
  importantDates: [
    {
      dateText: "31 Oct 2026",
      context: "Deviation review deadline",
    },
  ],
  risksOrWarnings: ["One approval signature is pending."],
  confidence: "HIGH",
  limitations: ["AI document analysis is advisory only."],
  meta: {
    provider: "gemini",
    model: "gemini-2.5-flash",
    latencyMs: 125,
    attempts: 1,
  },
};

const createDeferred = <T,>() => {
  let resolvePromise: (value: T) => void = () => {
    throw new Error("Deferred promise was not initialized.");
  };
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve;
  });

  return { promise, resolve: resolvePromise };
};

describe("DocumentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useMembers.mockReturnValue({ members: [], meta: {}, loading: false, error: null });
    mocks.useTeams.mockReturnValue({ teams: [], meta: {}, loading: false, error: null });
    mocks.documents.mockReturnValue([submissionDoc, taskDoc]);
  });

  it("renders member documents without scope filters and without key warnings", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.useAuth.mockReturnValue({ viewer: memberViewer });

    render(<DocumentsPage />);

    expect(screen.getByText("Assignment.pdf")).toBeInTheDocument();
    expect(screen.getByText("Reference.pdf")).toBeInTheDocument();
    expect(screen.getByText("Submission · V1")).toBeInTheDocument();
    expect(screen.getAllByText("Test Task 2")).toHaveLength(2);
    expect(screen.getByText("Rz Arnab")).toBeInTheDocument();
    expect(screen.queryByLabelText("Member")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Team")).not.toBeInTheDocument();
    const keyWarnings = consoleError.mock.calls.filter((call) =>
      String(call[0] ?? "").includes('unique "key" prop'),
    );
    expect(keyWarnings).toHaveLength(0);
    consoleError.mockRestore();
  });

  it("renders member and team scope filters for admins", () => {
    mocks.useAuth.mockReturnValue({ viewer: adminViewer });
    mocks.useMembers.mockReturnValue({
      members: [{ id: "member-public-1", name: "Rz Arnab" }],
      meta: {},
      loading: false,
      error: null,
    });
    mocks.useTeams.mockReturnValue({
      teams: [{ id: "team-public-1", name: "Team One" }],
      meta: {},
      loading: false,
      error: null,
    });

    render(<DocumentsPage />);

    expect(screen.getByLabelText("Member")).toBeInTheDocument();
    expect(screen.getByLabelText("Team")).toBeInTheDocument();
  });

  it("shows role-aware true empty state", () => {
    mocks.useAuth.mockReturnValue({ viewer: memberViewer });
    mocks.documents.mockReturnValue([]);

    render(<DocumentsPage />);

    expect(screen.getByRole("heading", { name: "No documents yet" })).toBeInTheDocument();
  });

  it("shows the organization-wide empty state and scope filters for Super Admins", () => {
    mocks.useAuth.mockReturnValue({ viewer: superAdminViewer });
    mocks.useMembers.mockReturnValue({
      members: [],
      meta: {},
      loading: false,
      error: null,
    });
    mocks.useTeams.mockReturnValue({
      teams: [],
      meta: {},
      loading: false,
      error: null,
    });
    mocks.documents.mockReturnValue([]);

    render(<DocumentsPage />);

    expect(
      screen.getByRole("heading", { name: "No documents have been uploaded yet" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Member")).toBeInTheDocument();
    expect(screen.getByLabelText("Team")).toBeInTheDocument();
  });

  it("downloads through the existing file endpoint by public file id", async () => {
    mocks.useAuth.mockReturnValue({ viewer: memberViewer });
    mocks.download.mockResolvedValueOnce({ blob: new Blob(["x"]), filename: "a.pdf" });

    render(<DocumentsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Download Assignment.pdf" }));

    await waitFor(() => expect(mocks.download).toHaveBeenCalledWith("file-public-1"));
    expect(mocks.triggerBrowserDownload).toHaveBeenCalledWith({
      blob: expect.any(Blob),
      filename: "a.pdf",
      fallbackFilename: "Assignment.pdf",
    });
  });

  it("offers AI analysis for supported documents and explains unsupported images", () => {
    mocks.useAuth.mockReturnValue({ viewer: memberViewer });
    mocks.documents.mockReturnValue([
      submissionDoc,
      {
        ...taskDoc,
        id: "docx",
        name: "Plan.docx",
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      {
        ...taskDoc,
        id: "xlsx",
        name: "Metrics.xlsx",
        mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
      {
        ...taskDoc,
        id: "pptx",
        name: "Briefing.pptx",
        mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      },
      { ...taskDoc, id: "png", name: "Scan.png", mimeType: "image/png" },
      { ...taskDoc, id: "jpeg", name: "Photo.jpg", mimeType: "image/jpeg" },
      { ...taskDoc, id: "webp", name: "Chart.webp", mimeType: "image/webp" },
    ]);

    render(<DocumentsPage />);

    expect(
      screen.getByRole("button", { name: "Analyze Assignment.pdf with AI" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analyze Plan.docx with AI" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Analyze Metrics.xlsx with AI" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Analyze Briefing.pptx with AI" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("AI text analysis is not available for this file type."),
    ).toHaveLength(3);
  });

  it("renders every section of a successful AI document analysis", async () => {
    mocks.useAuth.mockReturnValue({ viewer: memberViewer });
    mocks.analyze.mockResolvedValueOnce(analysisResult);

    render(<DocumentsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Analyze Assignment.pdf with AI" }));

    expect(screen.getByRole("status")).toHaveTextContent("Analyzing document...");
    await waitFor(() => expect(screen.getByText(analysisResult.summary)).toBeInTheDocument());
    expect(screen.getByText("Batch documentation is complete.")).toBeInTheDocument();
    expect(screen.getByText("Review the deviation record.")).toBeInTheDocument();
    expect(screen.getByText("Quality Manager · 31 Oct 2026")).toBeInTheDocument();
    expect(screen.getByText("Deviation review deadline")).toBeInTheDocument();
    expect(screen.getByText("One approval signature is pending.")).toBeInTheDocument();
    expect(screen.getByText("High")).toBeInTheDocument();
    expect(screen.getByText("AI document analysis is advisory only.")).toBeInTheDocument();
  });

  it("keeps Preview and Download available when AI analysis fails", async () => {
    mocks.useAuth.mockReturnValue({ viewer: memberViewer });
    mocks.analyze.mockRejectedValueOnce(
      new OperixApiError("provider failed", {
        status: 503,
        code: "AI_PROVIDER_UNAVAILABLE",
      }),
    );
    mocks.download.mockResolvedValueOnce({ blob: new Blob(["x"]), filename: "a.pdf" });

    render(<DocumentsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Analyze Assignment.pdf with AI" }));

    expect(
      await screen.findByText(
        "AI analysis is temporarily unavailable. You can still preview or download this document.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Preview Assignment.pdf" }));
    expect(screen.getByRole("dialog", { name: "Preview Assignment.pdf" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Download Assignment.pdf" }));
    await waitFor(() => expect(mocks.download).toHaveBeenCalledWith(submissionDoc.id));
  });

  it("aborts and ignores a stale result when analysis switches documents", async () => {
    const first = createDeferred<DocumentAiAnalysis>();
    const second = createDeferred<DocumentAiAnalysis>();
    mocks.useAuth.mockReturnValue({ viewer: memberViewer });
    mocks.analyze.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

    render(<DocumentsPage />);

    fireEvent.click(screen.getByRole("button", { name: "Analyze Assignment.pdf with AI" }));
    fireEvent.click(screen.getByRole("button", { name: "Analyze Reference.pdf with AI" }));

    const firstSignal = mocks.analyze.mock.calls[0]?.[1] as AbortSignal;
    expect(firstSignal.aborted).toBe(true);
    expect(screen.getByLabelText("AI Document Analysis for Reference.pdf")).toBeInTheDocument();

    await act(async () => {
      first.resolve({ ...analysisResult, summary: "Stale analysis A" });
      await first.promise;
    });
    expect(screen.queryByText("Stale analysis A")).not.toBeInTheDocument();

    await act(async () => {
      second.resolve({
        ...analysisResult,
        documentId: taskDoc.id,
        summary: "Current analysis B",
      });
      await second.promise;
    });
    expect(await screen.findByText("Current analysis B")).toBeInTheDocument();
  });
});
