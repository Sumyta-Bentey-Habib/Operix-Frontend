import { afterEach, describe, expect, it, vi } from "vitest";
import { submissionApi } from "./submission.api";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("submissionApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists task Submissions with page and limit only", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ data: [], meta: {} }));

    await submissionApi.listForTask("task-1", { page: 2, limit: 20 });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/tasks/task-1/submissions?page=2&limit=20",
    );
  });

  it("gets Submission detail and attachments by exact endpoints", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "submission-1" }))
      .mockResolvedValueOnce(jsonResponse([]));

    await submissionApi.getById("submission-1");
    await submissionApi.listAttachments("submission-1");

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/submissions/submission-1",
    );
    expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
      "http://localhost:5000/api/v1/submissions/submission-1/attachments",
    );
  });

  it("creates Submissions through multipart with zero files", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "submission-1" }));

    await submissionApi.create("task-1", {
      submissionText: "  Work complete  ",
      files: [],
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = request.headers as Headers;
    const body = request.body as FormData;

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/tasks/task-1/submissions",
    );
    expect(request.method).toBe("POST");
    expect(headers.has("Content-Type")).toBe(false);
    expect(body.get("submissionText")).toBe("Work complete");
    expect(body.getAll("files")).toEqual([]);
    expect(Array.from(body.keys())).toEqual(["submissionText"]);
  });

  it("uses repeated files fields and never sends server owned fields", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "submission-1" }));
    const first = new File(["a"], "a.pdf", { type: "application/pdf" });
    const second = new File(["b"], "b.png", { type: "image/png" });

    await submissionApi.create("task-1", {
      submissionText: "Done",
      files: [first, second],
    });

    const body = (fetchMock.mock.calls[0]?.[1] as RequestInit).body as FormData;
    expect(body.getAll("files")).toEqual([first, second]);
    expect(body.has("version")).toBe(false);
    expect(body.has("status")).toBe(false);
    expect(body.has("submittedById")).toBe(false);
    expect(body.has("submittedAt")).toBe(false);
    expect(body.has("taskId")).toBe(false);
  });

  it("uses the same create endpoint for resubmission callers", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ id: "submission-2", version: 2 }));

    await submissionApi.create("task-1", {
      submissionText: "Revised work",
      files: [],
    });

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/tasks/task-1/submissions",
    );
    expect("resubmit" in submissionApi).toBe(false);
  });
});
