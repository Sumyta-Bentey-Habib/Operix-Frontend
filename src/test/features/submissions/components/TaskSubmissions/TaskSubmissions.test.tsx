import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OperixApiError } from "@/lib/api";
import { TaskSubmissions } from "@/features/submissions/components/TaskSubmissions/TaskSubmissions";
import type { Submission } from "@/features/submissions/types/submission.types";
import type { Task } from "@/features/tasks/types/task.types";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useTaskSubmissions: vi.fn(),
  submissionCreate: vi.fn(),
  reviewCreate: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/features/submissions/hooks/use-task-submissions", () => ({
  useTaskSubmissions: mocks.useTaskSubmissions,
}));

vi.mock("@/features/submissions/api/submission.api", () => ({
  submissionApi: {
    create: mocks.submissionCreate,
  },
}));

vi.mock("@/features/submissions/api/review.api", () => ({
  reviewApi: {
    create: mocks.reviewCreate,
  },
}));

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

const submission = (id: string, version: number): Submission => ({
  id,
  taskId: "task-1",
  submittedById: "member-1",
  version,
  submissionText: `Submission ${version}`,
  submittedAt: "2026-08-23T00:00:00.000Z",
  createdAt: "2026-08-23T00:00:00.000Z",
  attachments: [],
});

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
  submissions: [submission("submission-2", 2), submission("submission-1", 1)],
  meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
  page: 1,
  loading: false,
  error: null,
  setPage: vi.fn(),
  refresh: vi.fn(),
};

describe("TaskSubmissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useTaskSubmissions.mockReturnValue(hookValue);
  });

  it("lets MEMBER submit from IN_PROGRESS with no files", async () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("MEMBER") });
    mocks.submissionCreate.mockResolvedValueOnce(submission("submission-1", 1));
    const refreshWorkflow = vi.fn().mockResolvedValue(undefined);

    render(<TaskSubmissions task={task("IN_PROGRESS")} onWorkflowRefresh={refreshWorkflow} />);

    fireEvent.click(screen.getByRole("button", { name: "Submit Work" }));
    fireEvent.change(screen.getByLabelText(/Submission Text/), {
      target: { value: "  Work is done  " },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Submit Work" })[1]);

    await waitFor(() =>
      expect(mocks.submissionCreate).toHaveBeenCalledWith("task-1", {
        submissionText: "Work is done",
        files: [],
      }),
    );
    expect(refreshWorkflow).toHaveBeenCalledTimes(1);
    expect(hookValue.refresh).toHaveBeenCalledTimes(1);
  });

  it("lets MEMBER resubmit from REVISION_REQUIRED through the same create command", async () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("MEMBER") });
    mocks.submissionCreate.mockResolvedValueOnce(submission("submission-2", 2));

    render(<TaskSubmissions task={task("REVISION_REQUIRED")} onWorkflowRefresh={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Resubmit Work" }));
    fireEvent.change(screen.getByLabelText(/Submission Text/), {
      target: { value: "Revised work" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Resubmit Work" })[1]);

    await waitFor(() => expect(mocks.submissionCreate).toHaveBeenCalledTimes(1));
    expect(mocks.submissionCreate.mock.calls[0]?.[0]).toBe("task-1");
  });

  it("does not expose submit actions to ADMIN or SUPER_ADMIN", () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("ADMIN") });
    const { rerender } = render(
      <TaskSubmissions task={task("IN_PROGRESS")} onWorkflowRefresh={vi.fn()} />,
    );
    expect(screen.queryByRole("button", { name: "Submit Work" })).not.toBeInTheDocument();

    mocks.useAuth.mockReturnValue({ viewer: viewer("SUPER_ADMIN") });
    rerender(<TaskSubmissions task={task("REVISION_REQUIRED")} onWorkflowRefresh={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Resubmit Work" })).not.toBeInTheDocument();
  });

  it("allows ADMIN to review only the page one latest Submission", () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("ADMIN") });
    const { rerender } = render(
      <TaskSubmissions task={task("SUBMITTED")} onWorkflowRefresh={vi.fn()} />,
    );

    expect(screen.getAllByRole("button", { name: "Review" })).toHaveLength(1);
    expect(screen.getByText("Latest")).toBeInTheDocument();

    mocks.useTaskSubmissions.mockReturnValue({
      ...hookValue,
      meta: { page: 2, limit: 20, total: 22, totalPages: 2 },
    });
    rerender(<TaskSubmissions task={task("SUBMITTED")} onWorkflowRefresh={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "Review" })).not.toBeInTheDocument();
    expect(screen.queryByText("Latest")).not.toBeInTheDocument();
  });

  it("requires revision feedback and never stores it on Submission data", async () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("ADMIN") });
    mocks.reviewCreate.mockResolvedValueOnce({
      id: "review-1",
      submissionId: "submission-2",
      reviewerId: "admin-1",
      action: "REQUEST_REVISION",
      feedback: "Fix it",
      reviewedAt: "2026-08-23T00:00:00.000Z",
      createdAt: "2026-08-23T00:00:00.000Z",
    });

    render(<TaskSubmissions task={task("RESUBMITTED")} onWorkflowRefresh={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Review" }));
    fireEvent.click(screen.getByLabelText("Request Revision"));
    fireEvent.click(screen.getByRole("button", { name: "Save Review" }));
    expect(screen.getByText("Revision feedback is required.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Feedback/), {
      target: { value: "  Fix it  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Review" }));

    await waitFor(() =>
      expect(mocks.reviewCreate).toHaveBeenCalledWith("submission-2", {
        action: "REQUEST_REVISION",
        feedback: "Fix it",
      }),
    );
    expect(JSON.stringify(hookValue.submissions)).not.toContain("review");
  });

  it("reconciles workflow after ambiguous network submission errors without retrying", async () => {
    mocks.useAuth.mockReturnValue({ viewer: viewer("MEMBER") });
    mocks.submissionCreate.mockRejectedValueOnce(
      new OperixApiError("Network", {
        status: 0,
        code: "NETWORK_ERROR",
      }),
    );
    const refreshWorkflow = vi.fn().mockResolvedValue(undefined);

    render(<TaskSubmissions task={task("IN_PROGRESS")} onWorkflowRefresh={refreshWorkflow} />);

    fireEvent.click(screen.getByRole("button", { name: "Submit Work" }));
    fireEvent.change(screen.getByLabelText(/Submission Text/), {
      target: { value: "Done" },
    });
    fireEvent.click(screen.getAllByRole("button", { name: "Submit Work" })[1]);

    await waitFor(() => expect(refreshWorkflow).toHaveBeenCalledTimes(1));
    expect(hookValue.refresh).toHaveBeenCalledTimes(1);
    expect(mocks.submissionCreate).toHaveBeenCalledTimes(1);
  });
});
