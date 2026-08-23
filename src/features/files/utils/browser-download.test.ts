import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveBrowserDownloadFilename, triggerBrowserDownload } from "./browser-download";

describe("browser download helper", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("prefers Content-Disposition filename, then original name, then a safe fallback", () => {
    expect(resolveBrowserDownloadFilename("server.pdf", "original.pdf")).toBe("server.pdf");
    expect(resolveBrowserDownloadFilename(null, "original.pdf")).toBe("original.pdf");
    expect(resolveBrowserDownloadFilename(null, null)).toBe("download");
  });

  it("revokes every created Blob URL after triggering the download", () => {
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:download");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    triggerBrowserDownload({
      blob: new Blob(["content"]),
      filename: "server.pdf",
      fallbackFilename: "original.pdf",
    });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:download");
  });
});
