"use client";

import { FormEvent, useState } from "react";
import { useOptionalAuth } from "@/context/AuthContext";
import type { OperixViewer } from "@/types/auth";
import {
  CalendarIcon,
  CheckCircleIcon,
  FileDocIcon,
  PlusIcon,
  ShieldCheckIcon,
} from "@/components/icons";
import type { Team } from "@/features/teams";
import { canCreateGlobalTask } from "@/lib/auth/permissions";
import { TASK_CREATE_STRINGS } from "@/utils/task-strings";
import type {
  CreateTaskDistributionInput,
  CreateTaskInput,
  TaskPriority,
  TaskRecurrenceFrequency,
  TaskScope,
} from "../../types/task.types";
import { TaskTeamPicker } from "../TaskTeamPicker";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import styles from "./TaskForm.module.css";

type DistributionMode = "IMMEDIATE" | "SCHEDULED" | "LEAD_TIME";
type RecurrenceSelection = "NONE" | TaskRecurrenceFrequency;

const DISTRIBUTION_MODES: { value: DistributionMode; label: string }[] = [
  { value: "IMMEDIATE", label: TASK_CREATE_STRINGS.distribution.modeImmediate },
  { value: "SCHEDULED", label: TASK_CREATE_STRINGS.distribution.modeScheduled },
  { value: "LEAD_TIME", label: TASK_CREATE_STRINGS.distribution.modeLeadTime },
];

const RECURRENCE_OPTIONS: { value: RecurrenceSelection; label: string }[] = [
  { value: "NONE", label: TASK_CREATE_STRINGS.recurrence.modeNone },
  { value: "WEEKLY", label: TASK_CREATE_STRINGS.recurrence.modeWeekly },
  { value: "MONTHLY", label: TASK_CREATE_STRINGS.recurrence.modeMonthly },
];

const DISTRIBUTION_LEAD_TIME_OPTIONS = Object.entries(
  TASK_CREATE_STRINGS.distribution.presets,
).map(([value, label]) => ({ value: Number(value), label }));

const REMINDER_LEAD_TIME_OPTIONS = Object.entries(
  TASK_CREATE_STRINGS.reminder.presets,
).map(([value, label]) => ({ value: Number(value), label }));

export interface TaskFormProps {
  pending: boolean;
  error: string | null;
  onSubmit: (input: CreateTaskInput) => void;
  onCancel?: () => void;
  viewer?: OperixViewer | null;
}

const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const toIsoOrUndefined = (value: string) => (value ? new Date(value).toISOString() : undefined);

export const TaskForm = ({
  pending,
  error,
  onSubmit,
  onCancel,
  viewer: propViewer,
}: TaskFormProps) => {
  const optionalAuth = useOptionalAuth();
  const viewer = propViewer !== undefined ? propViewer : (optionalAuth?.viewer ?? null);
  const canMakeGlobal = canCreateGlobalTask(viewer);
  const [scope, setScope] = useState<TaskScope>("TEAM");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [remarks, setRemarks] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueAt, setDueAt] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [notifyAll, setNotifyAll] = useState(false);
  const [distributionMode, setDistributionMode] = useState<DistributionMode>("IMMEDIATE");
  const [distributionScheduledAt, setDistributionScheduledAt] = useState("");
  const [distributionLeadMinutes, setDistributionLeadMinutes] = useState(1440);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderLeadMinutes, setReminderLeadMinutes] = useState(1440);
  const [allowSelfClaim, setAllowSelfClaim] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceSelection>("NONE");
  const [localError, setLocalError] = useState<string | null>(null);

  const hasDueDate = Boolean(dueAt);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setLocalError(TASK_CREATE_STRINGS.validation.titleRequired);
      return;
    }

    if (scope === "TEAM" && !selectedTeam) {
      setLocalError(TASK_CREATE_STRINGS.validation.teamRequired);
      return;
    }

    setLocalError(null);
    const trimmedDescription = description.trim();
    const trimmedRemarks = remarks.trim();

    // Build the reminder field for any task with a due date
    const resolvedReminderLeadMinutes =
      reminderEnabled && hasDueDate ? reminderLeadMinutes : undefined;

    const recurrence =
      recurrenceFrequency !== "NONE"
        ? {
            frequency: recurrenceFrequency,
            ...(resolvedReminderLeadMinutes ? { reminderLeadMinutes: resolvedReminderLeadMinutes } : {}),
          }
        : undefined;

    if (scope === "GLOBAL") {
      // Build distribution input with scheduling
      let distribution: CreateTaskDistributionInput | undefined;
      if (notifyAll) {
        distribution = { notifyAll: true };
        if (distributionMode === "SCHEDULED" && distributionScheduledAt) {
          distribution.scheduledAt = new Date(distributionScheduledAt).toISOString();
        } else if (distributionMode === "LEAD_TIME" && hasDueDate) {
          distribution.leadMinutes = distributionLeadMinutes;
        }
      }

      onSubmit({
        title: trimmedTitle,
        ...(trimmedDescription ? { description: trimmedDescription } : {}),
        ...(trimmedRemarks ? { remarks: trimmedRemarks } : {}),
        priority,
        ...(toIsoOrUndefined(dueAt) ? { dueAt: toIsoOrUndefined(dueAt) } : {}),
        scope: "GLOBAL",
        completionMode: "DIRECT",
        ...(allowSelfClaim && recurrenceFrequency === "NONE" ? { allowSelfClaim: true } : {}),
        ...(recurrence ? { recurrence } : {}),
        ...(distribution ? { distribution } : {}),
        ...(resolvedReminderLeadMinutes ? { reminderLeadMinutes: resolvedReminderLeadMinutes } : {}),
      });
    } else {
      onSubmit({
        title: trimmedTitle,
        ...(trimmedDescription ? { description: trimmedDescription } : {}),
        ...(trimmedRemarks ? { remarks: trimmedRemarks } : {}),
        priority,
        ...(toIsoOrUndefined(dueAt) ? { dueAt: toIsoOrUndefined(dueAt) } : {}),
        scope: "TEAM",
        teamId: selectedTeam!.id,
        ...(allowSelfClaim && recurrenceFrequency === "NONE" ? { allowSelfClaim: true } : {}),
        ...(recurrence ? { recurrence } : {}),
        ...(resolvedReminderLeadMinutes ? { reminderLeadMinutes: resolvedReminderLeadMinutes } : {}),
      });
    }
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
              {/* Task Scope Selector (for Super Admins) */}
              {canMakeGlobal && (
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>{TASK_CREATE_STRINGS.fields.scopeLabel}</label>
                  <div
                    className={styles.scopeSelector}
                    role="radiogroup"
                    aria-label={TASK_CREATE_STRINGS.fields.scopeLabel}
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={scope === "TEAM"}
                      className={`${styles.scopeButton} ${
                        scope === "TEAM" ? styles.scopeSelected : ""
                      }`}
                      onClick={() => {
                        setScope("TEAM");
                        if (localError) setLocalError(null);
                      }}
                    >
                      {TASK_CREATE_STRINGS.fields.scopeTeam}
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={scope === "GLOBAL"}
                      className={`${styles.scopeButton} ${
                        scope === "GLOBAL" ? styles.scopeSelected : ""
                      }`}
                      onClick={() => {
                        setScope("GLOBAL");
                        if (localError) setLocalError(null);
                      }}
                    >
                      {TASK_CREATE_STRINGS.fields.scopeGlobal}
                    </button>
                  </div>
                  <p className={styles.helperText}>
                    {scope === "TEAM"
                      ? TASK_CREATE_STRINGS.fields.scopeTeamDescription
                      : TASK_CREATE_STRINGS.fields.scopeGlobalDescription}
                  </p>
                </div>
              )}

              {/* Target Team or Global Notice */}
              {scope === "TEAM" ? (
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
              ) : (
                <div className={styles.globalNotice}>
                  <p className={styles.globalNoticeText}>
                    {TASK_CREATE_STRINGS.fields.teamNotRequiredForGlobal}
                  </p>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={notifyAll}
                      onChange={(event) => setNotifyAll(event.target.checked)}
                      className={styles.checkbox}
                    />
                    <span>{TASK_CREATE_STRINGS.fields.distributionNotifyAll}</span>
                  </label>
                  <p className={styles.helperText}>
                    {TASK_CREATE_STRINGS.fields.distributionNotifyAllHelper}
                  </p>

                  {/* Distribution Schedule Mode Selector */}
                  {notifyAll && (
                    <div className={styles.distributionScheduleSection}>
                      <label className={styles.label}>
                        {TASK_CREATE_STRINGS.distribution.scheduleLabel}
                      </label>
                      <div
                        className={styles.distributionModeSelector}
                        role="radiogroup"
                        aria-label={TASK_CREATE_STRINGS.distribution.scheduleLabel}
                      >
                        {DISTRIBUTION_MODES.map((mode) => (
                          <button
                            key={mode.value}
                            type="button"
                            role="radio"
                            aria-checked={distributionMode === mode.value}
                            className={`${styles.distributionModeButton} ${
                              distributionMode === mode.value
                                ? styles.distributionModeSelected
                                : ""
                            }`}
                            onClick={() => setDistributionMode(mode.value)}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                      <p className={styles.helperText}>
                        {distributionMode === "IMMEDIATE"
                          ? TASK_CREATE_STRINGS.distribution.modeImmediateDescription
                          : distributionMode === "SCHEDULED"
                            ? TASK_CREATE_STRINGS.distribution.modeScheduledDescription
                            : TASK_CREATE_STRINGS.distribution.modeLeadTimeDescription}
                      </p>

                      {/* Scheduled Date Picker */}
                      {distributionMode === "SCHEDULED" && (
                        <div className={styles.distributionScheduleField}>
                          <label
                            htmlFor="distribution-scheduled-at"
                            className={styles.label}
                          >
                            {TASK_CREATE_STRINGS.distribution.scheduledAtLabel}
                          </label>
                          <DateTimePicker
                            id="distribution-scheduled-at"
                            value={distributionScheduledAt}
                            onChange={(val) => setDistributionScheduledAt(val)}
                            placeholder={
                              TASK_CREATE_STRINGS.distribution.scheduledAtPlaceholder
                            }
                            ariaLabel={
                              TASK_CREATE_STRINGS.distribution.scheduledAtAriaLabel
                            }
                            placement="top"
                            align="right"
                          />
                          <p className={styles.helperText}>
                            {TASK_CREATE_STRINGS.distribution.scheduledAtHelper}
                          </p>
                        </div>
                      )}

                      {/* Lead Time Selector */}
                      {distributionMode === "LEAD_TIME" && (
                        <div className={styles.distributionScheduleField}>
                          <label
                            htmlFor="distribution-lead-minutes"
                            className={styles.label}
                          >
                            {TASK_CREATE_STRINGS.distribution.leadTimeLabel}
                          </label>
                          {hasDueDate ? (
                            <>
                              <select
                                id="distribution-lead-minutes"
                                className={styles.leadTimeSelect}
                                value={distributionLeadMinutes}
                                onChange={(event) =>
                                  setDistributionLeadMinutes(Number(event.target.value))
                                }
                              >
                                {DISTRIBUTION_LEAD_TIME_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <p className={styles.helperText}>
                                {TASK_CREATE_STRINGS.distribution.leadTimeHelper}
                              </p>
                            </>
                          ) : (
                            <p className={styles.infoCallout}>
                              {TASK_CREATE_STRINGS.distribution.leadTimeRequiresDueDate}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Clock-wise info callout */}
                      {distributionMode !== "IMMEDIATE" && (
                        <div className={styles.infoCallout}>
                          {TASK_CREATE_STRINGS.distribution.infoCallout}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

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
                  <CalendarIcon size={14} />
                  <span>{TASK_CREATE_STRINGS.fields.dueAtLabel}</span>
                </label>
                <DateTimePicker
                  id="task-due-at"
                  value={dueAt}
                  onChange={(val) => setDueAt(val)}
                  placeholder={TASK_CREATE_STRINGS.fields.dueAtPlaceholder}
                  ariaLabel={TASK_CREATE_STRINGS.fields.dueAtAriaLabel}
                  placement="top"
                  align="right"
                />
                <p className={styles.helperText}>{TASK_CREATE_STRINGS.fields.dueAtHelper}</p>
              </div>

              {/* Deadline Reminder Section */}
              <div className={styles.reminderSection}>
                <label className={styles.label}>
                  {TASK_CREATE_STRINGS.reminder.sectionLabel}
                </label>
                {hasDueDate ? (
                  <>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={reminderEnabled}
                        onChange={(event) => setReminderEnabled(event.target.checked)}
                        className={styles.checkbox}
                      />
                      <span>{TASK_CREATE_STRINGS.reminder.enableLabel}</span>
                    </label>
                    {reminderEnabled && (
                      <div className={styles.distributionScheduleField}>
                        <label
                          htmlFor="reminder-lead-minutes"
                          className={styles.label}
                        >
                          {TASK_CREATE_STRINGS.reminder.leadTimeLabel}
                        </label>
                        <select
                          id="reminder-lead-minutes"
                          className={styles.leadTimeSelect}
                          value={reminderLeadMinutes}
                          onChange={(event) =>
                            setReminderLeadMinutes(Number(event.target.value))
                          }
                        >
                          {REMINDER_LEAD_TIME_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <p className={styles.helperText}>
                          {TASK_CREATE_STRINGS.reminder.leadTimeHelper}
                        </p>
                      </div>
                    )}
                    <p className={styles.helperText}>
                      {TASK_CREATE_STRINGS.reminder.enableHelper}
                    </p>
                  </>
                ) : (
                  <p className={styles.infoCallout}>
                    {TASK_CREATE_STRINGS.reminder.requiresDueDate}
                  </p>
                )}
              </div>

              {/* Member Self-Claim Policy Section */}
              <div className={styles.reminderSection}>
                <label className={styles.label}>
                  {TASK_CREATE_STRINGS.selfClaim.sectionLabel}
                </label>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={allowSelfClaim}
                    disabled={recurrenceFrequency !== "NONE"}
                    onChange={(event) => setAllowSelfClaim(event.target.checked)}
                    className={styles.checkbox}
                  />
                  <span>{TASK_CREATE_STRINGS.selfClaim.enableLabel}</span>
                </label>
                <p className={styles.helperText}>
                  {recurrenceFrequency !== "NONE"
                    ? TASK_CREATE_STRINGS.selfClaim.disabledForRecurring
                    : TASK_CREATE_STRINGS.selfClaim.enableHelper}
                </p>
              </div>

              {/* Clock-Wise Recurrence Schedule Section */}
              <div className={styles.reminderSection}>
                <label className={styles.label}>
                  {TASK_CREATE_STRINGS.recurrence.sectionLabel}
                </label>
                <div
                  className={styles.distributionModeSelector}
                  role="radiogroup"
                  aria-label={TASK_CREATE_STRINGS.recurrence.sectionLabel}
                >
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={recurrenceFrequency === opt.value}
                      className={`${styles.distributionModeButton} ${
                        recurrenceFrequency === opt.value
                          ? styles.distributionModeSelected
                          : ""
                      }`}
                      onClick={() => {
                        setRecurrenceFrequency(opt.value);
                        if (opt.value !== "NONE") {
                          setAllowSelfClaim(false);
                        }
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className={styles.helperText}>
                  {recurrenceFrequency === "NONE"
                    ? TASK_CREATE_STRINGS.recurrence.modeNoneDescription
                    : recurrenceFrequency === "WEEKLY"
                      ? TASK_CREATE_STRINGS.recurrence.modeWeeklyDescription
                      : TASK_CREATE_STRINGS.recurrence.modeMonthlyDescription}
                </p>
                {recurrenceFrequency !== "NONE" && (
                  <div className={styles.infoCallout}>
                    {TASK_CREATE_STRINGS.recurrence.infoCallout}
                  </div>
                )}
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
