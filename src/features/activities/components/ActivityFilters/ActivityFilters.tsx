"use client";

import type { Dispatch, SetStateAction } from "react";
import {
  CalendarIcon,
  ContactsIcon,
  FilterEditIcon,
  SearchIcon,
} from "@/components/icons";
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
    className={styles.filtersContainer}
    onSubmit={(event) => {
      event.preventDefault();
      onApply();
    }}
  >
    <div className={styles.filterGrid}>
      <label className={styles.field}>
        <span className={styles.label}>Exact action</span>
        <div className={styles.inputWrapper}>
          <SearchIcon size={16} className={styles.inputIcon} />
          <input
            className={styles.input}
            placeholder="e.g. TASK_SUBMITTED"
            value={filters.action}
            onChange={(event) => onChange((current) => ({ ...current, action: event.target.value }))}
          />
        </div>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Entity type</span>
        <div className={styles.inputWrapper}>
          <FilterEditIcon size={16} className={styles.inputIcon} />
          <select
            className={`${styles.input} ${styles.selectInput}`}
            value={filters.entityType}
            onChange={(event) =>
              onChange((current) => ({ ...current, entityType: event.target.value }))
            }
          >
            <option value="">All Entity Types</option>
            {ACTIVITY_ENTITY_TYPE_OPTIONS.map((entityType) => (
              <option key={entityType} value={entityType}>
                {entityType}
              </option>
            ))}
          </select>
        </div>
      </label>

      {viewer.role !== "MEMBER" && (
        <label className={styles.field}>
          <span className={styles.label}>Actor Reference</span>
          <div className={styles.inputWrapper}>
            <ContactsIcon size={16} className={styles.inputIcon} />
            <input
              className={styles.input}
              placeholder="e.g. User ID or Ref"
              value={filters.actorId}
              onChange={(event) => onChange((current) => ({ ...current, actorId: event.target.value }))}
            />
          </div>
        </label>
      )}

      <label className={styles.field}>
        <span className={styles.label}>From</span>
        <div className={styles.inputWrapper}>
          <CalendarIcon size={16} className={styles.inputIcon} />
          <input
            className={styles.input}
            type="datetime-local"
            value={filters.from}
            onChange={(event) => onChange((current) => ({ ...current, from: event.target.value }))}
          />
        </div>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>To</span>
        <div className={styles.inputWrapper}>
          <CalendarIcon size={16} className={styles.inputIcon} />
          <input
            className={styles.input}
            type="datetime-local"
            value={filters.to}
            onChange={(event) => onChange((current) => ({ ...current, to: event.target.value }))}
          />
        </div>
      </label>

      <div className={styles.actions}>
        <button className={styles.button} type="submit">
          Apply
        </button>
        <button className={styles.secondaryButton} type="button" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>

    {error && (
      <div className={styles.errorBanner} role="alert">
        <span className={styles.errorIcon}>!</span>
        <p className={styles.error}>{error}</p>
      </div>
    )}
  </form>
);

