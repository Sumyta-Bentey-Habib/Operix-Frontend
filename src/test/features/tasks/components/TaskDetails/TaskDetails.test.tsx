import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskDetails } from "@/features/tasks/components/TaskDetails";
import type { Task } from "@/features/tasks/types/task.types";
import { TASK_DETAILS_STRINGS } from "@/utils/task-strings";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  useTask: vi.fn(),
  assign: vi.fn(),
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
  isOverdue: false,
  dueAt: "2026-09-30T18:00:00.000Z",
  startedAt: "2026-09-01T10:00:00.000Z",
  completedAt: null,
  cancelledAt: null,
  teamId: "team-alpha-id",
  categoryId: "cat-engineering-id",
  createdById: "admin-super-id",
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
    mocks.useAuth.mockReturnValue({ viewer: { role: "ADMIN", id: "admin-1" } });
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
    mocks.useAuth.mockReturnValue({ viewer: { role: "ADMIN", id: "admin-1" } });
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
    mocks.useAuth.mockReturnValue({ viewer: { role: "ADMIN", id: "admin-1" } });
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

    // Title & Reference
    expect(screen.getByText("Redesign Operation Matrix")).toBeInTheDocument();
    expect(screen.getAllByText("TSK-00123")).toHaveLength(2);

    // Stepper header
    expect(screen.getByText(TASK_DETAILS_STRINGS.stepper.title)).toBeInTheDocument();

    // Overview & Remarks
    expect(screen.getByText(TASK_DETAILS_STRINGS.sections.overview)).toBeInTheDocument();
    expect(screen.getByText("Comprehensive redesign of operations matrix workflow.")).toBeInTheDocument();
    expect(screen.getByText("Deliver before fiscal quarter end.")).toBeInTheDocument();

    // Default active tab is Submissions
    expect(screen.getByTestId("submissions-workspace")).toBeInTheDocument();

    // Copy reference code
    const copyButton = screen.getByLabelText(TASK_DETAILS_STRINGS.referenceCode.copyAria);
    fireEvent.click(copyButton);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("TSK-00123");
    await waitFor(() => {
      expect(screen.getByText(TASK_DETAILS_STRINGS.referenceCode.copied)).toBeInTheDocument();
    });
  });

  it("switches workspace tabs between Submissions, Attachments, and Activity History", () => {
    mocks.useAuth.mockReturnValue({ viewer: { role: "ADMIN", id: "admin-1" } });
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
    const attachmentsTab = screen.getByRole("tab", { name: new RegExp(TASK_DETAILS_STRINGS.tabs.attachments, "i") });
    fireEvent.click(attachmentsTab);
    expect(screen.getByTestId("attachments-workspace")).toBeInTheDocument();

    // Switch to History
    const historyTab = screen.getByRole("tab", { name: new RegExp(TASK_DETAILS_STRINGS.tabs.history, "i") });
    fireEvent.click(historyTab);
    expect(screen.getByTestId("history-workspace")).toBeInTheDocument();
  });

  it("shows Assign Task button for ADMIN on PENDING task and opens dialog", () => {
    mocks.useAuth.mockReturnValue({ viewer: { role: "ADMIN", id: "admin-1" } });
    mocks.useTask.mockReturnValue({
      task: { ...mockTask, status: "PENDING" },
      loading: false,
      error: null,
      setTask: vi.fn(),
      refresh: vi.fn(),
    });

    render(<TaskDetails taskId="task-test-id" />);

    const assignButton = screen.getByRole("button", { name: TASK_DETAILS_STRINGS.actions.assignTask });
    expect(assignButton).toBeInTheDocument();
    fireEvent.click(assignButton);

    // Dialog title appears
    expect(screen.getByRole("heading", { name: "Assign Task" })).toBeInTheDocument();
  });

  it("shows Start Task button for MEMBER on ASSIGNED task", () => {
    mocks.useAuth.mockReturnValue({ viewer: { role: "MEMBER", id: "member-1" } });
    mocks.useTask.mockReturnValue({
      task: { ...mockTask, status: "ASSIGNED" },
      loading: false,
      error: null,
      setTask: vi.fn(),
      refresh: vi.fn(),
    });

    render(<TaskDetails taskId="task-test-id" />);

    expect(screen.getByRole("button", { name: "Start Task" })).toBeInTheDocument();
  });
});
