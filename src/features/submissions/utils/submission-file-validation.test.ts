import { describe, expect, it } from "vitest";
import {
  canSubmitSelectedFiles,
  validateSubmissionFileSelection,
  validateSubmissionText,
} from "./submission-file-validation";

const file = (name: string, options: { type?: string; size?: number } = {}) =>
  new File([new Uint8Array(options.size ?? 10)], name, {
    type: options.type ?? "",
  });

describe("Submission file validation", () => {
  it("requires trimmed Submission text", () => {
    expect(validateSubmissionText("")).toBe("Submission text is required.");
    expect(validateSubmissionText(" \n\t ")).toBe("Submission text is required.");
    expect(validateSubmissionText("Done")).toBeNull();
  });

  it("allows zero files and up to five files per version", () => {
    const empty = validateSubmissionFileSelection([]);
    expect(canSubmitSelectedFiles(empty.selectedFiles, empty.fileError)).toBe(true);

    const five = validateSubmissionFileSelection([
      file("1.pdf"),
      file("2.pdf"),
      file("3.pdf"),
      file("4.pdf"),
      file("5.pdf"),
    ]);
    expect(canSubmitSelectedFiles(five.selectedFiles, five.fileError)).toBe(true);

    const six = validateSubmissionFileSelection([
      file("1.pdf"),
      file("2.pdf"),
      file("3.pdf"),
      file("4.pdf"),
      file("5.pdf"),
      file("6.pdf"),
    ]);
    expect(six.fileError).toBe("Each Submission version can include a maximum of 5 files.");
    expect(canSubmitSelectedFiles(six.selectedFiles, six.fileError)).toBe(false);
  });

  it("blocks mixed invalid selections instead of silently dropping invalid files", () => {
    const validation = validateSubmissionFileSelection([file("report.pdf"), file("virus.exe")]);

    expect(validation.selectedFiles).toHaveLength(2);
    expect(validation.selectedFiles[1]?.error).toBe("This file type is not supported.");
    expect(canSubmitSelectedFiles(validation.selectedFiles, validation.fileError)).toBe(false);
  });
});
