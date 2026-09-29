import { describe, expect, it } from "vitest";
import { cleanFilename, sanitizeUploadFile } from "@/features/files/utils/clean-filename";

describe("cleanFilename", () => {
  it("cleans the exact screenshot filename from user report with â¯ mojibake", () => {
    const corrupted = "Screenshot 2026-09-07 at 9.50.11â¯PM.png";
    expect(cleanFilename(corrupted)).toBe("Screenshot 2026-09-07 at 9.50.11 PM.png");
  });

  it("cleans screenshot filename with narrow no-break space (U+202F)", () => {
    const macScreenshot = "Screenshot 2026-09-07 at 9.50.11\u202FPM.png";
    expect(cleanFilename(macScreenshot)).toBe("Screenshot 2026-09-07 at 9.50.11 PM.png");
  });

  it("ensures space between timestamp and AM/PM when missing", () => {
    const noSpace = "Screenshot 2026-09-07 at 9.50.11PM.png";
    expect(cleanFilename(noSpace)).toBe("Screenshot 2026-09-07 at 9.50.11 PM.png");
  });


  it("cleans non-breaking space (U+00A0)", () => {
    const withNbsp = "Quarterly\u00A0Report\u00A02026.pdf";
    expect(cleanFilename(withNbsp)).toBe("Quarterly Report 2026.pdf");
  });

  it("handles null and undefined gracefully", () => {
    expect(cleanFilename(null)).toBe("");
    expect(cleanFilename(undefined)).toBe("");
    expect(cleanFilename("")).toBe("");
  });

  it("leaves already clean filenames intact", () => {
    const normal = "regular-task-attachment.docx";
    expect(cleanFilename(normal)).toBe("regular-task-attachment.docx");
  });
});

describe("sanitizeUploadFile", () => {
  it("creates a new File with sanitized name if non-standard whitespace is present", () => {
    const file = new File(["dummy content"], "Screenshot 2026-09-07 at 9.50.11\u202FPM.png", {
      type: "image/png",
    });

    const sanitized = sanitizeUploadFile(file);
    expect(sanitized.name).toBe("Screenshot 2026-09-07 at 9.50.11 PM.png");
    expect(sanitized.type).toBe("image/png");
  });

  it("returns original file instance if filename is already clean", () => {
    const file = new File(["dummy content"], "clean-file.png", {
      type: "image/png",
    });

    const sanitized = sanitizeUploadFile(file);
    expect(sanitized).toBe(file);
  });
});
