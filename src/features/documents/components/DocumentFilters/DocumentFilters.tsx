"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { DocumentFilterState } from "../../types/document.types";

export const DOCUMENT_FIELD_CLASS = "grid gap-1.5";
export const DOCUMENT_LABEL_CLASS = "text-[0.82rem] font-bold text-[var(--text-primary)]";
export const DOCUMENT_INPUT_CLASS =
  "min-h-11 rounded-xl border border-[var(--border-default)] bg-[var(--bg-input)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] outline-none transition-all duration-200 focus:border-[var(--primary-emerald)] focus:shadow-[0_0_0_3px_var(--primary-emerald-glow)]";

const BUTTON_BASE_CLASS =
  "inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-transparent px-4 py-2.5 text-sm font-bold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary-emerald)]";

export interface DocumentFiltersProps {
  filters: DocumentFilterState;
  onChange: Dispatch<SetStateAction<DocumentFilterState>>;
  onApply: () => void;
  onReset: () => void;
  children?: ReactNode;
}

export const DocumentFilters = ({
  filters,
  onChange,
  onApply,
  onReset,
  children,
}: DocumentFiltersProps) => (
  <form
    className="grid grid-cols-1 gap-3.5 rounded-[18px] border border-[var(--border-default)] bg-[var(--bg-card)] p-4 shadow-[var(--card-shadow)] min-[900px]:grid-cols-3 min-[900px]:p-5"
    onSubmit={(event) => {
      event.preventDefault();
      onApply();
    }}
  >
    <label className={DOCUMENT_FIELD_CLASS}>
      <span className={DOCUMENT_LABEL_CLASS}>Search</span>
      <input
        className={DOCUMENT_INPUT_CLASS}
        placeholder="File name"
        value={filters.search}
        onChange={(event) => onChange((current) => ({ ...current, search: event.target.value }))}
      />
    </label>

    <label className={DOCUMENT_FIELD_CLASS}>
      <span className={DOCUMENT_LABEL_CLASS}>Source</span>
      <select
        className={DOCUMENT_INPUT_CLASS}
        value={filters.source}
        onChange={(event) =>
          onChange((current) => ({
            ...current,
            source: event.target.value as DocumentFilterState["source"],
          }))
        }
      >
        <option value="">All sources</option>
        <option value="TASK_ATTACHMENT">Task</option>
        <option value="SUBMISSION_ATTACHMENT">Submission</option>
      </select>
    </label>

    {children}

    <label className={DOCUMENT_FIELD_CLASS}>
      <span className={DOCUMENT_LABEL_CLASS}>Sort</span>
      <select
        className={DOCUMENT_INPUT_CLASS}
        value={filters.sort}
        onChange={(event) =>
          onChange((current) => ({
            ...current,
            sort: event.target.value as DocumentFilterState["sort"],
          }))
        }
      >
        <option value="CREATED_AT_DESC">Newest first</option>
        <option value="CREATED_AT_ASC">Oldest first</option>
      </select>
    </label>

    <div className="flex items-end gap-2">
      <button
        className={`${BUTTON_BASE_CLASS} bg-[var(--primary-emerald)] text-[var(--text-inverse)] shadow-[0_2px_8px_var(--primary-emerald-glow)] hover:-translate-y-px hover:bg-[var(--primary-emerald-hover)]`}
        type="submit"
      >
        Apply
      </button>
      <button
        className={`${BUTTON_BASE_CLASS} border-[var(--border-default)] bg-[var(--bg-card-subtle)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]`}
        type="button"
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  </form>
);
