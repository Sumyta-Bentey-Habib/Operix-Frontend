import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cleanFilename } from "@/features/files";
import type { AttachmentResponse } from "../../types/task-attachment.types";

export interface TaskAttachmentDeleteDialogProps {
  attachment: AttachmentResponse | null;
  pending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const TaskAttachmentDeleteDialog = ({
  attachment,
  pending,
  onConfirm,
  onClose,
}: TaskAttachmentDeleteDialogProps) => {
  const fileName = attachment?.file.originalName
    ? cleanFilename(attachment.file.originalName)
    : "this file";

  return (
    <ConfirmDialog
      open={Boolean(attachment)}
      title="Remove attachment"
      message={`Remove "${fileName}" from this Task?`}
      confirmLabel="Remove"
      pending={pending}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
};

