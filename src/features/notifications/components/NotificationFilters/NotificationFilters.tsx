"use client";

import { useState } from "react";
import { NOTIFICATION_STRINGS } from "../../constants/notification-strings";
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
        <span className={styles.label}>{NOTIFICATION_STRINGS.filters.readStatusLabel}</span>
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
          <option value="ALL">{NOTIFICATION_STRINGS.filters.all}</option>
          <option value="UNREAD">{NOTIFICATION_STRINGS.filters.unread}</option>
          <option value="READ">{NOTIFICATION_STRINGS.filters.read}</option>
        </select>
      </label>
      <label className={styles.field}>
        <span className={styles.label}>{NOTIFICATION_STRINGS.filters.typeLabel}</span>
        <input
          className={styles.input}
          placeholder={NOTIFICATION_STRINGS.filters.typePlaceholder}
          value={draft.type}
          onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value }))}
        />
      </label>
      <div className={styles.actions}>
        <button className={styles.button} type="submit">
          {NOTIFICATION_STRINGS.filters.apply}
        </button>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => {
            setDraft({ read: "ALL", type: "" });
            onReset();
          }}
        >
          {NOTIFICATION_STRINGS.filters.reset}
        </button>
      </div>
    </form>
  );
};
