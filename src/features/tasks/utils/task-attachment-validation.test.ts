import { describe, expect, it } from "vitest";
import {
  canUploadSelectedAttachments,
  MAX_ATTACHMENT_FILE_SIZE,
  MAX_TASK_ATTACHMENTS,
  validateAttachmentSelection,
} from "./task-attachment-validation";

const file = (name: string, options: { type?: string; size?: number } = {}) =>
  new File([new Uint8Array(options.size ?? 10)], name, {
    type: options.type ?? "",
  });

describe("Task attachment validation", () => {
  it("accepts supported extensions case insensitively", () => {
    const validation = validateAttachmentSelection(
      [
        file("DOCUMENT.PDF", { type: "application/pdf" }),
        file("PHOTO.JPEG", { type: "image/jpeg" }),
        file("DECK.PPTX", {
          type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        }),
      ],
      0,
    );

    expect(validation.selectedFiles.every((selected) => selected.error === null)).toBe(true);
    expect(canUploadSelectedAttachments(validation.selectedFiles, validation.capacityError)).toBe(
      true,
    );
  });

  it("allows empty browser MIME for a supported extension", () => {
    const validation = validateAttachmentSelection([file("report.docx")], 0);

    expect(validation.selectedFiles[0]?.error).toBeNull();
  });

  it("rejects conflicting MIME and unsupported extensions", () => {
    const validation = validateAttachmentSelection(
      [
        file("photo.jpg", { type: "application/pdf" }),
        file("malware.exe", { type: "application/octet-stream" }),
      ],
      0,
    );

    expect(validation.selectedFiles[0]?.error).toMatch(/extension and browser reported type/);
    expect(validation.selectedFiles[1]?.error).toBe("This file type is not supported.");
    expect(canUploadSelectedAttachments(validation.selectedFiles, validation.capacityError)).toBe(
      false,
    );
  });

  it("rejects oversized files and long names", () => {
    const longName = `${"a".repeat(256)}.pdf`;
    const validation = validateAttachmentSelection(
      [
        file("large.pdf", {
          type: "application/pdf",
          size: MAX_ATTACHMENT_FILE_SIZE + 1,
        }),
        file(longName, { type: "application/pdf" }),
      ],
      0,
    );

    expect(validation.selectedFiles[0]?.error).toBe("Each attachment must be 10 MiB or smaller.");
    expect(validation.selectedFiles[1]?.error).toBe("File names must be 255 characters or fewer.");
  });

  it("blocks empty and over capacity selections", () => {
    expect(validateAttachmentSelection([], 0).capacityError).toBe(
      "Choose at least one file to upload.",
    );
    expect(validateAttachmentSelection([file("one.pdf")], MAX_TASK_ATTACHMENTS).capacityError).toBe(
      "This Task can have a maximum of 5 attachments.",
    );
    expect(validateAttachmentSelection([file("one.pdf"), file("two.pdf")], 4).capacityError).toBe(
      "Only 1 attachment slot remains.",
    );
  });

  it("does not silently partially accept a mixed invalid selection", () => {
    const validation = validateAttachmentSelection([file("A.pdf"), file("B.exe")], 0);

    expect(validation.selectedFiles).toHaveLength(2);
    expect(validation.selectedFiles[1]?.error).toBe("This file type is not supported.");
    expect(canUploadSelectedAttachments(validation.selectedFiles, validation.capacityError)).toBe(
      false,
    );
  });
});
