import { afterEach, describe, expect, it, vi } from "vitest";
import { taskAttachmentApi } from "./task-attachment.api";

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

describe("taskAttachmentApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("lists Task attachments by exact endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([]));

    await taskAttachmentApi.list("task-1");

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/tasks/task-1/attachments",
    );
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ credentials: "include" });
  });

  it("uploads repeated files fields without manually setting Content-Type", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(jsonResponse([]));
    const first = new File(["a"], "A.pdf", { type: "application/pdf" });
    const second = new File(["b"], "B.png", { type: "image/png" });

    await taskAttachmentApi.upload("task-1", [first, second]);

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = request.headers as Headers;
    const body = request.body as FormData;

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/tasks/task-1/attachments",
    );
    expect(request.method).toBe("POST");
    expect(headers.has("Content-Type")).toBe(false);
    expect(body.getAll("files")).toEqual([first, second]);
  });

  it("removes attachments by attachment id, not file id", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(null, {
        status: 204,
      }),
    );

    await taskAttachmentApi.remove("task-1", "attachment-1");

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/tasks/task-1/attachments/attachment-1",
    );
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain("file-1");
    expect((fetchMock.mock.calls[0]?.[1] as RequestInit).method).toBe("DELETE");
  });
});
