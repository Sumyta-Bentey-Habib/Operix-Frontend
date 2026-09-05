import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearCompletedTodos,
  createTodo,
  deleteTodo,
  getDefaultAdminTodos,
  getStorageKey,
  getStoredTodos,
  setStoredTodos,
  toggleTodo,
  updateTodo,
} from "@/features/todos/utils/todo-storage";

describe("todo-storage", () => {
  const testUserId = "admin-test-123";

  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("generates predictable storage key", () => {
    expect(getStorageKey("admin-1")).toBe("operix_admin_todos_admin-1");
    expect(getStorageKey("")).toBe("operix_admin_todos_default_admin");
  });

  it("returns default todos when storage is empty", () => {
    const todos = getStoredTodos(testUserId);
    expect(todos.length).toBeGreaterThan(0);
    expect(todos[0].userId).toBe(testUserId);
  });

  it("persists and retrieves updated todos", () => {
    const defaultTodos = getDefaultAdminTodos(testUserId);
    setStoredTodos(testUserId, defaultTodos);

    const retrieved = getStoredTodos(testUserId);
    expect(retrieved.length).toBe(defaultTodos.length);
  });

  it("creates a new todo item at the top of the list", () => {
    const created = createTodo(testUserId, {
      title: "New Operational Audit",
      description: "Perform Q4 security review",
      priority: "URGENT",
      category: "SECURITY",
      tags: ["security", "q4"],
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe("New Operational Audit");
    expect(created.priority).toBe("URGENT");
    expect(created.completed).toBe(false);

    const stored = getStoredTodos(testUserId);
    expect(stored[0].id).toBe(created.id);
  });

  it("updates an existing todo item", () => {
    const created = createTodo(testUserId, {
      title: "Initial Title",
      priority: "LOW",
    });

    const updated = updateTodo(testUserId, created.id, {
      title: "Updated Title",
      priority: "HIGH",
    });

    expect(updated).not.toBeNull();
    expect(updated?.title).toBe("Updated Title");
    expect(updated?.priority).toBe("HIGH");
  });

  it("toggles completion state of a todo", () => {
    const created = createTodo(testUserId, {
      title: "Toggle Me",
    });

    expect(created.completed).toBe(false);

    const toggled = toggleTodo(testUserId, created.id);
    expect(toggled?.completed).toBe(true);
    expect(toggled?.completedAt).toBeDefined();

    const toggledBack = toggleTodo(testUserId, created.id);
    expect(toggledBack?.completed).toBe(false);
    expect(toggledBack?.completedAt).toBeNull();
  });

  it("deletes a todo item", () => {
    const created = createTodo(testUserId, {
      title: "To Be Deleted",
    });

    const deleted = deleteTodo(testUserId, created.id);
    expect(deleted).toBe(true);

    const stored = getStoredTodos(testUserId);
    expect(stored.find((t) => t.id === created.id)).toBeUndefined();
  });

  it("clears completed todos", () => {
    const todo1 = createTodo(testUserId, { title: "Active 1" });
    const todo2 = createTodo(testUserId, { title: "Completed 1" });
    toggleTodo(testUserId, todo2.id);

    clearCompletedTodos(testUserId);

    const stored = getStoredTodos(testUserId);
    expect(stored.find((t) => t.id === todo2.id)).toBeUndefined();
    expect(stored.find((t) => t.id === todo1.id)).toBeDefined();
  });
});
