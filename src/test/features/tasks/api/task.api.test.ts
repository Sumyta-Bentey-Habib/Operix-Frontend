import { afterEach, describe, expect, it, vi } from "vitest";
import type { OperixViewer } from "@/types/auth";
import { taskApi } from "@/features/tasks/api/task.api";
import {
  buildTaskListQuery,
  DEFAULT_TASK_FILTERS,
  type TaskFilterState,
} from "@/features/tasks/types/task.types";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const viewer = (role: OperixViewer["role"]): OperixViewer => ({
  userId: `${role.toLowerCase()}-1`,
  role,
  status: "ACTIVE",
  scope:
    role === "SUPER_ADMIN"
      ? { type: "GLOBAL" }
      : role === "ADMIN"
        ? { type: "ADMIN", teamIds: ["team-1"] }
        : { type: "MEMBER", teamId: "team-1" },
});

const filters: TaskFilterState = {
  ...DEFAULT_TASK_FILTERS,
  status: "PENDING",
  priority: "HIGH",
  teamId: "team-1",
  assignedMemberId: "member-1",
  overdue: "OVERDUE",
  q: "  report  ",
  sort: "DUE_AT_ASC",
};

describe("taskApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists Tasks with exact supported query fields", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ data: [], meta: {} }));

    await taskApi.list({
      page: 1,
      limit: 20,
      status: "PENDING",
      priority: "HIGH",
      overdue: true,
      q: "report",
      sort: "DUE_AT_ASC",
      teamId: "team-1",
      assignedMemberId: "member-1",
    });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/tasks?page=1&limit=20&status=PENDING&priority=HIGH&overdue=true&q=report&sort=DUE_AT_ASC&teamId=team-1&assignedMemberId=member-1",
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ credentials: "include" });
  });

  it("gets Task detail and history by exact endpoints", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "task-1" }))
      .mockResolvedValueOnce(jsonResponse({ data: [], meta: {} }));

    await taskApi.getById("task-1");
    await taskApi.getHistory("task-1", { page: 1, limit: 20 });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("http://localhost:5000/api/v1/tasks/task-1");
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "http://localhost:5000/api/v1/tasks/task-1/history?page=1&limit=20",
    );
  });

  it("creates Tasks without generated or unsupported fields", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "task-1" }));

    await taskApi.create({
      title: "Prepare monthly report",
      description: "Details",
      remarks: "Internal",
      priority: "HIGH",
      dueAt: "2026-08-23T12:00:00.000Z",
      teamId: "team-1",
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.method).toBe("POST");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe("http://localhost:5000/api/v1/tasks");
    expect(JSON.parse(String(request.body))).toEqual({
      title: "Prepare monthly report",
      description: "Details",
      remarks: "Internal",
      priority: "HIGH",
      dueAt: "2026-08-23T12:00:00.000Z",
      teamId: "team-1",
    });
    expect(String(request.body)).not.toContain("referenceCode");
    expect(String(request.body)).not.toContain("categoryId");
    expect(String(request.body)).not.toContain("assignee");
    expect(String(request.body)).not.toContain("createdById");
    expect(String(request.body)).not.toContain("isOverdue");
  });

  it("assigns and starts Tasks with exact methods and payloads", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "task-1" }))
      .mockResolvedValueOnce(jsonResponse({ id: "task-1" }));

    await taskApi.assign("task-1", { memberId: "member-1", note: "Please start today" });
    await taskApi.start("task-1");

    const assignRequest = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const startRequest = fetchMock.mock.calls[1]?.[1] as RequestInit;
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/tasks/task-1/assignments",
    );
    expect(assignRequest.method).toBe("POST");
    expect(JSON.parse(String(assignRequest.body))).toEqual({
      memberId: "member-1",
      note: "Please start today",
    });
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "http://localhost:5000/api/v1/tasks/task-1/start",
    );
    expect(startRequest.method).toBe("POST");
    expect(startRequest.body).toBeUndefined();
  });
});

describe("buildTaskListQuery", () => {
  it("allows SUPER_ADMIN to send team and assigned Member filters", () => {
    expect(buildTaskListQuery(viewer("SUPER_ADMIN"), filters, 1, 20)).toEqual({
      page: 1,
      limit: 20,
      status: "PENDING",
      priority: "HIGH",
      overdue: true,
      q: "report",
      sort: "DUE_AT_ASC",
      teamId: "team-1",
      assignedMemberId: "member-1",
    });
  });

  it("strips stale teamId for ADMIN before the API call", () => {
    expect(buildTaskListQuery(viewer("ADMIN"), filters, 1, 20)).toEqual({
      page: 1,
      limit: 20,
      status: "PENDING",
      priority: "HIGH",
      overdue: true,
      q: "report",
      sort: "DUE_AT_ASC",
      assignedMemberId: "member-1",
    });
  });

  it("strips stale teamId and assignedMemberId for MEMBER before the API call", () => {
    expect(buildTaskListQuery(viewer("MEMBER"), filters, 1, 20)).toEqual({
      page: 1,
      limit: 20,
      status: "PENDING",
      priority: "HIGH",
      overdue: true,
      q: "report",
      sort: "DUE_AT_ASC",
    });
  });

  it("omits ALL filters and blank search values", () => {
    expect(buildTaskListQuery(viewer("SUPER_ADMIN"), DEFAULT_TASK_FILTERS, 2, 20)).toEqual({
      page: 2,
      limit: 20,
      sort: "CREATED_AT_DESC",
    });
  });
});
