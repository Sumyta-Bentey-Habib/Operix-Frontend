import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAdminTodos } from "@/features/todos/hooks/use-admin-todos";
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

describe("useAdminTodos", () => {
  const adminViewer: OperixViewer = {
    userId: "admin-user-1",
    role: "ADMIN",
    status: "ACTIVE",
    scope: { type: "ADMIN", teamIds: ["team-1"] },
  };

  const memberViewer: OperixViewer = {
    userId: "member-user-1",
    role: "MEMBER",
    status: "ACTIVE",
    scope: { type: "MEMBER", teamId: "team-1" },
  };

  const sampleTodo: TodoItem = {
    id: "todo-1",
    title: "Review Q3 Report",
    description: "Expense check",
    priority: "HIGH",
    category: "FINANCE",
    dueDate: "2026-09-12",
    tags: ["finance", "expense"],
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

  it("denies access to non-admin roles without calling backend", async () => {
    mocks.useAuth.mockReturnValue({
      viewer: memberViewer,
      isLoading: false,
    });

    const { result } = renderHook(() => useAdminTodos());
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.todos).toHaveLength(0);
    expect(mocks.todoApi.list).not.toHaveBeenCalled();
    expect(mocks.todoApi.summary).not.toHaveBeenCalled();
  });

  it("loads todos and summary for admin role", async () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    const { result } = renderHook(() => useAdminTodos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.todos).toHaveLength(1);
    expect(result.current.todos[0].title).toBe("Review Q3 Report");
    expect(result.current.stats.total).toBe(1);
    expect(mocks.todoApi.list).toHaveBeenCalled();
    expect(mocks.todoApi.summary).toHaveBeenCalled();
  });

  it("adds a todo and refreshes", async () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    const newTodo: TodoItem = {
      ...sampleTodo,
      id: "todo-2",
      title: "New Task",
    };

    mocks.todoApi.create.mockResolvedValueOnce(newTodo);

    const { result } = renderHook(() => useAdminTodos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.addTodo({
        title: "New Task",
        priority: "MEDIUM",
        category: "OPERATIONS",
      });
    });

    expect(mocks.todoApi.create).toHaveBeenCalledWith({
      title: "New Task",
      priority: "MEDIUM",
      category: "OPERATIONS",
    });
  });

  it("toggles an active todo to complete and a completed todo to reopen", async () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    mocks.todoApi.complete.mockResolvedValueOnce({ ...sampleTodo, completed: true });

    const { result } = renderHook(() => useAdminTodos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Toggle active todo -> calls complete
    await act(async () => {
      await result.current.toggleTodo("todo-1");
    });

    expect(mocks.todoApi.complete).toHaveBeenCalledWith("todo-1");

    // Change todos to completed and toggle -> calls reopen
    mocks.todoApi.list.mockResolvedValueOnce({
      data: [{ ...sampleTodo, completed: true }],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    mocks.todoApi.reopen.mockResolvedValueOnce({ ...sampleTodo, completed: false });

    await act(async () => {
      await result.current.reloadTodos();
    });

    await act(async () => {
      await result.current.toggleTodo("todo-1");
    });

    expect(mocks.todoApi.reopen).toHaveBeenCalledWith("todo-1");
  });

  it("deletes a todo and clears completed todos", async () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    mocks.todoApi.delete.mockResolvedValueOnce(sampleTodo);
    mocks.todoApi.clearCompleted.mockResolvedValueOnce({ deleted: 1 });

    const { result } = renderHook(() => useAdminTodos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.deleteTodo("todo-1");
    });
    expect(mocks.todoApi.delete).toHaveBeenCalledWith("todo-1");

    await act(async () => {
      await result.current.clearCompleted();
    });
    expect(mocks.todoApi.clearCompleted).toHaveBeenCalled();
  });

  it("queries the backend when search filter changes", async () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    const { result } = renderHook(() => useAdminTodos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setFilterState((prev) => ({
        ...prev,
        search: "expense",
      }));
    });

    await waitFor(() => {
      expect(mocks.todoApi.list).toHaveBeenCalledWith(
        expect.objectContaining({ q: "expense" }),
        expect.any(Object),
      );
    });
  });
});
