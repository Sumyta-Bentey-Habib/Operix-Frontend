import { afterEach, describe, expect, it, vi } from "vitest";
import { fileApi } from "@/features/files/api/file.api";

describe("fileApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("downloads files through the file id endpoint", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(new Blob(["content"]), {
        status: 200,
        headers: {
          "Content-Disposition": 'attachment; filename="report.pdf"',
        },
      }),
    );

    const result = await fileApi.download("file-1");

    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "http://localhost:5000/api/v1/files/file-1/download",
    );
    expect(String(fetchMock.mock.calls[0]?.[0])).not.toContain("/api/v1/api/v1");
    expect(result.filename).toBe("report.pdf");
  });
});
