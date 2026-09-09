import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TodoFloatingButton } from "@/features/todos/components/TodoFloatingButton/TodoFloatingButton";
import type { TodoItem, TodoStats } from "@/features/todos/types/todo.types";
import type { OperixViewer } from "@/types/auth";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
  todoApi: {
    list: vi.fn(),
    summary: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    complete: vi.fn(),
    reopen: vi.fn(),
    delete: vi.fn(),
    clearCompleted: vi.fn(),
  },
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: mocks.useAuth,
}));

vi.mock("@/features/todos/api/todo.api", () => ({
  todoApi: mocks.todoApi,
}));

describe("TodoFloatingButton", () => {
  const adminViewer: OperixViewer = {
    userId: "admin-fab-1",
    role: "ADMIN",
    status: "ACTIVE",
    scope: { type: "ADMIN", teamIds: ["team-1"] },
  };

  const memberViewer: OperixViewer = {
    userId: "member-fab-1",
    role: "MEMBER",
    status: "ACTIVE",
    scope: { type: "MEMBER", teamId: "team-1" },
  };

  const sampleTodos: TodoItem[] = [
    {
      id: "todo-1",
      title: "First Operational Task",
      description: null,
      priority: "URGENT",
      category: "OPERATIONS",
      dueDate: "2026-09-10",
      tags: [],
      completed: false,
      completedAt: null,
      isOverdue: false,
      createdAt: "2026-09-01T00:00:00.000Z",
      updatedAt: "2026-09-01T00:00:00.000Z",
    },
    {
      id: "todo-2",
      title: "Second Security Task",
      description: null,
      priority: "HIGH",
      category: "SECURITY",
      dueDate: null,
      tags: [],
      completed: false,
      completedAt: null,
      isOverdue: false,
      createdAt: "2026-09-02T00:00:00.000Z",
      updatedAt: "2026-09-02T00:00:00.000Z",
    },
  ];

  const sampleStats: TodoStats = {
    total: 2,
    active: 2,
    completed: 0,
    urgent: 2,
    overdue: 0,
    completionRate: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.todoApi.list.mockResolvedValue({
      data: sampleTodos,
      meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
    });
    mocks.todoApi.summary.mockResolvedValue(sampleStats);
  });

  it("does not render for non-admin viewers", () => {
    mocks.useAuth.mockReturnValue({
      viewer: memberViewer,
      isLoading: false,
    });

    const { container } = render(<TodoFloatingButton />);
    expect(container.firstChild).toBeNull();
  });

  it("renders floating button with active count badge for admin", async () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    render(<TodoFloatingButton />);

    const fabButton = screen.getByRole("button", { name: "Quick Todos" });
    expect(fabButton).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("opens popover on click and shows top active todos", async () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    render(<TodoFloatingButton />);

    const fabButton = screen.getByRole("button", { name: "Quick Todos" });
    fireEvent.click(fabButton);

    expect(screen.getByRole("dialog", { name: "Quick Tasks" })).toBeInTheDocument();
    expect(screen.getByText("Quick Tasks")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("First Operational Task")).toBeInTheDocument();
      expect(screen.getByText("Second Security Task")).toBeInTheDocument();
    });
  });

  it("toggles a todo status on checkbox click", async () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    mocks.todoApi.complete.mockResolvedValueOnce({
      ...sampleTodos[0],
      completed: true,
    });

    render(<TodoFloatingButton />);

    const fabButton = screen.getByRole("button", { name: "Quick Todos" });
    fireEvent.click(fabButton);

    await waitFor(() => {
      expect(screen.getByText("First Operational Task")).toBeInTheDocument();
    });

    const checkbox = screen.getByLabelText("Toggle First Operational Task");
    await act(async () => {
      fireEvent.click(checkbox);
    });

    expect(mocks.todoApi.complete).toHaveBeenCalledWith("todo-1");
  });

  it("provides 'View More' and 'Create' links that close popup when clicked", async () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    render(<TodoFloatingButton />);

    const fabButton = screen.getByRole("button", { name: "Quick Todos" });
    fireEvent.click(fabButton);

    const viewMoreLink = screen.getByRole("link", { name: "View More" });
    expect(viewMoreLink).toHaveAttribute("href", "/todos");

    const createLink = screen.getByRole("link", { name: "Create Todo" });
    expect(createLink).toHaveAttribute("href", "/todos?action=create");

    fireEvent.click(viewMoreLink);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes popover on pressing Escape key", async () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    render(<TodoFloatingButton />);

    const fabButton = screen.getByRole("button", { name: "Quick Todos" });
    fireEvent.click(fabButton);

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
