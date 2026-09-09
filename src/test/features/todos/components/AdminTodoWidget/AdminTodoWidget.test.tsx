import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminTodoWidget } from "@/features/todos/components/AdminTodoWidget/AdminTodoWidget";
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

describe("AdminTodoWidget", () => {
  const adminViewer: OperixViewer = {
    userId: "admin-widget-1",
    role: "ADMIN",
    status: "ACTIVE",
    scope: { type: "ADMIN", teamIds: ["team-1"] },
  };

  const memberViewer: OperixViewer = {
    userId: "member-widget-1",
    role: "MEMBER",
    status: "ACTIVE",
    scope: { type: "MEMBER", teamId: "team-1" },
  };

  const sampleTodo: TodoItem = {
    id: "todo-widget-1",
    title: "Urgent Widget Task",
    description: null,
    priority: "URGENT",
    category: "OPERATIONS",
    dueDate: null,
    tags: [],
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
    urgent: 1,
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

  it("does not render for non-admin users", () => {
    mocks.useAuth.mockReturnValue({
      viewer: memberViewer,
      isLoading: false,
    });

    const { container } = render(<AdminTodoWidget />);
    expect(container.firstChild).toBeNull();
  });

  it("renders widget and handles quick add and toggle for admin", async () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    render(<AdminTodoWidget />);

    await waitFor(() => {
      expect(screen.getByText("Admin Checklist")).toBeInTheDocument();
      expect(screen.getByText("View All Todos")).toBeInTheDocument();
      expect(screen.getByText("Urgent Widget Task")).toBeInTheDocument();
    });

    const newTodo: TodoItem = {
      ...sampleTodo,
      id: "todo-widget-2",
      title: "Another Widget Task",
    };
    mocks.todoApi.create.mockResolvedValueOnce(newTodo);
    mocks.todoApi.list.mockResolvedValueOnce({
      data: [sampleTodo, newTodo],
      meta: { page: 1, limit: 20, total: 2, totalPages: 1 },
    });

    const input = screen.getByPlaceholderText("What needs to be done next? (Press Enter to add)");
    fireEvent.change(input, { target: { value: "Another Widget Task" } });

    const submitBtn = screen.getByRole("button", { name: "Add Task" });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mocks.todoApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Another Widget Task" }),
      );
      expect(screen.getByText("Another Widget Task")).toBeInTheDocument();
    });
  });
});
