import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskAttachmentUploader } from "@/features/tasks/components/TaskAttachmentUploader/TaskAttachmentUploader";

describe("TaskAttachmentUploader", () => {
  it("renders with Upload button enabled when no files are selected", () => {
    render(
      <TaskAttachmentUploader
        currentAttachmentCount={0}
        pending={false}
        error={null}
        onUpload={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: "Upload" });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it("clicks the file input when Upload is clicked with no files selected", () => {
    render(
      <TaskAttachmentUploader
        currentAttachmentCount={0}
        pending={false}
        error={null}
        onUpload={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Add attachments") as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click");

    const button = screen.getByRole("button", { name: "Upload" });
    fireEvent.click(button);

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it("uploads selected files when Upload is clicked after choosing files", async () => {
    const onUpload = vi.fn().mockResolvedValue(true);
    render(
      <TaskAttachmentUploader
        currentAttachmentCount={0}
        pending={false}
        error={null}
        onUpload={onUpload}
      />,
    );

    const input = screen.getByLabelText("Add attachments");
    const testFile = new File(["test-content"], "document.pdf", { type: "application/pdf" });

    fireEvent.change(input, {
      target: { files: [testFile] },
    });

    expect(screen.getByText("document.pdf")).toBeInTheDocument();

    const uploadButton = screen.getByRole("button", { name: "Upload" });
    expect(uploadButton).not.toBeDisabled();

    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith([testFile]);
    });
  });

  it("disables button and shows Uploading... when pending is true", () => {
    render(
      <TaskAttachmentUploader
        currentAttachmentCount={0}
        pending={true}
        error={null}
        onUpload={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: "Uploading..." });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it("handles drag and drop to select files", () => {
    render(
      <TaskAttachmentUploader
        currentAttachmentCount={0}
        pending={false}
        error={null}
        onUpload={vi.fn()}
      />,
    );

    const dropZone = screen.getByText("Add attachments").parentElement!;
    const testFile = new File(["img-data"], "photo.png", { type: "image/png" });

    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [testFile] },
    });

    expect(screen.getByText("photo.png")).toBeInTheDocument();
  });

  it("allows removing a selected file and re-enables file selection on Upload click", () => {
    render(
      <TaskAttachmentUploader
        currentAttachmentCount={0}
        pending={false}
        error={null}
        onUpload={vi.fn()}
      />,
    );

    const input = screen.getByLabelText("Add attachments") as HTMLInputElement;
    const testFile = new File(["data"], "sample.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    fireEvent.change(input, { target: { files: [testFile] } });
    expect(screen.getByText("sample.docx")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.queryByText("sample.docx")).not.toBeInTheDocument();

    const clickSpy = vi.spyOn(input, "click");
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
