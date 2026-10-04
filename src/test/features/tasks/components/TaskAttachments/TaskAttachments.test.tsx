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
  start: vi.fn(),
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

vi.mock("@/features/tasks/api/task.api", () => ({
  taskApi: {
    start: mocks.start,
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

  it("renders read only controls for non-creator ADMIN and unrelated MEMBER", () => {
    // ADMIN who did NOT create the task — createdById is "admin-1" but this viewer is "admin-2"
    const nonCreatorAdmin = { ...viewer("ADMIN"), userId: "admin-2" };
    mocks.useAuth.mockReturnValue({ viewer: nonCreatorAdmin });
    const { rerender } = render(<TaskAttachments task={task("PENDING")} onTaskRefresh={vi.fn()} />);

    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeInTheDocument();

    // MEMBER who is not responsible also cannot manage
    mocks.useAuth.mockReturnValue({ viewer: viewer("MEMBER") });
    rerender(<TaskAttachments task={task("PENDING")} onTaskRefresh={vi.fn()} />);
    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();
    expect(
      screen.getByText("Only the current Responsible Member can add attachments to this Task."),
    ).toBeInTheDocument();
  });

  it("explains locked and capacity upload states", () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("ADMIN") });
    const { rerender } = render(<TaskAttachments task={task("SUBMITTED")} onTaskRefresh={vi.fn()} />);

    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();
    expect(screen.getByText("Task attachments are locked for the current Task state."))
      .toBeInTheDocument();

    const globalSentTask: Task = {
      ...task("IN_PROGRESS"),
      startedAt: "2026-08-24T00:00:00.000Z",
      scope: "GLOBAL",
      owner: { id: "admin-1", name: "Admin", role: "ADMIN" },
      distribution: {
        status: "SENT",
        scheduledAt: "2026-08-23T00:00:00.000Z",
        sentAt: "2026-08-23T00:00:00.000Z",
      },
    };
    rerender(<TaskAttachments task={globalSentTask} onTaskRefresh={vi.fn()} />);
    expect(screen.getByText("Attachments are locked after this Global Task was distributed."))
      .toBeInTheDocument();

    mocks.useTaskAttachments.mockReturnValue({
      ...hookValue,
      attachments: Array.from({ length: 5 }, (_, index) => ({
        ...attachment,
        id: `attachment-${index}`,
        file: {
          ...attachment.file,
          id: `file-${index}`,
        },
      })),
    });
    rerender(<TaskAttachments task={task("PENDING")} onTaskRefresh={vi.fn()} />);
    expect(screen.getByText("Maximum of 5 Task attachments reached.")).toBeInTheDocument();
  });

  it("keeps upload and delete controls for creator ADMIN on IN_PROGRESS tasks", () => {
    // viewer("ADMIN").userId === "admin-1" === task.createdById, so they are the creator
    mocks.useAuth.mockReturnValue({ viewer: viewer("ADMIN") });
    render(<TaskAttachments task={task("IN_PROGRESS")} onTaskRefresh={vi.fn()} />);

    expect(screen.getByLabelText("Add attachments")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("keeps mutation controls when Task prop changes from PENDING to IN_PROGRESS, then hides them on SUBMITTED", () => {
    // viewer("ADMIN").userId === "admin-1" === task.createdById, so they are the creator
    mocks.useAuth.mockReturnValue({ viewer: viewer("ADMIN") });
    const { rerender } = render(<TaskAttachments task={task("PENDING")} onTaskRefresh={vi.fn()} />);

    expect(screen.getByLabelText("Add attachments")).toBeInTheDocument();

    // Once the task is ASSIGNED (and startedAt is null by default), uploader is still shown
    // since ASSIGNED + not-started is still editable per backend policy.
    // Moving to IN_PROGRESS now keeps controls visible (shared working files).
    rerender(<TaskAttachments task={task("IN_PROGRESS")} onTaskRefresh={vi.fn()} />);

    expect(screen.getByLabelText("Add attachments")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();

    // After submission, mutation locks and controls disappear.
    rerender(<TaskAttachments task={task("SUBMITTED")} onTaskRefresh={vi.fn()} />);

    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
  });

  it("hides mutation controls on COMPLETED and CANCELLED tasks", () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("ADMIN") });
    const { rerender } = render(
      <TaskAttachments task={task("COMPLETED")} onTaskRefresh={vi.fn()} />,
    );

    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download" })).toBeInTheDocument();

    rerender(<TaskAttachments task={task("CANCELLED")} onTaskRefresh={vi.fn()} />);
    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove" })).not.toBeInTheDocument();
  });

  it("shows uploader and own-delete for Responsible MEMBER on IN_PROGRESS task, hiding other uploads", () => {
    const memberViewer = viewer("MEMBER"); // userId: "member-1"
    mocks.useAuth.mockReturnValue({ viewer: memberViewer });

    const memberAttachment: AttachmentResponse = {
      id: "attachment-member",
      downloadUrl: "/api/v1/files/file-2/download",
      file: {
        id: "file-2",
        originalName: "member-spec.pdf",
        mimeType: "application/pdf",
        sizeBytes: 456,
        uploadedBy: { id: "member-1", name: "Member Tupur" },
        uploadedById: "member-1",
        createdAt: "2026-08-24T00:00:00.000Z",
      },
    };

    mocks.useTaskAttachments.mockReturnValue({
      ...hookValue,
      attachments: [attachment, memberAttachment],
    });

    const inProgressTask: Task = {
      ...task("IN_PROGRESS"),
      startedAt: "2026-08-24T00:00:00.000Z",
      responsible: { id: "member-1", name: "Member Tupur", role: "MEMBER" },
    };

    render(<TaskAttachments task={inProgressTask} onTaskRefresh={vi.fn()} />);

    expect(screen.getByLabelText("Add attachments")).toBeInTheDocument();

    // Only the member's own upload is removable; the admin upload stays read-only.
    const removeButtons = screen.getAllByRole("button", { name: "Remove" });
    expect(removeButtons).toHaveLength(1);
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
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Task attachments can no longer be modified.",
    );
  });

  it("refreshes Task and attachments on 403 FORBIDDEN upload error", async () => {
    const refreshTask = vi.fn().mockResolvedValue(undefined);
    const refreshAttachments = vi.fn().mockResolvedValue(undefined);
    mocks.useAuth.mockReturnValue({ viewer: viewer("MEMBER") });
    mocks.useTaskAttachments.mockReturnValue({
      ...hookValue,
      refresh: refreshAttachments,
    });
    mocks.upload.mockRejectedValueOnce(
      new OperixApiError("Forbidden", {
        status: 403,
        code: "FORBIDDEN",
      }),
    );

    const assignedTask: Task = {
      ...task("ASSIGNED"),
      responsible: { id: "member-1", name: "Member", role: "MEMBER" },
    };

    render(<TaskAttachments task={assignedTask} onTaskRefresh={refreshTask} />);

    const input = screen.getByLabelText("Add attachments");
    fireEvent.change(input, {
      target: {
        files: [new File(["content"], "report.pdf", { type: "application/pdf" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));

    await waitFor(() => expect(refreshTask).toHaveBeenCalledTimes(1));
    expect(refreshAttachments).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "You no longer have permission to modify this attachment.",
    );
  });

  it("refreshes Task and attachments on 403 FORBIDDEN delete error", async () => {
    const refreshTask = vi.fn().mockResolvedValue(undefined);
    const refreshAttachments = vi.fn().mockResolvedValue(undefined);
    const memberViewer = viewer("MEMBER");
    mocks.useAuth.mockReturnValue({ viewer: memberViewer });

    const memberAttachment: AttachmentResponse = {
      id: "attachment-member",
      downloadUrl: "/api/v1/files/file-2/download",
      file: {
        id: "file-2",
        originalName: "member-file.pdf",
        mimeType: "application/pdf",
        sizeBytes: 456,
        uploadedBy: { id: "member-1", name: "Member" },
        createdAt: "2026-08-24T00:00:00.000Z",
      },
    };

    mocks.useTaskAttachments.mockReturnValue({
      ...hookValue,
      attachments: [memberAttachment],
      refresh: refreshAttachments,
    });
    mocks.remove.mockRejectedValueOnce(
      new OperixApiError("Forbidden", {
        status: 403,
        code: "FORBIDDEN",
      }),
    );

    const assignedTask: Task = {
      ...task("ASSIGNED"),
      responsible: { id: "member-1", name: "Member", role: "MEMBER" },
    };

    render(<TaskAttachments task={assignedTask} onTaskRefresh={refreshTask} />);

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[1]);

    await waitFor(() => expect(refreshTask).toHaveBeenCalledTimes(1));
    expect(refreshAttachments).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "You no longer have permission to modify this attachment.",
    );
  });

  it("refreshes Task and attachments on 409 delete error", async () => {
    const refreshTask = vi.fn().mockResolvedValue(undefined);
    const refreshAttachments = vi.fn().mockResolvedValue(undefined);
    const memberViewer = viewer("MEMBER");
    mocks.useAuth.mockReturnValue({ viewer: memberViewer });

    const memberAttachment: AttachmentResponse = {
      id: "attachment-member",
      downloadUrl: "/api/v1/files/file-2/download",
      file: {
        id: "file-2",
        originalName: "member-file.pdf",
        mimeType: "application/pdf",
        sizeBytes: 456,
        uploadedBy: { id: "member-1", name: "Member" },
        createdAt: "2026-08-24T00:00:00.000Z",
      },
    };

    mocks.useTaskAttachments.mockReturnValue({
      ...hookValue,
      attachments: [memberAttachment],
      refresh: refreshAttachments,
    });
    mocks.remove.mockRejectedValueOnce(
      new OperixApiError("Locked", {
        status: 409,
        code: "TASK_ATTACHMENTS_NOT_EDITABLE",
      }),
    );

    const assignedTask: Task = {
      ...task("ASSIGNED"),
      responsible: { id: "member-1", name: "Member", role: "MEMBER" },
    };

    render(<TaskAttachments task={assignedTask} onTaskRefresh={refreshTask} />);

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Remove" })[1]);

    await waitFor(() => expect(refreshTask).toHaveBeenCalledTimes(1));
    expect(refreshAttachments).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Task attachments can no longer be modified.",
    );
  });

  it("renders uploader for Responsible MEMBER on GLOBAL SENT Task when ASSIGNED and not started", () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("MEMBER") });
    const globalSentTask: Task = {
      ...task("ASSIGNED"),
      scope: "GLOBAL",
      responsible: { id: "member-1", name: "Member", role: "MEMBER" },
      distribution: {
        status: "SENT",
        scheduledAt: "2026-08-23T00:00:00.000Z",
        sentAt: "2026-08-23T00:00:00.000Z",
      },
    };

    render(<TaskAttachments task={globalSentTask} onTaskRefresh={vi.fn()} />);

    expect(screen.getByLabelText("Add attachments")).toBeInTheDocument();
  });

  it("hides uploader for Owner ADMIN and SUPER_ADMIN on GLOBAL SENT Task", () => {
    const globalSentTask: Task = {
      ...task("ASSIGNED"),
      scope: "GLOBAL",
      owner: { id: "admin-1", name: "Admin", role: "ADMIN" },
      createdById: "admin-1",
      responsible: { id: "member-1", name: "Member", role: "MEMBER" },
      distribution: {
        status: "SENT",
        scheduledAt: "2026-08-23T00:00:00.000Z",
        sentAt: "2026-08-23T00:00:00.000Z",
      },
    };

    mocks.useAuth.mockReturnValue({ viewer: viewer("ADMIN") });
    const { rerender } = render(<TaskAttachments task={globalSentTask} onTaskRefresh={vi.fn()} />);
    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();

    mocks.useAuth.mockReturnValue({ viewer: viewer("SUPER_ADMIN") });
    rerender(<TaskAttachments task={globalSentTask} onTaskRefresh={vi.fn()} />);
    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();
  });

  it("shows uploader for Responsible MEMBER on GLOBAL SENT IN_PROGRESS task", () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("MEMBER") });
    const globalSentInProgress: Task = {
      ...task("IN_PROGRESS"),
      startedAt: "2026-08-24T00:00:00.000Z",
      scope: "GLOBAL",
      responsible: { id: "member-1", name: "Member", role: "MEMBER" },
      distribution: {
        status: "SENT",
        scheduledAt: "2026-08-23T00:00:00.000Z",
        sentAt: "2026-08-23T00:00:00.000Z",
      },
    };

    render(<TaskAttachments task={globalSentInProgress} onTaskRefresh={vi.fn()} />);

    expect(screen.getByLabelText("Add attachments")).toBeInTheDocument();
  });

  it("hides uploader for Owner ADMIN, SUPER_ADMIN, and unrelated MEMBER on GLOBAL SENT IN_PROGRESS task", () => {
    const globalSentInProgress: Task = {
      ...task("IN_PROGRESS"),
      startedAt: "2026-08-24T00:00:00.000Z",
      scope: "GLOBAL",
      owner: { id: "admin-1", name: "Admin", role: "ADMIN" },
      createdById: "admin-1",
      responsible: { id: "member-1", name: "Member", role: "MEMBER" },
      distribution: {
        status: "SENT",
        scheduledAt: "2026-08-23T00:00:00.000Z",
        sentAt: "2026-08-23T00:00:00.000Z",
      },
    };

    mocks.useAuth.mockReturnValue({ viewer: viewer("ADMIN") });
    const { rerender } = render(
      <TaskAttachments task={globalSentInProgress} onTaskRefresh={vi.fn()} />,
    );
    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();

    mocks.useAuth.mockReturnValue({ viewer: viewer("SUPER_ADMIN") });
    rerender(<TaskAttachments task={globalSentInProgress} onTaskRefresh={vi.fn()} />);
    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();

    mocks.useAuth.mockReturnValue({ viewer: { ...viewer("MEMBER"), userId: "other-member" } });
    rerender(<TaskAttachments task={globalSentInProgress} onTaskRefresh={vi.fn()} />);
    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();
  });
  it("hides uploader for unrelated MEMBER on GLOBAL SENT Task", () => {
    const unrelatedMember = { ...viewer("MEMBER"), userId: "other-member" };
    mocks.useAuth.mockReturnValue({ viewer: unrelatedMember });
    const globalSentTask: Task = {
      ...task("ASSIGNED"),
      scope: "GLOBAL",
      responsible: { id: "member-1", name: "Member", role: "MEMBER" },
      distribution: {
        status: "SENT",
        scheduledAt: "2026-08-23T00:00:00.000Z",
        sentAt: "2026-08-23T00:00:00.000Z",
      },
    };

    render(<TaskAttachments task={globalSentTask} onTaskRefresh={vi.fn()} />);
    expect(screen.queryByLabelText("Add attachments")).not.toBeInTheDocument();
  });

  it("automatically starts the task when responsible MEMBER uploads on ASSIGNED task", async () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("MEMBER") });
    mocks.upload.mockResolvedValueOnce(undefined);
    mocks.start.mockResolvedValueOnce({
      ...task("IN_PROGRESS"),
      startedAt: "2026-08-24T00:00:00.000Z",
    });
    const refreshTask = vi.fn().mockResolvedValue(undefined);

    const assignedTask: Task = {
      ...task("ASSIGNED"),
      responsible: { id: "member-1", name: "Member", role: "MEMBER" },
    };

    render(<TaskAttachments task={assignedTask} onTaskRefresh={refreshTask} />);

    const input = screen.getByLabelText("Add attachments");
    fireEvent.change(input, {
      target: {
        files: [new File(["content"], "report.pdf", { type: "application/pdf" })],
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));

    await waitFor(() => expect(mocks.upload).toHaveBeenCalledWith("task-1", [expect.any(File)]));
    await waitFor(() => expect(mocks.start).toHaveBeenCalledWith("task-1"));
    expect(refreshTask).toHaveBeenCalled();
  });

  it("keeps the uploader visible once the refreshed task is IN_PROGRESS after auto-start", () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("MEMBER") });

    const assignedTask: Task = {
      ...task("ASSIGNED"),
      responsible: { id: "member-1", name: "Member", role: "MEMBER" },
    };
    const { rerender } = render(<TaskAttachments task={assignedTask} onTaskRefresh={vi.fn()} />);
    expect(screen.getByLabelText("Add attachments")).toBeInTheDocument();

    rerender(
      <TaskAttachments
        task={{
          ...assignedTask,
          status: "IN_PROGRESS",
          startedAt: "2026-08-24T00:00:00.000Z",
        }}
        onTaskRefresh={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Add attachments")).toBeInTheDocument();
  });

  it("allows Responsible MEMBER to upload and delete only their own attachments on editable ASSIGNED task", () => {
    const memberViewer = viewer("MEMBER"); // userId: "member-1"
    mocks.useAuth.mockReturnValue({ viewer: memberViewer });

    const memberAttachment: AttachmentResponse = {
      id: "attachment-member",
      downloadUrl: "/api/v1/files/file-2/download",
      file: {
        id: "file-2",
        originalName: "member-spec.pdf",
        mimeType: "application/pdf",
        sizeBytes: 456,
        uploadedBy: { id: "member-1", name: "Member Tupur" },
        uploadedById: "member-1",
        createdAt: "2026-08-24T00:00:00.000Z",
      },
    };

    mocks.useTaskAttachments.mockReturnValue({
      ...hookValue,
      attachments: [attachment, memberAttachment],
    });

    const assignedTask: Task = {
      ...task("ASSIGNED"),
      responsible: { id: "member-1", name: "Member Tupur", role: "MEMBER" },
    };

    render(<TaskAttachments task={assignedTask} onTaskRefresh={vi.fn()} />);

    expect(screen.getByLabelText("Add attachments")).toBeInTheDocument();

    const removeButtons = screen.getAllByRole("button", { name: "Remove" });
    expect(removeButtons).toHaveLength(1);
  });

  it("renders View button and opens preview modal with cleaned filename", async () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("ADMIN") });
    const corruptedAttachment: AttachmentResponse = {
      id: "attachment-corrupted",
      downloadUrl: "/api/v1/files/file-corrupted/download",
      file: {
        id: "file-corrupted",
        originalName: "Screenshot 2026-09-07 at 9.50.11â¯PM.png",
        mimeType: "image/png",
        sizeBytes: 1048576,
        uploadedById: "admin-1",
        createdAt: "2026-08-23T00:00:00.000Z",
      },
    };

    mocks.useTaskAttachments.mockReturnValue({
      ...hookValue,
      attachments: [corruptedAttachment],
    });

    mocks.download.mockResolvedValueOnce({
      blob: new Blob(["fake-image-bytes"], { type: "image/png" }),
      filename: "Screenshot 2026-09-07 at 9.50.11â¯PM.png",
    });

    render(<TaskAttachments task={task("PENDING")} onTaskRefresh={vi.fn()} />);

    // Check that displayed name in the list has been cleaned of mojibake
    expect(screen.getByText("Screenshot 2026-09-07 at 9.50.11 PM.png")).toBeInTheDocument();

    const viewButton = screen.getByRole("button", { name: "View" });
    expect(viewButton).toBeInTheDocument();

    fireEvent.click(viewButton);

    // Modal opens and shows cleaned title
    await waitFor(() => {
      expect(
        screen.getByRole("dialog", {
          name: /Preview Screenshot 2026-09-07 at 9.50.11 PM.png/i,
        }),
      ).toBeInTheDocument();
    });
  });
});
