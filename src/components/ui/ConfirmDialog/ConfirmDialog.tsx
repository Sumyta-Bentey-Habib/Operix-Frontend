import { Modal } from "@/components/ui/Modal";
import styles from "./ConfirmDialog.module.css";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => (
  <Modal open={open} title={title} onClose={onCancel}>
    <p className={styles.message}>{message}</p>
    <div className={styles.actions}>
      <button
        type="button"
        className={styles.secondaryButton}
        onClick={onCancel}
        disabled={pending}
      >
        Cancel
      </button>
      <button type="button" className={styles.dangerButton} onClick={onConfirm} disabled={pending}>
        {pending ? "Saving..." : confirmLabel}
      </button>
    </div>
  </Modal>
);
