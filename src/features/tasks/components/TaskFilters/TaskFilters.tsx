"use client";

import { FormEvent, useState } from "react";
import { canFilterTasksByAssignedMember, canFilterTasksByTeam } from "@/lib/auth/permissions";
import type { OperixViewer } from "@/types/auth";
import type { Member } from "@/features/members";
import type { Team } from "@/features/teams";
import {
  DEFAULT_TASK_FILTERS,
  type TaskFilterState,
  type TaskOverdueFilter,
  type TaskPriorityFilter,
  type TaskScopeFilter,
  type TaskSort,
  type TaskStatusFilter,
} from "../../types/task.types";
import { TaskAssigneePicker } from "../TaskAssigneePicker";
import { TaskTeamPicker } from "../TaskTeamPicker";
import styles from "./TaskFilters.module.css";

const STATUS_OPTIONS: TaskStatusFilter[] = [
  "ALL",
  "PENDING",
  "ASSIGNED",
  "IN_PROGRESS",
  "SUBMITTED",
  "UNDER_REVIEW",
  "REVISION_REQUIRED",
  "RESUBMITTED",
  "COMPLETED",
  "CANCELLED",
];

const PRIORITY_OPTIONS: TaskPriorityFilter[] = ["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"];
const SCOPE_OPTIONS: TaskScopeFilter[] = ["ALL", "TEAM", "GLOBAL"];
const OVERDUE_OPTIONS: TaskOverdueFilter[] = ["ALL", "OVERDUE", "NOT_OVERDUE"];
const SORT_OPTIONS: TaskSort[] = [
  "CREATED_AT_DESC",
  "CREATED_AT_ASC",
  "DUE_AT_ASC",
  "DUE_AT_DESC",
  "PRIORITY_DESC",
  "PRIORITY_ASC",
];

export interface TaskFiltersProps {
  viewer: OperixViewer;
  filters: TaskFilterState;
  onApply: (filters: TaskFilterState) => void;
  onClear: () => void;
}

const FilterHeaderIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const SearchIcon = () => (
  <svg
    className={styles.searchIcon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const ApplyIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export const TaskFilters = ({ viewer, filters, onApply, onClear }: TaskFiltersProps) => {
  const [draft, setDraft] = useState(filters);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply({
      ...draft,
      q: draft.q.trim(),
      ...(draft.scope === "GLOBAL" ? { teamId: "" } : {}),
    });
  };

  const showTeamFilter = canFilterTasksByTeam(viewer) && draft.scope !== "GLOBAL";
  const showMemberFilter = canFilterTasksByAssignedMember(viewer);
  const hasScopedFilters = showTeamFilter || showMemberFilter;

  // Active filter counter
  const activeCount = [
    draft.q.trim() ? "q" : null,
    draft.scope !== "ALL" ? "scope" : null,
    draft.status !== "ALL" ? "status" : null,
    draft.priority !== "ALL" ? "priority" : null,
    draft.overdue !== "ALL" ? "overdue" : null,
    draft.teamId ? "team" : null,
    draft.assignedMemberId ? "member" : null,
  ].filter(Boolean).length;

  return (
    <form className={styles.filtersCard} onSubmit={submit}>
      {/* Top Section Header */}
      <div className={styles.cardHeader}>
        <div className={styles.headerTitleGroup}>
          <span className={styles.headerIconWrap}>
            <FilterHeaderIcon />
          </span>
          <h3 className={styles.headerTitle}>Task Controls</h3>
        </div>
        {activeCount > 0 && (
          <span className={styles.headerBadge}>{activeCount} Active Filters</span>
        )}
      </div>

      {/* Main Filter Controls Grid */}
      <div className={styles.primaryRow}>
        {/* Search */}
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Search</span>
          <div className={styles.searchWrapper}>
            <SearchIcon />
            <input
              className={`${styles.input} ${styles.searchInput}`}
              value={draft.q}
              onChange={(event) => setDraft((current) => ({ ...current, q: event.target.value }))}
              placeholder="Reference, title, description"
            />
          </div>
        </label>

        {/* Scope (SUPER_ADMIN only) */}
        {viewer.role === "SUPER_ADMIN" && (
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Scope</span>
            <select
              className={styles.select}
              value={draft.scope ?? "ALL"}
              onChange={(event) => {
                const nextScope = event.target.value as TaskScopeFilter;
                setDraft((current) => ({
                  ...current,
                  scope: nextScope,
                  ...(nextScope === "GLOBAL" ? { teamId: "" } : {}),
                }));
                if (nextScope === "GLOBAL") {
                  setSelectedTeam(null);
                }
              }}
            >
              {SCOPE_OPTIONS.map((scopeOption) => (
                <option key={scopeOption} value={scopeOption}>
                  {scopeOption === "ALL"
                    ? "All scopes"
                    : scopeOption === "GLOBAL"
                      ? "Global tasks"
                      : "Team tasks"}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Status */}
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Status</span>
          <select
            className={styles.select}
            value={draft.status}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                status: event.target.value as TaskStatusFilter,
              }))
            }
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "All statuses" : status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        {/* Priority */}
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Priority</span>
          <select
            className={styles.select}
            value={draft.priority}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                priority: event.target.value as TaskPriorityFilter,
              }))
            }
          >
            {PRIORITY_OPTIONS.map((priority) => (
              <option key={priority} value={priority}>
                {priority === "ALL" ? "All priorities" : priority}
              </option>
            ))}
          </select>
        </label>

        {/* Overdue */}
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Overdue</span>
          <select
            className={styles.select}
            value={draft.overdue}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                overdue: event.target.value as TaskOverdueFilter,
              }))
            }
          >
            {OVERDUE_OPTIONS.map((overdue) => (
              <option key={overdue} value={overdue}>
                {overdue === "ALL" ? "All" : overdue === "OVERDUE" ? "Overdue" : "Not Overdue"}
              </option>
            ))}
          </select>
        </label>

        {/* Sort */}
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Sort</span>
          <select
            className={styles.select}
            value={draft.sort}
            onChange={(event) =>
              setDraft((current) => ({ ...current, sort: event.target.value as TaskSort }))
            }
          >
            {SORT_OPTIONS.map((sort) => (
              <option key={sort} value={sort}>
                {sort.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button type="submit" className={styles.primaryButton}>
            <ApplyIcon />
            Apply Filters
          </button>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => {
              setSelectedTeam(null);
              setSelectedMember(null);
              setDraft(DEFAULT_TASK_FILTERS);
              onClear();
            }}
          >
            <RefreshIcon />
            Clear
          </button>
        </div>
      </div>

      {/* Scoped Pickers Section */}
      {hasScopedFilters ? (
        <div className={styles.scopedFilters}>
          {showTeamFilter ? (
            <div className={styles.scopedField}>
              <div className={styles.scopedHeader}>
                <div className={styles.scopedTitleGroup}>
                  <span className={styles.scopedDot} />
                  <span className={styles.scopedLabel}>Team filter</span>
                </div>
                {draft.teamId && <span className={styles.activeIndicator}>Active</span>}
              </div>
              <TaskTeamPicker
                selectedTeamId={draft.teamId}
                selectedTeam={selectedTeam}
                onSelect={(team) => {
                  setSelectedTeam(team);
                  setDraft((current) => ({ ...current, teamId: team.id }));
                }}
                onClear={() => {
                  setSelectedTeam(null);
                  setDraft((current) => ({ ...current, teamId: "" }));
                }}
              />
            </div>
          ) : null}

          {showMemberFilter ? (
            <div className={styles.scopedField}>
              <div className={styles.scopedHeader}>
                <div className={styles.scopedTitleGroup}>
                  <span className={styles.scopedDot} />
                  <span className={styles.scopedLabel}>Assigned Member filter</span>
                </div>
                {draft.assignedMemberId && (
                  <span className={styles.activeIndicator}>Active</span>
                )}
              </div>
              <TaskAssigneePicker
                selectedMemberId={draft.assignedMemberId}
                selectedMember={selectedMember}
                requireActive={false}
                onSelect={(member) => {
                  setSelectedMember(member);
                  setDraft((current) => ({ ...current, assignedMemberId: member.id }));
                }}
                onClear={() => {
                  setSelectedMember(null);
                  setDraft((current) => ({ ...current, assignedMemberId: "" }));
                }}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  );
};
