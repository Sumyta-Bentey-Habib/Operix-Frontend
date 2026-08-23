"use client";

import { useState } from "react";
import type {
  NotificationFilterState,
  NotificationReadFilter,
} from "../../types/notification.types";
import styles from "./NotificationFilters.module.css";

export interface NotificationFiltersProps {
  filters: NotificationFilterState;
  onApply: (filters: NotificationFilterState) => void;
  onReset: () => void;
}

export const NotificationFilters = ({ filters, onApply, onReset }: NotificationFiltersProps) => {
  const [draft, setDraft] = useState(filters);

  return (
    <form
      className={styles.filters}
      onSubmit={(event) => {
        event.preventDefault();
        onApply(draft);
      }}
    >
      <label className={styles.field}>
        <span className={styles.label}>Read status</span>
        <select
          className={styles.input}
          value={draft.read}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              read: event.target.value as NotificationReadFilter,
            }))
          }
        >
          <option value="ALL">All</option>
          <option value="UNREAD">Unread</option>
          <option value="READ">Read</option>
        </select>
      </label>
      <label className={styles.field}>
        <span className={styles.label}>Type</span>
        <input
          className={styles.input}
          placeholder="Exact type, for example TASK_ASSIGNED"
          value={draft.type}
          onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
        />
      </label>
      <div className={styles.actions}>
        <button className={styles.button} type="submit">
          Apply
        </button>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => {
            setDraft({ read: "ALL", type: "" });
            onReset();
          }}
        >
          Reset
        </button>
      </div>
    </form>
  );
};
