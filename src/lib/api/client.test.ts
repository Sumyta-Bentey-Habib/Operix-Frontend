import { afterEach, describe, expect, it, vi } from "vitest";
import {
  apiDownload,
  apiMultipartRequest,
  apiRequest,
  buildQueryString,
  joinApiUrl,
  OperixApiError,
} from "@/lib/api";

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });

describe("api client", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("joins API URLs safely and serializes scalar query values", () => {
    expect(
      joinApiUrl("/viewer/me", {
        search: "admin",
        page: 2,
        active: true,
        omitted: null,
        skipped: undefined,
      }),
    ).toBe("http://localhost:5000/api/v1/viewer/me?search=admin&page=2&active=true");
    expect(buildQueryString({ q: "one", empty: undefined })).toBe("q=one");
  });

  it("rejects array query values until a backend contract exists", () => {
    expect(() => buildQueryString({ status: ["ACTIVE"] as unknown as string })).toThrow(
      "Array query values are not supported yet.",
    );
  });

  it("includes credentials and handles JSON and empty responses", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(apiRequest("/health")).resolves.toEqual({ ok: true });
    await expect(apiRequest("/auth/sign-out")).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      credentials: "include",
    });
  });

  it.each([400, 401, 403, 404, 409, 500])("normalizes backend error status %i", async (status) => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse(
        {
          message: "Backend message",
          code: "BACKEND_CODE",
          details: { field: "email" },
        },
        { status },
      ),
    );

    await expect(apiRequest("/viewer/me")).rejects.toMatchObject({
      status,
      code: "BACKEND_CODE",
      message: "Backend message",
      details: { field: "email" },
    });
  });

  it("preserves network failure cause and rethrows AbortError", async () => {
    const networkError = new TypeError("failed");
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(networkError);

    await expect(apiRequest("/health")).rejects.toMatchObject({
      status: 0,
      code: "NETWORK_ERROR",
      cause: networkError,
    });

    const abortError = new DOMException("aborted", "AbortError");
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(abortError);

    await expect(apiRequest("/health")).rejects.toBe(abortError);
  });

  it("does not force Content-Type for FormData requests", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(jsonResponse({ uploaded: true }));
    const formData = new FormData();
    formData.append("file", new Blob(["x"]), "file.txt");

    await apiMultipartRequest("/files", formData);

    const headers = fetchMock.mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get("Content-Type")).toBeNull();
  });

  it("downloads blobs and reads filenames", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(new Blob(["hello"]), {
        status: 200,
        headers: {
          "Content-Disposition": 'attachment; filename="report.xlsx"',
        },
      }),
    );

    const result = await apiDownload("/exports/report");

    expect(result.blob).toBeInstanceOf(Blob);
    expect(result.filename).toBe("report.xlsx");
  });

  it("normalizes download error responses", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({ message: "No access", code: "FORBIDDEN" }, { status: 403 }),
    );

    await expect(apiDownload("/exports/report")).rejects.toBeInstanceOf(OperixApiError);
  });
});
