import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
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
}: TaskAttachmentDeleteDialogProps) => (
  <ConfirmDialog
    open={Boolean(attachment)}
    title="Remove attachment"
    message={`Remove "${attachment?.file.originalName ?? "this file"}" from this Task?`}
    confirmLabel="Remove"
    pending={pending}
    onConfirm={onConfirm}
    onCancel={onClose}
  />
);
