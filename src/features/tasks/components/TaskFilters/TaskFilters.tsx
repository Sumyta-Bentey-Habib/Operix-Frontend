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

export const TaskFilters = ({ viewer, filters, onApply, onClear }: TaskFiltersProps) => {
  const [draft, setDraft] = useState(filters);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply({
      ...draft,
      q: draft.q.trim(),
    });
  };

  return (
    <form className={styles.filters} onSubmit={submit}>
      <label className={styles.field}>
        <span>Search</span>
        <input
          value={draft.q}
          onChange={(event) => setDraft((current) => ({ ...current, q: event.target.value }))}
          placeholder="Reference, title, description"
        />
      </label>
      <label className={styles.field}>
        <span>Status</span>
        <select
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
      <label className={styles.field}>
        <span>Priority</span>
        <select
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
      <label className={styles.field}>
        <span>Overdue</span>
        <select
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
      <label className={styles.field}>
        <span>Sort</span>
        <select
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

      {canFilterTasksByTeam(viewer) && (
        <div className={styles.pickerField}>
          <span>Team filter</span>
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
      )}

      {canFilterTasksByAssignedMember(viewer) && (
        <div className={styles.pickerField}>
          <span>Assigned Member filter</span>
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
      )}

      <div className={styles.actions}>
        <button type="submit" className={styles.primaryButton}>
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
          Clear
        </button>
      </div>
    </form>
  );
};
