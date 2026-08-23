"use client";

import { useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { ATTACHMENT_FILE_ACCEPT, MAX_ATTACHMENT_FILES_PER_BATCH } from "@/features/files";
import type { ValidatedFileSelection } from "@/features/files";
import type { CreateSubmissionInput } from "../../types/submission.types";
import {
  canSubmitSelectedFiles,
  validateSubmissionFileSelection,
  validateSubmissionText,
} from "../../utils/submission-file-validation";
import styles from "./SubmissionFormDialog.module.css";

export interface SubmissionFormDialogProps {
  open: boolean;
  mode: "submit" | "resubmit";
  pending: boolean;
  error: string | null;
  onSubmit: (input: CreateSubmissionInput) => Promise<boolean>;
  onClose: () => void;
}

export const SubmissionFormDialog = ({
  open,
  mode,
  pending,
  error,
  onSubmit,
  onClose,
}: SubmissionFormDialogProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<ValidatedFileSelection[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);

  const title = mode === "resubmit" ? "Resubmit Work" : "Submit Work";
  const canSubmit = useMemo(
    () =>
      submissionText.trim().length > 0 &&
      canSubmitSelectedFiles(selectedFiles, fileError) &&
      !pending,
    [fileError, pending, selectedFiles, submissionText],
  );

  const handleFiles = (files: File[]) => {
    const validation = validateSubmissionFileSelection(files);
    setSelectedFiles(validation.selectedFiles);
    setFileError(validation.fileError);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFiles(Array.from(event.target.files ?? []));
  };

  const handleRemoveFile = (index: number) => {
    const nextFiles = selectedFiles
      .filter((_, selectedIndex) => selectedIndex !== index)
      .map((selected) => selected.file);
    handleFiles(nextFiles);

    if (nextFiles.length === 0 && inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    const nextTextError = validateSubmissionText(submissionText);
    setTextError(nextTextError);
    if (nextTextError || !canSubmit) return;

    const submitted = await onSubmit({
      submissionText: submissionText.trim(),
      files: selectedFiles.map((selected) => selected.file),
    });

    if (!submitted) return;

    setSubmissionText("");
    setSelectedFiles([]);
    setFileError(null);
    setTextError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      description="Submission files are uploaded with this version and cannot be changed later."
      onClose={onClose}
    >
      <div className={styles.form}>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <label className={styles.label} htmlFor="submission-text">
          Submission Text *
        </label>
        <textarea
          id="submission-text"
          value={submissionText}
          onChange={(event) => {
            setSubmissionText(event.target.value);
            setTextError(null);
          }}
          disabled={pending}
          rows={6}
        />
        {textError && <p className={styles.error}>{textError}</p>}

        <label className={styles.label} htmlFor="submission-files">
          Supporting Files
        </label>
        <input
          ref={inputRef}
          id="submission-files"
          type="file"
          multiple
          accept={ATTACHMENT_FILE_ACCEPT}
          onChange={handleFileChange}
          disabled={pending}
        />
        <p className={styles.note}>
          Optional. Each Submission version can include up to {MAX_ATTACHMENT_FILES_PER_BATCH}{" "}
          files.
        </p>
        {fileError && (
          <p className={styles.error} role="alert">
            {fileError}
          </p>
        )}

        {selectedFiles.length > 0 && (
          <ul className={styles.selection}>
            {selectedFiles.map((selected, index) => (
              <li key={`${selected.file.name}-${index}`} className={styles.selectionItem}>
                <div>
                  <strong>{selected.file.name}</strong>
                  {selected.error && <p className={styles.error}>{selected.error}</p>}
                </div>
                <button type="button" onClick={() => handleRemoveFile(index)} disabled={pending}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => void handleSubmit()}
            disabled={!canSubmit}
          >
            {pending ? "Saving..." : title}
          </button>
        </div>
      </div>
    </Modal>
  );
};
