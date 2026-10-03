import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentsPage } from "@/features/documents/components/DocumentsPage/DocumentsPage";
import type { DocumentListItem } from "@/features/documents/types/document.types";
import type { OperixViewer } from "@/types/auth";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useMembers: vi.fn(),
  useTeams: vi.fn(),
  download: vi.fn(),
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

vi.mock("@/features/files", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/files")>();
  return {
    ...actual,
    fileApi: { download: mocks.download },
    triggerBrowserDownload: mocks.triggerBrowserDownload,
    formatFileSize: (value: number) => `${value} B`,
    formatFileType: () => "PDF",
    cleanFilename: (name: string) => name,
    FilePreviewModal: () => null,
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
});
