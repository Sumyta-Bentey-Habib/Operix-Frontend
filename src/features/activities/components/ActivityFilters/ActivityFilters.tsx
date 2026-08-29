"use client";

import type { Dispatch, SetStateAction } from "react";
import type { OperixViewer } from "@/types/auth";
import { ACTIVITY_ENTITY_TYPE_OPTIONS, type ActivityFilterState } from "../../types/activity.types";
import styles from "./ActivityFilters.module.css";

export interface ActivityFiltersProps {
  viewer: OperixViewer;
  filters: ActivityFilterState;
  error: string | null;
  onChange: Dispatch<SetStateAction<ActivityFilterState>>;
  onApply: () => void;
  onReset: () => void;
}

export const ActivityFilters = ({
  viewer,
  filters,
  error,
  onChange,
  onApply,
  onReset,
}: ActivityFiltersProps) => (
  <form
    className={styles.filters}
    onSubmit={(event) => {
      event.preventDefault();
      onApply();
    }}
  >
    <label className={styles.field}>
      <span className={styles.label}>Exact action</span>
      <input
        className={styles.input}
        placeholder="TASK_SUBMITTED"
        value={filters.action}
        onChange={(event) => onChange((current) => ({ ...current, action: event.target.value }))}
      />
    </label>

    <label className={styles.field}>
      <span className={styles.label}>Entity type</span>
      <select
        className={styles.input}
        value={filters.entityType}
        onChange={(event) =>
          onChange((current) => ({ ...current, entityType: event.target.value }))
        }
      >
        <option value="">All</option>
        {ACTIVITY_ENTITY_TYPE_OPTIONS.map((entityType) => (
          <option key={entityType} value={entityType}>
            {entityType}
          </option>
        ))}
      </select>
    </label>

    {viewer.role !== "MEMBER" && (
      <label className={styles.field}>
        <span className={styles.label}>Actor Reference</span>
        <input
          className={styles.input}
          placeholder="Exact actor reference"
          value={filters.actorId}
          onChange={(event) => onChange((current) => ({ ...current, actorId: event.target.value }))}
        />
      </label>
    )}

    <label className={styles.field}>
      <span className={styles.label}>From</span>
      <input
        className={styles.input}
        type="datetime-local"
        value={filters.from}
        onChange={(event) => onChange((current) => ({ ...current, from: event.target.value }))}
      />
    </label>

    <label className={styles.field}>
      <span className={styles.label}>To</span>
      <input
        className={styles.input}
        type="datetime-local"
        value={filters.to}
        onChange={(event) => onChange((current) => ({ ...current, to: event.target.value }))}
      />
    </label>

    <div className={styles.actions}>
      <button className={styles.button} type="submit">
        Apply
      </button>
      <button className={styles.secondaryButton} type="button" onClick={onReset}>
        Reset
      </button>
    </div>

    {error && (
      <p className={styles.error} role="alert">
        {error}
      </p>
    )}
  </form>
);
