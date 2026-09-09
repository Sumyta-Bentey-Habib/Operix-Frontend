import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TodoList } from "@/features/todos/components/TodoList/TodoList";
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

describe("TodoList", () => {
  const adminViewer: OperixViewer = {
    userId: "admin-list-test",
    role: "ADMIN",
    status: "ACTIVE",
    scope: { type: "ADMIN", teamIds: ["team-1"] },
  };

  const memberViewer: OperixViewer = {
    userId: "member-list-test",
    role: "MEMBER",
    status: "ACTIVE",
    scope: { type: "MEMBER", teamId: "team-1" },
  };

  const sampleTodo: TodoItem = {
    id: "todo-1",
    title: "Initial Todo Item",
    description: "Some details",
    priority: "MEDIUM",
    category: "OPERATIONS",
    dueDate: "2026-09-20",
    tags: ["ops"],
    completed: false,
    completedAt: null,
    isOverdue: false,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
  };

  const sampleStats: TodoStats = {
    total: 1,
    active: 1,
    completed: 0,
    urgent: 0,
    overdue: 0,
    completionRate: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.todoApi.list.mockResolvedValue({
      data: [sampleTodo],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    mocks.todoApi.summary.mockResolvedValue(sampleStats);
  });

  it("shows unauthorized alert for non-admin users", () => {
    mocks.useAuth.mockReturnValue({
      viewer: memberViewer,
      isLoading: false,
    });

    render(<TodoList />);
    expect(
      screen.getByText("Only administrators can access the admin todo list."),
    ).toBeInTheDocument();
  });

  it("renders header, stats, and handles quick task addition for admin", async () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText("Admin Todo List")).toBeInTheDocument();
      expect(screen.getByText("Total Tasks")).toBeInTheDocument();
    });

    expect(screen.getAllByText("In Progress").length).toBeGreaterThan(0);

    const addedTodo: TodoItem = {
      ...sampleTodo,
      id: "todo-2",
      title: "Review vendor NDA agreements",
    };

    mocks.todoApi.create.mockResolvedValueOnce(addedTodo);
    mocks.todoApi.list.mockResolvedValueOnce({
      data: [sampleTodo, addedTodo],
      meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
    });

    const quickInput = screen.getByPlaceholderText(
      "What needs to be done next? (Press Enter to add)",
    );
    fireEvent.change(quickInput, { target: { value: "Review vendor NDA agreements" } });

    const submitBtn = screen.getByRole("button", { name: "Add Task" });
    await act(async () => {
      fireEvent.click(submitBtn);
    });

    await waitFor(() => {
      expect(mocks.todoApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Review vendor NDA agreements" }),
      );
      expect(screen.getByText("Review vendor NDA agreements")).toBeInTheDocument();
    });
  });

  it("opens create modal on clicking New Todo button", async () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText("Admin Todo List")).toBeInTheDocument();
    });

    const newTodoBtn = screen.getByRole("button", { name: "New Todo" });
    fireEvent.click(newTodoBtn);

    expect(screen.getByText("Create Admin Task")).toBeInTheDocument();
  });

  it("filters tasks by status tabs", async () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    render(<TodoList />);

    await waitFor(() => {
      expect(screen.getByText("Admin Todo List")).toBeInTheDocument();
    });

    const completedTab = screen.getByRole("tab", { name: "Completed" });
    await act(async () => {
      fireEvent.click(completedTab);
    });

    expect(completedTab).toHaveAttribute("aria-selected", "true");
  });
});
