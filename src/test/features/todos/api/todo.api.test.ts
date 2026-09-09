import { afterEach, describe, expect, it, vi } from "vitest";
import { todoApi } from "@/features/todos/api/todo.api";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("todoApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists todos with query parameters", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        jsonResponse({
          data: [],
          meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
        }),
      );

    await todoApi.list({
      status: "ACTIVE",
      priority: "HIGH",
      category: "OPERATIONS",
      q: "audit",
      sort: "CREATED_AT_DESC",
    });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/todos?status=ACTIVE&priority=HIGH&category=OPERATIONS&q=audit&sort=CREATED_AT_DESC",
    );
  });

  it("fetches todo summary", async () => {
    const summaryData = {
      total: 5,
      active: 3,
      completed: 2,
      urgent: 1,
      overdue: 0,
      completionRate: 40,
    };
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse(summaryData));

    const result = await todoApi.summary();

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/todos/summary",
    );
    expect(result).toEqual(summaryData);
  });

  it("gets todo details by id", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "todo-123", title: "Test Todo" }));

    const result = await todoApi.getById("todo-123");

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/todos/todo-123",
    );
    expect(result.id).toBe("todo-123");
  });

  it("creates a todo with POST", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "todo-new", title: "New Task" }));

    await todoApi.create({
      title: "New Task",
      description: "Details",
      priority: "URGENT",
      category: "FINANCE",
      dueDate: "2026-09-15",
      tags: ["finance"],
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("http://localhost:5000/api/v1/todos");
    expect(request.method).toBe("POST");
    expect(JSON.parse(String(request.body))).toEqual({
      title: "New Task",
      description: "Details",
      priority: "URGENT",
      category: "FINANCE",
      dueDate: "2026-09-15",
      tags: ["finance"],
    });
  });

  it("updates a todo with PATCH", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "todo-1", title: "Updated Task" }));

    await todoApi.update("todo-1", {
      title: "Updated Task",
      priority: "HIGH",
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("http://localhost:5000/api/v1/todos/todo-1");
    expect(request.method).toBe("PATCH");
    expect(JSON.parse(String(request.body))).toEqual({
      title: "Updated Task",
      priority: "HIGH",
    });
  });

  it("completes a todo with POST :id/complete", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "todo-1", completed: true }));

    await todoApi.complete("todo-1");

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/todos/todo-1/complete",
    );
    expect(request.method).toBe("POST");
  });

  it("reopens a todo with POST :id/reopen", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "todo-1", completed: false }));

    await todoApi.reopen("todo-1");

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/todos/todo-1/reopen",
    );
    expect(request.method).toBe("POST");
  });

  it("deletes a todo with DELETE :id", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "todo-1" }));

    await todoApi.delete("todo-1");

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("http://localhost:5000/api/v1/todos/todo-1");
    expect(request.method).toBe("DELETE");
  });

  it("clears completed todos with DELETE /completed", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ deleted: 3 }));

    const result = await todoApi.clearCompleted();

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/todos/completed",
    );
    expect(request.method).toBe("DELETE");
    expect(result).toEqual({ deleted: 3 });
  });
});
