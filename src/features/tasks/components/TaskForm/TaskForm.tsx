"use client";

import { FormEvent, useState } from "react";
import {
  CalendarIcon,
  CheckCircleIcon,
  FileDocIcon,
  PlusIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import type { Team } from "@/features/teams";
import { TASK_CREATE_STRINGS } from "@/utils/task-strings";
import type { CreateTaskInput, TaskPriority } from "../../types/task.types";
import { TaskTeamPicker } from "../TaskTeamPicker";
import styles from "./TaskForm.module.css";

export interface TaskFormProps {
  pending: boolean;
  error: string | null;
  onSubmit: (input: CreateTaskInput) => void;
  onCancel?: () => void;
}

const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const toIsoOrUndefined = (value: string) => (value ? new Date(value).toISOString() : undefined);

export const TaskForm = ({ pending, error, onSubmit, onCancel }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [remarks, setRemarks] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueAt, setDueAt] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setLocalError(TASK_CREATE_STRINGS.validation.titleRequired);
      return;
    }

    if (!selectedTeam) {
      setLocalError(TASK_CREATE_STRINGS.validation.teamRequired);
      return;
    }

    setLocalError(null);
    const trimmedDescription = description.trim();
    const trimmedRemarks = remarks.trim();

    onSubmit({
      title: trimmedTitle,
      ...(trimmedDescription ? { description: trimmedDescription } : {}),
      ...(trimmedRemarks ? { remarks: trimmedRemarks } : {}),
      priority,
      ...(toIsoOrUndefined(dueAt) ? { dueAt: toIsoOrUndefined(dueAt) } : {}),
      teamId: selectedTeam.id,
    });
  };

  const activeError = localError ?? error;

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.layoutGrid}>
        {/* Left Column: Core Task Details */}
        <div className={styles.primaryColumn}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIconWrapper}>
                <FileDocIcon size={18} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>{TASK_CREATE_STRINGS.sections.generalInfo}</h2>
                <p className={styles.cardSubtitle}>
                  {TASK_CREATE_STRINGS.sections.generalInfoSubtitle}
                </p>
              </div>
            </div>

            <div className={styles.cardBody}>
              {/* Title Field */}
              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label htmlFor="task-title" className={styles.label}>
                    {TASK_CREATE_STRINGS.fields.titleLabel}
                    <span className={styles.required}>
                      {TASK_CREATE_STRINGS.fields.titleRequired}
                    </span>
                  </label>
                  <span className={styles.charCounter}>{title.length} / 180</span>
                </div>
                <input
                  id="task-title"
                  className={styles.input}
                  value={title}
                  maxLength={180}
                  onChange={(event) => {
                    setTitle(event.target.value);
                    if (localError) setLocalError(null);
                  }}
                  placeholder={TASK_CREATE_STRINGS.fields.titlePlaceholder}
                  required
                />
                <p className={styles.helperText}>{TASK_CREATE_STRINGS.fields.titleHelper}</p>
              </div>

              {/* Description Field */}
              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label htmlFor="task-description" className={styles.label}>
                    {TASK_CREATE_STRINGS.fields.descriptionLabel}
                  </label>
                  <span className={styles.charCounter}>{description.length} / 5000</span>
                </div>
                <textarea
                  id="task-description"
                  className={`${styles.textarea} ${styles.descriptionArea}`}
                  value={description}
                  maxLength={5000}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={TASK_CREATE_STRINGS.fields.descriptionPlaceholder}
                  rows={6}
                />
                <p className={styles.helperText}>{TASK_CREATE_STRINGS.fields.descriptionHelper}</p>
              </div>

              {/* Remarks Field */}
              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label htmlFor="task-remarks" className={styles.label}>
                    {TASK_CREATE_STRINGS.fields.remarksLabel}
                  </label>
                  <span className={styles.charCounter}>{remarks.length} / 2000</span>
                </div>
                <textarea
                  id="task-remarks"
                  className={`${styles.textarea} ${styles.remarksArea}`}
                  value={remarks}
                  maxLength={2000}
                  onChange={(event) => setRemarks(event.target.value)}
                  placeholder={TASK_CREATE_STRINGS.fields.remarksPlaceholder}
                  rows={3}
                />
                <p className={styles.helperText}>{TASK_CREATE_STRINGS.fields.remarksHelper}</p>
              </div>
            </div>
          </div>

          {/* Guidelines Card */}
          <div className={`${styles.card} ${styles.guidelinesCard}`}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIconWrapper}>
                <ShieldCheckIcon size={18} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>{TASK_CREATE_STRINGS.sections.guidelines}</h3>
              </div>
            </div>
            <ul className={styles.guidelinesList}>
              {TASK_CREATE_STRINGS.guidelines.map((item, index) => (
                <li key={index} className={styles.guidelineItem}>
                  <CheckCircleIcon size={14} className={styles.guidelineCheck} />
                  <div>
                    <strong className={styles.guidelineTitle}>{item.title}</strong>
                    <span className={styles.guidelineDesc}>{item.description}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Configuration and Actions */}
        <div className={styles.sidebarColumn}>
          {/* Assignment & Schedule Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIconWrapper}>
                <CalendarIcon size={18} />
              </div>
              <div>
                <h2 className={styles.cardTitle}>{TASK_CREATE_STRINGS.sections.configuration}</h2>
                <p className={styles.cardSubtitle}>
                  {TASK_CREATE_STRINGS.sections.configurationSubtitle}
                </p>
              </div>
            </div>

            <div className={styles.cardBody}>
              {/* Target Team */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  {TASK_CREATE_STRINGS.fields.teamLabel}
                  <span className={styles.required}>{TASK_CREATE_STRINGS.fields.teamRequired}</span>
                </label>
                <TaskTeamPicker
                  selectedTeamId={selectedTeam?.id ?? ""}
                  selectedTeam={selectedTeam}
                  onSelect={(team) => {
                    setSelectedTeam(team);
                    if (localError) setLocalError(null);
                  }}
                  onClear={() => setSelectedTeam(null)}
                />
                <p className={styles.helperText}>{TASK_CREATE_STRINGS.fields.teamHelper}</p>
              </div>

              {/* Priority Selector */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{TASK_CREATE_STRINGS.fields.priorityLabel}</label>
                <div
                  className={styles.prioritySelector}
                  role="radiogroup"
                  aria-label={TASK_CREATE_STRINGS.fields.priorityLabel}
                >
                  {PRIORITIES.map((level) => {
                    const isSelected = priority === level;
                    const priorityInfo = TASK_CREATE_STRINGS.priorities[level];
                    return (
                      <button
                        key={level}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`${styles.priorityButton} ${
                          styles[`priority_${level}`]
                        } ${isSelected ? styles.prioritySelected : ""}`}
                        onClick={() => setPriority(level)}
                      >
                        <span className={styles.priorityDot} />
                        <span className={styles.priorityButtonLabel}>{priorityInfo.label}</span>
                      </button>
                    );
                  })}
                </div>
                <p className={styles.helperText}>
                  {TASK_CREATE_STRINGS.priorities[priority].description}
                </p>
              </div>

              {/* Due Date & Time */}
              <div className={styles.fieldGroup}>
                <label htmlFor="task-due-at" className={styles.label}>
                  {TASK_CREATE_STRINGS.fields.dueAtLabel}
                </label>
                <input
                  id="task-due-at"
                  type="datetime-local"
                  className={styles.input}
                  value={dueAt}
                  onChange={(event) => setDueAt(event.target.value)}
                />
                <p className={styles.helperText}>{TASK_CREATE_STRINGS.fields.dueAtHelper}</p>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {activeError && (
            <div className={styles.errorAlert} role="alert">
              <span className={styles.errorIcon}>!</span>
              <p className={styles.errorText}>{activeError}</p>
            </div>
          )}

          {/* Form Actions Card */}
          <div className={styles.actionsCard}>
            {onCancel && (
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onCancel}
                disabled={pending}
              >
                {TASK_CREATE_STRINGS.actions.cancel}
              </button>
            )}
            <button type="submit" className={styles.primaryButton} disabled={pending}>
              {pending ? (
                <>
                  <span className={styles.spinner} />
                  <span>{TASK_CREATE_STRINGS.actions.submitting}</span>
                </>
              ) : (
                <>
                  <PlusIcon size={16} />
                  <span>{TASK_CREATE_STRINGS.actions.submit}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
