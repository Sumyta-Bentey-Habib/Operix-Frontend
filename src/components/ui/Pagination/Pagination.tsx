import type { PaginationMeta } from "@/types/pagination";
import styles from "./Pagination.module.css";

export interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const Pagination = ({ meta, onPageChange, disabled = false }: PaginationProps) => {
  const start = meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const end = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className={styles.pagination}>
      <p className={styles.summary}>
        Showing {start} to {end} of {meta.total} records
      </p>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          disabled={disabled || meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </button>
        <span className={styles.summary}>
          Page {meta.page} of {Math.max(meta.totalPages, 1)}
        </span>
        <button
          type="button"
          className={styles.button}
          disabled={disabled || meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};
