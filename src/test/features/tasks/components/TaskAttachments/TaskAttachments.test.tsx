import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OperixApiError } from "@/lib/api";
import { TaskAttachments } from "@/features/tasks/components/TaskAttachments/TaskAttachments";
import type { AttachmentResponse } from "@/features/tasks/types/task-attachment.types";
import type { Task } from "@/features/tasks/types/task.types";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useTaskAttachments: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  download: vi.fn(),
  triggerBrowserDownload: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/features/tasks/hooks/use-task-attachments", () => ({
  useTaskAttachments: mocks.useTaskAttachments,
}));

vi.mock("@/features/tasks/api/task-attachment.api", () => ({
  taskAttachmentApi: {
    upload: mocks.upload,
    remove: mocks.remove,
  },
}));

vi.mock("@/features/files", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/files")>();

  return {
    ...actual,
    fileApi: {
      download: mocks.download,
    },
    triggerBrowserDownload: mocks.triggerBrowserDownload,
    formatFileSize: (value: number) => `${value} B`,
    formatFileType: () => "PDF",
  };
});

const task = (status: Task["status"]): Task => ({
  id: "task-1",
  referenceCode: "TSK-1",
  title: "Task",
  description: null,
  remarks: null,
  priority: "HIGH",
  status,
  dueAt: null,
  startedAt: null,
  completedAt: null,
  cancelledAt: null,
  teamId: "team-1",
  categoryId: null,
  createdById: "admin-1",
  createdAt: "2026-08-23T00:00:00.000Z",
  updatedAt: "2026-08-23T00:00:00.000Z",
  isOverdue: false,
});

const attachment: AttachmentResponse = {
  id: "attachment-1",
  downloadUrl: "/api/v1/files/file-1/download",
  file: {
    id: "file-1",
    originalName: "report.pdf",
    mimeType: "application/pdf",
    sizeBytes: 123,
    uploadedById: "admin-1",
    createdAt: "2026-08-23T00:00:00.000Z",
  },
};

const viewer = (role: "SUPER_ADMIN" | "ADMIN" | "MEMBER") => ({
  userId: `${role.toLowerCase()}-1`,
  role,
  status: "ACTIVE",
  scope:
    role === "SUPER_ADMIN"
      ? { type: "GLOBAL" }
      : role === "ADMIN"
        ? { type: "ADMIN", teamIds: ["team-1"] }
        : { type: "MEMBER", teamId: "team-1" },
});

const hookValue = {
  attachments: [attachment],
  loading: false,
  error: null,
  refresh: vi.fn(),
};

describe("TaskAttachments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useTaskAttachments.mockReturnValue(hookValue);
  });

  it("allows ADMIN on PENDING Tasks to upload, delete, and download", async () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("ADMIN") });
    mocks.download.mockResolvedValueOnce({
      blob: new Blob(["content"]),
      filename: "server.pdf",
    });
    mocks.remove.mockResolvedValueOnce(undefined);

    render(<TaskAttachments task={task("PENDING")} onTaskRefresh={vi.fn()} />);

    expect(screen.getByLabelText("Add attachments")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    await waitFor(() => expect(mocks.download).toHaveBeenCalledWith("file-1"));
    expect(mocks.triggerBrowserDownload).toHaveBeenCalledWith({
      blob: expect.any(Blob),
      filename: "server.pdf",
      fallbackFilename: "report.pdf",
    });

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[1]);

    await waitFor(() => expect(mocks.remove).toHaveBeenCalledWith("task-1", "attachment-1"));
  });

  it("renders read only controls for SUPER_ADMIN, MEMBER, and non Pending ADMIN", () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("SUPER_ADMIN") });
    const { rerender } = render(<TaskAttachments task={task("PENDING")} onTaskRefresh={vi.fn()} />);

    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeInTheDocument();

    mocks.useAuth.mockReturnValue({ viewer: viewer("MEMBER") });
    rerender(<TaskAttachments task={task("PENDING")} onTaskRefresh={vi.fn()} />);
    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();

    mocks.useAuth.mockReturnValue({ viewer: viewer("ADMIN") });
    rerender(<TaskAttachments task={task("ASSIGNED")} onTaskRefresh={vi.fn()} />);
    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
  });

  it("removes mutation controls when Task prop changes from PENDING to ASSIGNED", () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("ADMIN") });
    const { rerender } = render(<TaskAttachments task={task("PENDING")} onTaskRefresh={vi.fn()} />);

    expect(screen.getByLabelText("Add attachments")).toBeInTheDocument();

    rerender(<TaskAttachments task={task("ASSIGNED")} onTaskRefresh={vi.fn()} />);

    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
  });

  it("refreshes Task and attachments on editability conflict without retrying", async () => {
    const refreshTask = vi.fn().mockResolvedValue(undefined);
    const refreshAttachments = vi.fn().mockResolvedValue(undefined);
    mocks.useAuth.mockReturnValue({ viewer: viewer("ADMIN") });
    mocks.useTaskAttachments.mockReturnValue({
      ...hookValue,
      refresh: refreshAttachments,
    });
    mocks.upload.mockRejectedValueOnce(
      new OperixApiError("Locked", {
        status: 409,
        code: "TASK_ATTACHMENTS_NOT_EDITABLE",
      }),
    );

    render(<TaskAttachments task={task("PENDING")} onTaskRefresh={refreshTask} />);

    const input = screen.getByLabelText("Add attachments");
    fireEvent.change(input, {
      target: {
        files: [new File(["content"], "report.pdf", { type: "application/pdf" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));

    await waitFor(() => expect(refreshTask).toHaveBeenCalledTimes(1));
    expect(refreshAttachments).toHaveBeenCalledTimes(1);
    expect(mocks.upload).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert")).toHaveTextContent("Task attachments can only be changed");
  });
});
