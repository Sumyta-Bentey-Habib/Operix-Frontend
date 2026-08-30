import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAdminTodos } from "./use-admin-todos";
import type { OperixViewer } from "@/types/auth";

const mocks = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: mocks.useAuth,
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

  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("denies access to non-admin roles", () => {
    mocks.useAuth.mockReturnValue({
      viewer: memberViewer,
      isLoading: false,
    });

    const { result } = renderHook(() => useAdminTodos());
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.todos).toHaveLength(0);
  });

  it("loads and manages todos for admin role", () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    const { result } = renderHook(() => useAdminTodos());
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.todos.length).toBeGreaterThan(0);

    // Test adding a todo
    act(() => {
      result.current.addTodo({
        title: "Test Admin Task",
        priority: "HIGH",
        category: "OPERATIONS",
      });
    });

    expect(result.current.todos[0].title).toBe("Test Admin Task");
    expect(result.current.stats.total).toBeGreaterThan(0);
  });

  it("filters and searches todos correctly", () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    const { result } = renderHook(() => useAdminTodos());

    act(() => {
      result.current.setFilterState((prev) => ({
        ...prev,
        search: "expense",
      }));
    });

    expect(
      result.current.filteredTodos.every((item) =>
        item.title.toLowerCase().includes("expense") ||
        item.description?.toLowerCase().includes("expense") ||
        item.tags.some((t) => t.includes("expense")),
      ),
    ).toBe(true);
  });

  it("toggles and deletes todos", () => {
    mocks.useAuth.mockReturnValue({
      viewer: adminViewer,
      isLoading: false,
    });

    const { result } = renderHook(() => useAdminTodos());
    const initialId = result.current.todos[0].id;
    const initialStatus = result.current.todos[0].completed;

    act(() => {
      result.current.toggleTodo(initialId);
    });

    const updated = result.current.todos.find((t) => t.id === initialId);
    expect(updated?.completed).toBe(!initialStatus);

    act(() => {
      result.current.deleteTodo(initialId);
    });

    expect(result.current.todos.find((t) => t.id === initialId)).toBeUndefined();
  });
});
