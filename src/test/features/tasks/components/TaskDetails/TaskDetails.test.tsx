import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskDetails } from "@/features/tasks/components/TaskDetails";
import type { Task } from "@/features/tasks/types/task.types";
import { TASK_DETAILS_STRINGS } from "@/utils/task-strings";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useTask: vi.fn(),
  assign: vi.fn(),
  claim: vi.fn(),
  updateSelfClaim: vi.fn(),
  start: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/features/tasks/hooks/use-task", () => ({
  useTask: mocks.useTask,
}));

vi.mock("@/features/tasks/api/task.api", () => ({
  taskApi: {
    assign: mocks.assign,
    claim: mocks.claim,
    updateSelfClaim: mocks.updateSelfClaim,
    start: mocks.start,
  },
}));

vi.mock("@/features/submissions", () => ({
  TaskSubmissions: () => <div data-testid="submissions-workspace">Submissions Panel</div>,
}));

vi.mock("@/features/tasks/components/TaskAttachments", () => ({
  TaskAttachments: () => <div data-testid="attachments-workspace">Attachments Panel</div>,
}));

vi.mock("@/features/tasks/components/TaskHistory", () => ({
  TaskHistory: () => <div data-testid="history-workspace">History Panel</div>,
}));

const mockTask: Task = {
  id: "task-test-id",
  referenceCode: "TSK-00123",
  title: "Redesign Operation Matrix",
  description: "Comprehensive redesign of operations matrix workflow.",
  remarks: "Deliver before fiscal quarter end.",
  priority: "HIGH",
  status: "IN_PROGRESS",
  completionMode: "REVIEW_REQUIRED",
  isOverdue: false,
  dueAt: "2026-09-30T18:00:00.000Z",
  startedAt: "2026-09-01T10:00:00.000Z",
  completedAt: null,
  cancelledAt: null,
  teamId: "team-alpha-id",
  categoryId: "cat-engineering-id",
  createdById: "admin-super-id",
  responsible: { id: "member-1", name: "Member One", role: "MEMBER" },
  createdAt: "2026-09-01T09:00:00.000Z",
  updatedAt: "2026-09-05T12:00:00.000Z",
};

describe("TaskDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders loading state when task is loading", () => {
    mocks.useAuth.mockReturnValue({ viewer: { role: "ADMIN", userId: "admin-1" } });
    mocks.useTask.mockReturnValue({
      task: null,
      loading: true,
      error: null,
      setTask: vi.fn(),
      refresh: vi.fn(),
    });

    render(<TaskDetails taskId="task-test-id" />);
    expect(screen.getByText(TASK_DETAILS_STRINGS.loading)).toBeInTheDocument();
  });

  it("renders error state when hook returns error", () => {
    mocks.useAuth.mockReturnValue({ viewer: { role: "ADMIN", userId: "admin-1" } });
    mocks.useTask.mockReturnValue({
      task: null,
      loading: false,
      error: new Error("Server communication failure"),
      setTask: vi.fn(),
      refresh: vi.fn(),
    });

    render(<TaskDetails taskId="task-test-id" />);
    expect(screen.getByText(/server communication failure/i)).toBeInTheDocument();
  });

  it("renders task details, breadcrumbs, copy button, and metadata cards", async () => {
    mocks.useAuth.mockReturnValue({ viewer: { role: "ADMIN", userId: "admin-1" } });
    mocks.useTask.mockReturnValue({
      task: mockTask,
      loading: false,
      error: null,
      setTask: vi.fn(),
      refresh: vi.fn(),
    });

    render(<TaskDetails taskId="task-test-id" />);

    // Breadcrumbs
    expect(screen.getByText(TASK_DETAILS_STRINGS.breadcrumbs.dashboard)).toBeInTheDocument();
    expect(screen.getByText(TASK_DETAILS_STRINGS.breadcrumbs.tasks)).toBeInTheDocument();
    expect(screen.getByText(TASK_DETAILS_STRINGS.navigation.backToTasks)).toBeInTheDocument();

    // Title
    expect(screen.getByText("Redesign Operation Matrix")).toBeInTheDocument();

    // Stepper header
    expect(screen.getByText(TASK_DETAILS_STRINGS.stepper.title)).toBeInTheDocument();

    // Overview & Remarks
    expect(screen.getByText(TASK_DETAILS_STRINGS.sections.overview)).toBeInTheDocument();
    expect(
      screen.getByText("Comprehensive redesign of operations matrix workflow."),
    ).toBeInTheDocument();
    expect(screen.getByText("Deliver before fiscal quarter end.")).toBeInTheDocument();

    // ADMIN on an active DIRECT/REVIEW task still starts with Submissions.
    expect(screen.getByTestId("submissions-workspace")).toBeInTheDocument();
  });

  it("switches workspace tabs between Submissions, Attachments, and Activity History", () => {
    mocks.useAuth.mockReturnValue({ viewer: { role: "ADMIN", userId: "admin-1" } });
    mocks.useTask.mockReturnValue({
      task: mockTask,
      loading: false,
      error: null,
      setTask: vi.fn(),
      refresh: vi.fn(),
    });

    render(<TaskDetails taskId="task-test-id" />);

    // Initially on Submissions
    expect(screen.getByTestId("submissions-workspace")).toBeInTheDocument();

    // Switch to Attachments
    const attachmentsTab = screen.getByRole("tab", {
      name: new RegExp(TASK_DETAILS_STRINGS.tabs.attachments, "i"),
    });
    fireEvent.click(attachmentsTab);
    expect(screen.getByTestId("attachments-workspace")).toBeInTheDocument();

    // Switch to History
    const historyTab = screen.getByRole("tab", {
      name: new RegExp(TASK_DETAILS_STRINGS.tabs.history, "i"),
    });
    fireEvent.click(historyTab);
    expect(screen.getByTestId("history-workspace")).toBeInTheDocument();
  });

  it("shows Assign Task button for ADMIN on PENDING task and opens dialog", () => {
    mocks.useAuth.mockReturnValue({ viewer: { role: "ADMIN", userId: "admin-1" } });
    mocks.useTask.mockReturnValue({
      task: { ...mockTask, status: "PENDING" },
      loading: false,
      error: null,
      setTask: vi.fn(),
      refresh: vi.fn(),
    });

    render(<TaskDetails taskId="task-test-id" />);

    const assignButton = screen.getByRole("button", {
      name: TASK_DETAILS_STRINGS.actions.assignTask,
    });
    expect(assignButton).toBeInTheDocument();
    fireEvent.click(assignButton);

    // Dialog title appears
    expect(screen.getByRole("heading", { name: "Assign Task" })).toBeInTheDocument();
  });

  it("allows Super Admin to enable self claim on an eligible legacy Global task", async () => {
    const setTask = vi.fn();
    const refresh = vi.fn().mockResolvedValue(undefined);
    const repairedTask = {
      ...mockTask,
      scope: "GLOBAL" as const,
      team: null,
      teamId: null,
      status: "PENDING" as const,
      responsible: null,
      recurrence: null,
      allowSelfClaim: true,
    };
    mocks.useAuth.mockReturnValue({ viewer: { role: "SUPER_ADMIN", userId: "chief-1" } });
    mocks.useTask.mockReturnValue({
      task: { ...repairedTask, allowSelfClaim: false },
      loading: false,
      error: null,
      setTask,
      refresh,
    });
    mocks.updateSelfClaim.mockResolvedValue(repairedTask);

    render(<TaskDetails taskId="task-test-id" />);
    expect(screen.getByText(TASK_DETAILS_STRINGS.metadata.selfClaimGlobalOpen)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: TASK_DETAILS_STRINGS.actions.enableSelfClaim,
      }),
    );

    await waitFor(() => {
      expect(mocks.updateSelfClaim).toHaveBeenCalledWith("task-test-id", {
        enabled: true,
      });
    });
    expect(setTask).toHaveBeenCalledWith(repairedTask);
    expect(refresh).toHaveBeenCalled();
  });

  it("shows Start Task button for MEMBER on ASSIGNED task", () => {
    mocks.useAuth.mockReturnValue({ viewer: { role: "MEMBER", userId: "member-1" } });
    mocks.useTask.mockReturnValue({
      task: { ...mockTask, status: "ASSIGNED", startedAt: null },
      loading: false,
      error: null,
      setTask: vi.fn(),
      refresh: vi.fn(),
    });

    render(<TaskDetails taskId="task-test-id" />);

    expect(screen.getByRole("button", { name: "Start Task" })).toBeInTheDocument();
  });

  it("opens Attachments by default for the Responsible Member on ASSIGNED and IN_PROGRESS tasks", () => {
    mocks.useAuth.mockReturnValue({ viewer: { role: "MEMBER", userId: "member-1" } });
    const hookState = {
      task: { ...mockTask, status: "ASSIGNED" as const, startedAt: null },
      loading: false,
      error: null,
      setTask: vi.fn(),
      refresh: vi.fn(),
    };
    mocks.useTask.mockReturnValue(hookState);

    const { unmount } = render(<TaskDetails taskId="task-test-id" />);
    expect(screen.getByTestId("attachments-workspace")).toBeInTheDocument();

    unmount();
    mocks.useTask.mockReturnValue({
      ...hookState,
      task: { ...mockTask, status: "IN_PROGRESS" as const },
    });
    render(<TaskDetails taskId="task-test-id" />);
    expect(screen.getByTestId("attachments-workspace")).toBeInTheDocument();
  });

  it("keeps Submissions primary for review workflow statuses", () => {
    mocks.useAuth.mockReturnValue({ viewer: { role: "MEMBER", userId: "member-1" } });
    mocks.useTask.mockReturnValue({
      task: { ...mockTask, status: "REVISION_REQUIRED" },
      loading: false,
      error: null,
      setTask: vi.fn(),
      refresh: vi.fn(),
    });

    render(<TaskDetails taskId="task-test-id" />);
    expect(screen.getByTestId("submissions-workspace")).toBeInTheDocument();
  });

  it("does not overwrite a manually selected tab after task refetch", () => {
    mocks.useAuth.mockReturnValue({ viewer: { role: "MEMBER", userId: "member-1" } });
    let currentTask: Task = { ...mockTask, status: "ASSIGNED", startedAt: null };
    mocks.useTask.mockImplementation(() => ({
      task: currentTask,
      loading: false,
      error: null,
      setTask: vi.fn(),
      refresh: vi.fn(),
    }));

    const { rerender } = render(<TaskDetails taskId="task-test-id" />);
    expect(screen.getByTestId("attachments-workspace")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /history/i }));
    expect(screen.getByTestId("history-workspace")).toBeInTheDocument();

    currentTask = { ...currentTask, updatedAt: "2026-09-06T12:00:00.000Z" };
    rerender(<TaskDetails taskId="task-test-id" />);
    expect(screen.getByTestId("history-workspace")).toBeInTheDocument();
  });

  it("uses the canonical Start response and switches to Attachments", async () => {
    const setTask = vi.fn();
    const refresh = vi.fn().mockResolvedValue(undefined);
    const assignedTask: Task = { ...mockTask, status: "ASSIGNED", startedAt: null };
    const startedTask: Task = {
      ...assignedTask,
      status: "IN_PROGRESS",
      startedAt: "2026-09-01T10:30:00.000Z",
    };
    mocks.useAuth.mockReturnValue({ viewer: { role: "MEMBER", userId: "member-1" } });
    mocks.useTask.mockReturnValue({
      task: assignedTask,
      loading: false,
      error: null,
      setTask,
      refresh,
    });
    mocks.start.mockResolvedValueOnce(startedTask);

    render(<TaskDetails taskId="task-test-id" />);
    fireEvent.click(screen.getByRole("button", { name: "Start Task" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Start Task" })[1]);

    await waitFor(() => expect(mocks.start).toHaveBeenCalledWith("task-test-id"));
    expect(setTask).toHaveBeenCalledWith(startedTask);
    expect(screen.getByTestId("attachments-workspace")).toBeInTheDocument();
  });

  it("uses the canonical Claim response, hides Claim, shows Start, and opens Attachments", async () => {
    let currentTask: Task = {
      ...mockTask,
      status: "PENDING",
      startedAt: null,
      allowSelfClaim: true,
      responsible: null,
      recurrence: null,
    };
    const refresh = vi.fn().mockResolvedValue(undefined);
    const claimedTask: Task = {
      ...currentTask,
      status: "ASSIGNED",
      allowSelfClaim: true,
      responsible: { id: "member-1", name: "Member One", role: "MEMBER" },
    };
    mocks.useAuth.mockReturnValue({ viewer: { role: "MEMBER", userId: "member-1" } });
    mocks.useTask.mockImplementation(() => ({
      task: currentTask,
      loading: false,
      error: null,
      setTask: (nextTask: Task) => {
        currentTask = nextTask;
      },
      refresh,
    }));
    mocks.claim.mockResolvedValueOnce(claimedTask);

    const { rerender } = render(<TaskDetails taskId="task-test-id" />);
    expect(screen.getByRole("button", { name: TASK_DETAILS_STRINGS.actions.claimTask }))
      .toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: TASK_DETAILS_STRINGS.actions.claimTask }));

    await waitFor(() => expect(mocks.claim).toHaveBeenCalledWith("task-test-id"));
    rerender(<TaskDetails taskId="task-test-id" />);

    expect(
      screen.queryByRole("button", { name: TASK_DETAILS_STRINGS.actions.claimTask }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start Task" })).toBeInTheDocument();
    expect(screen.getByTestId("attachments-workspace")).toBeInTheDocument();
  });

  it("keeps Attachments active through Claim then Start", async () => {
    let currentTask: Task = {
      ...mockTask,
      status: "PENDING",
      startedAt: null,
      allowSelfClaim: true,
      responsible: null,
      recurrence: null,
    };
    const refresh = vi.fn().mockResolvedValue(undefined);
    const claimedTask: Task = {
      ...currentTask,
      status: "ASSIGNED",
      responsible: { id: "member-1", name: "Member One", role: "MEMBER" },
    };
    const startedTask: Task = {
      ...claimedTask,
      status: "IN_PROGRESS",
      startedAt: "2026-09-01T10:30:00.000Z",
    };

    mocks.useAuth.mockReturnValue({ viewer: { role: "MEMBER", userId: "member-1" } });
    mocks.useTask.mockImplementation(() => ({
      task: currentTask,
      loading: false,
      error: null,
      setTask: (nextTask: Task) => {
        currentTask = nextTask;
      },
      refresh,
    }));
    mocks.claim.mockResolvedValueOnce(claimedTask);
    mocks.start.mockResolvedValueOnce(startedTask);

    const { rerender } = render(<TaskDetails taskId="task-test-id" />);
    fireEvent.click(screen.getByRole("button", { name: TASK_DETAILS_STRINGS.actions.claimTask }));
    await waitFor(() => expect(mocks.claim).toHaveBeenCalledWith("task-test-id"));
    rerender(<TaskDetails taskId="task-test-id" />);
    expect(screen.getByTestId("attachments-workspace")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Start Task" }));
    fireEvent.click(screen.getAllByRole("button", { name: "Start Task" })[1]);
    await waitFor(() => expect(mocks.start).toHaveBeenCalledWith("task-test-id"));
    rerender(<TaskDetails taskId="task-test-id" />);

    expect(screen.getByTestId("attachments-workspace")).toBeInTheDocument();
  });

  it("renders global task details and scope badge when scope is GLOBAL", () => {
    mocks.useAuth.mockReturnValue({ viewer: { role: "SUPER_ADMIN", userId: "super-1" } });
    mocks.useTask.mockReturnValue({
      task: {
        ...mockTask,
        scope: "GLOBAL",
        team: null,
        teamId: null,
        distribution: {
          status: "SENT",
          scheduledAt: "2026-09-12T00:00:00.000Z",
          sentAt: "2026-09-12T00:00:00.000Z",
        },
      },
      loading: false,
      error: null,
      setTask: vi.fn(),
      refresh: vi.fn(),
    });

    render(<TaskDetails taskId="task-test-id" />);

    expect(
      screen.getAllByText(TASK_DETAILS_STRINGS.metadata.scopeGlobal).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(TASK_DETAILS_STRINGS.metadata.distributionSent)).toBeInTheDocument();
  });

  it("renders all workflow steps as completed (with checkmarks, no number 5) when task is COMPLETED", () => {
    mocks.useAuth.mockReturnValue({ viewer: { role: "SUPER_ADMIN", userId: "super-1" } });
    mocks.useTask.mockReturnValue({
      task: {
        ...mockTask,
        status: "COMPLETED",
        completedAt: "2026-10-01T00:00:00.000Z",
      },
      loading: false,
      error: null,
      setTask: vi.fn(),
      refresh: vi.fn(),
    });

    render(<TaskDetails taskId="task-test-id" />);

    // No step should display the number 5 (they are all completed)
    expect(screen.queryByText("5")).not.toBeInTheDocument();
    expect(screen.getAllByText("Completed").length).toBeGreaterThanOrEqual(1);
  });
});
