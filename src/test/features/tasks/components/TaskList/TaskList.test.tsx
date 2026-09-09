import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskList } from "@/features/tasks/components/TaskList";
import type { OperixViewer } from "@/types/auth";

const mockUseAuth = vi.fn();
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseTasks = vi.fn();
vi.mock("@/features/tasks/hooks/use-tasks", () => ({
  useTasks: (viewer: OperixViewer | null) => mockUseTasks(viewer),
}));

vi.mock("@/features/tasks/components/TaskFilters", () => ({
  TaskFilters: () => <div data-testid="task-filters" />,
}));

vi.mock("@/features/tasks/components/TaskTable", () => ({
  TaskTable: () => <div data-testid="task-table" />,
}));

const makeViewer = (role: "SUPER_ADMIN" | "ADMIN" | "MEMBER"): OperixViewer => ({
  userId: "user-1",
  role,
  status: "ACTIVE",
  scope: role === "SUPER_ADMIN" ? { type: "GLOBAL" } : { type: "ADMIN", teamIds: ["team-1"] },
});

const defaultTaskHookState = {
  tasks: [],
  meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
  filters: {
    status: "ALL",
    priority: "ALL",
    teamId: "",
    assignedMemberId: "",
    overdue: "ALL",
    q: "",
    sort: "CREATED_AT_DESC",
  },
  loading: false,
  error: null,
  setPage: vi.fn(),
  applyFilters: vi.fn(),
  clearFilters: vi.fn(),
  refresh: vi.fn(),
};

describe("TaskList", () => {
  it("renders Create Task button for SUPER_ADMIN", () => {
    const viewer = makeViewer("SUPER_ADMIN");
    mockUseAuth.mockReturnValue({ viewer });
    mockUseTasks.mockReturnValue(defaultTaskHookState);

    render(<TaskList />);

    const createLink = screen.getByRole("link", { name: "Create Task" });
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute("href", "/tasks/new");
  });

  it("renders Create Task button for ADMIN", () => {
    const viewer = makeViewer("ADMIN");
    mockUseAuth.mockReturnValue({ viewer });
    mockUseTasks.mockReturnValue(defaultTaskHookState);

    render(<TaskList />);

    const createLink = screen.getByRole("link", { name: "Create Task" });
    expect(createLink).toBeInTheDocument();
    expect(createLink).toHaveAttribute("href", "/tasks/new");
  });

  it("does not render Create Task button for MEMBER", () => {
    const viewer = makeViewer("MEMBER");
    mockUseAuth.mockReturnValue({ viewer });
    mockUseTasks.mockReturnValue(defaultTaskHookState);

    render(<TaskList />);

    expect(screen.queryByRole("link", { name: "Create Task" })).not.toBeInTheDocument();
  });
});
