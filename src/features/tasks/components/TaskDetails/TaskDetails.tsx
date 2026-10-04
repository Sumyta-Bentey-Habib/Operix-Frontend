"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { TaskSubmissions } from "@/features/submissions";
import {
  canAssignTask,
  canClaimTask,
  canDirectCompleteTask,
  canManageDistribution,
  canStartTask,
} from "@/lib/auth/permissions";
import { formatDisplayDate } from "@/utils/date";
import { obfuscateId } from "@/utils/id-obfuscator";
import { TASK_CREATE_STRINGS, TASK_DETAILS_STRINGS } from "@/utils/task-strings";
import type { OperixViewer } from "@/types/auth";
import { taskApi } from "../../api/task.api";
import { useTask } from "../../hooks/use-task";
import type { AssignTaskInput, Task, TaskStatus } from "../../types/task.types";
import {
  getDistributionErrorMessage,
  getTaskAssignmentErrorMessage,
  getTaskClaimErrorMessage,
  getTaskCompleteErrorMessage,
  getTaskErrorView,
  getTaskStartErrorMessage,
} from "../task-errors";
import { TaskAssignmentDialog } from "../TaskAssignmentDialog";
import { TaskAttachments } from "../TaskAttachments";
import { TaskHistory } from "../TaskHistory";
import { TaskPriorityBadge } from "../TaskPriorityBadge";
import { TaskStartButton } from "../TaskStartButton";
import { TaskStatusBadge } from "../TaskStatusBadge";
import { Modal } from "@/components/ui/Modal";
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileDocIcon,
  HistoryIcon,
  SendIcon,
} from "@/components/icons";
import styles from "./TaskDetails.module.css";

export interface TaskDetailsProps {
  taskId: string;
}

type TabKey = "submissions" | "attachments" | "history";

const SUBMISSION_PRIMARY_STATUSES: TaskStatus[] = [
  "REVISION_REQUIRED",
  "SUBMITTED",
  "UNDER_REVIEW",
  "RESUBMITTED",
];

export const getDefaultTaskDetailsTab = (
  viewer: OperixViewer | null,
  task: Task,
): TabKey => {
  if (SUBMISSION_PRIMARY_STATUSES.includes(task.status)) {
    return "submissions";
  }

  const isResponsibleMember =
    viewer?.role === "MEMBER" &&
    Boolean(task.responsible?.id && task.responsible.id === viewer.userId);

  if (isResponsibleMember && (task.status === "ASSIGNED" || task.status === "IN_PROGRESS")) {
    return "attachments";
  }

  if (
    task.completionMode === "DIRECT" &&
    (task.status === "ASSIGNED" || task.status === "IN_PROGRESS")
  ) {
    return "attachments";
  }

  return "submissions";
};

interface WorkflowStep {
  id: string;
  label: string;
  subtitle: string;
  state: "completed" | "current" | "upcoming" | "warning";
}

const formatOptionalDate = (value: string | null) =>
  value ? formatDisplayDate(value) : TASK_DETAILS_STRINGS.metadata.notApplicable;

const getSelfClaimPolicyLabel = (task: Task) => {
  if (task.scope === "GLOBAL") {
    if (task.recurrence) return TASK_DETAILS_STRINGS.metadata.selfClaimGlobalRecurring;
    if (task.responsible) return TASK_DETAILS_STRINGS.metadata.selfClaimGlobalAssigned;
    return TASK_DETAILS_STRINGS.metadata.selfClaimGlobalOpen;
  }

  return task.allowSelfClaim
    ? TASK_DETAILS_STRINGS.metadata.selfClaimTeamEnabled
    : TASK_DETAILS_STRINGS.metadata.selfClaimTeamDisabled;
};

function getWorkflowSteps(status: TaskStatus): WorkflowStep[] {
  const isCancelled = status === "CANCELLED";
  const isRevision = status === "REVISION_REQUIRED";

  let currentStageIndex = 0;
  if (status === "PENDING") {
    currentStageIndex = 0;
  } else if (status === "ASSIGNED") {
    currentStageIndex = 1;
  } else if (status === "IN_PROGRESS") {
    currentStageIndex = 2;
  } else if (
    status === "SUBMITTED" ||
    status === "UNDER_REVIEW" ||
    status === "REVISION_REQUIRED" ||
    status === "RESUBMITTED"
  ) {
    currentStageIndex = 3;
  } else if (status === "COMPLETED") {
    currentStageIndex = 4;
  } else if (isCancelled) {
    currentStageIndex = -1;
  }

  const rawSteps = [
    {
      id: "pending",
      label: TASK_DETAILS_STRINGS.stepper.stages.pending,
      subtitle: TASK_DETAILS_STRINGS.stepper.subtitles.pending,
    },
    {
      id: "assigned",
      label: TASK_DETAILS_STRINGS.stepper.stages.assigned,
      subtitle: TASK_DETAILS_STRINGS.stepper.subtitles.assigned,
    },
    {
      id: "in_progress",
      label: TASK_DETAILS_STRINGS.stepper.stages.inProgress,
      subtitle: TASK_DETAILS_STRINGS.stepper.subtitles.inProgress,
    },
    {
      id: "review",
      label: TASK_DETAILS_STRINGS.stepper.stages.underReview,
      subtitle: isRevision
        ? TASK_DETAILS_STRINGS.stepper.subtitles.revisionRequired
        : TASK_DETAILS_STRINGS.stepper.subtitles.underReview,
    },
    {
      id: "completed",
      label: TASK_DETAILS_STRINGS.stepper.stages.completed,
      subtitle: TASK_DETAILS_STRINGS.stepper.subtitles.completed,
    },
  ];

  return rawSteps.map((step, index) => {
    let state: WorkflowStep["state"] = "upcoming";
    if (isCancelled) {
      state = "upcoming";
    } else if (status === "COMPLETED") {
      state = "completed";
    } else if (index < currentStageIndex) {
      state = "completed";
    } else if (index === currentStageIndex) {
      state = isRevision ? "warning" : "current";
    }
    return { ...step, state };
  });
}

export const TaskDetails = ({ taskId }: TaskDetailsProps) => {
  const { viewer } = useAuth();
  const { task, loading, error, setTask, refresh } = useTask(taskId);
  const [assignmentOpen, setAssignmentOpen] = useState(false);
  const [assignmentPending, setAssignmentPending] = useState(false);
  const [startPending, setStartPending] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>("submissions");
  const tabInitializedRef = useRef(false);
  const [claimPending, setClaimPending] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [selfClaimPending, setSelfClaimPending] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeNote, setCompleteNote] = useState("");
  const [completePending, setCompletePending] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [distributionPending, setDistributionPending] = useState(false);
  const [distributionError, setDistributionError] = useState<string | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");

  useEffect(() => {
    if (tabInitializedRef.current || !viewer || !task) return;
    setActiveTab(getDefaultTaskDetailsTab(viewer, task));
    tabInitializedRef.current = true;
  }, [task, viewer]);

  if (!viewer) return null;

  const refreshTaskAndHistory = async () => {
    await refresh();
    setHistoryRefreshKey((value) => value + 1);
  };

  const handleAssign = async (input: AssignTaskInput) => {
    if (!task || assignmentPending) return;
    setAssignmentPending(true);
    setAssignmentError(null);

    try {
      const updatedTask = await taskApi.assign(task.id, input);
      setTask(updatedTask);
      setAssignmentOpen(false);
      await refreshTaskAndHistory();
    } catch (assignError) {
      setAssignmentError(getTaskAssignmentErrorMessage(assignError));
    } finally {
      setAssignmentPending(false);
    }
  };

  const handleClaim = async () => {
    if (!task || claimPending) return;
    setClaimPending(true);
    setClaimError(null);

    try {
      const updatedTask = await taskApi.claim(task.id);
      setTask(updatedTask);
      setActiveTab("attachments");
      await refreshTaskAndHistory();
    } catch (claimErr) {
      setClaimError(getTaskClaimErrorMessage(claimErr));
    } finally {
      setClaimPending(false);
    }
  };

  const handleEnableSelfClaim = async () => {
    if (!task || selfClaimPending) return;
    setSelfClaimPending(true);
    setClaimError(null);

    try {
      const updatedTask = await taskApi.updateSelfClaim(task.id, { enabled: true });
      setTask(updatedTask);
      await refreshTaskAndHistory();
    } catch (selfClaimError) {
      setClaimError(getTaskClaimErrorMessage(selfClaimError));
    } finally {
      setSelfClaimPending(false);
    }
  };

  const handleStart = async () => {
    if (!task || startPending) return;
    setStartPending(true);
    setStartError(null);

    try {
      const updatedTask = await taskApi.start(task.id);
      setTask(updatedTask);
      setActiveTab("attachments");
      await refreshTaskAndHistory();
    } catch (startTaskError) {
      setStartError(getTaskStartErrorMessage(startTaskError));
    } finally {
      setStartPending(false);
    }
  };

  const handleComplete = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!task || completePending) return;
    setCompletePending(true);
    setCompleteError(null);

    try {
      const trimmedNote = completeNote.trim();
      const updatedTask = await taskApi.complete(
        task.id,
        trimmedNote ? { completionNote: trimmedNote } : undefined,
      );
      setTask(updatedTask);
      setCompleteOpen(false);
      setCompleteNote("");
      await refreshTaskAndHistory();
    } catch (completeErr) {
      setCompleteError(getTaskCompleteErrorMessage(completeErr));
    } finally {
      setCompletePending(false);
    }
  };

  const handleRescheduleDistribution = async () => {
    if (!task || distributionPending || !rescheduleDate) return;
    setDistributionPending(true);
    setDistributionError(null);

    try {
      const updatedTask = await taskApi.rescheduleDistribution(task.id, {
        scheduledAt: new Date(rescheduleDate).toISOString(),
      });
      setTask(updatedTask);
      setRescheduleOpen(false);
      setRescheduleDate("");
      await refreshTaskAndHistory();
    } catch (rescheduleError) {
      setDistributionError(getDistributionErrorMessage(rescheduleError));
    } finally {
      setDistributionPending(false);
    }
  };

  const handleCancelDistribution = async () => {
    if (!task || distributionPending) return;
    setDistributionPending(true);
    setDistributionError(null);

    try {
      await taskApi.cancelDistribution(task.id);
      setCancelConfirmOpen(false);
      await refreshTaskAndHistory();
    } catch (cancelError) {
      setDistributionError(getDistributionErrorMessage(cancelError));
    } finally {
      setDistributionPending(false);
    }
  };

  if (loading) {
    return <LoadingState message={TASK_DETAILS_STRINGS.loading} />;
  }

  if (error || !task) {
    return <ErrorState message={getTaskErrorView(error).message} onRetry={() => void refresh()} />;
  }

  const workflowSteps = getWorkflowSteps(task.status);
  const canEnableLegacyGlobalSelfClaim =
    viewer.role === "SUPER_ADMIN" &&
    task.scope === "GLOBAL" &&
    task.status === "PENDING" &&
    !task.responsible &&
    !task.recurrence &&
    !task.allowSelfClaim;

  return (
    <section className={styles.container}>
      {/* Breadcrumb & Navigation Bar */}
      <div className={styles.topBar}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/dashboard" className={styles.breadcrumbLink}>
            {TASK_DETAILS_STRINGS.breadcrumbs.dashboard}
          </Link>
          <ChevronRightIcon size={12} className={styles.breadcrumbSeparator} />
          <Link href="/tasks" className={styles.breadcrumbLink}>
            {TASK_DETAILS_STRINGS.breadcrumbs.tasks}
          </Link>
        </nav>
        <Link href="/tasks" className={styles.backButton}>
          <ChevronLeftIcon size={14} />
          <span>{TASK_DETAILS_STRINGS.navigation.backToTasks}</span>
        </Link>
      </div>

      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.eyebrowRow}>
            <span className={styles.eyebrow}>{TASK_DETAILS_STRINGS.eyebrow}</span>
          </div>
          <h1 className={styles.title}>{task.title}</h1>
          <div className={styles.badgeRow}>
            {task.scope === "GLOBAL" && (
              <span className={styles.globalScopePill}>
                {TASK_DETAILS_STRINGS.metadata.scopeGlobal}
              </span>
            )}
            {task.recurrence && (
              <span className={styles.globalScopePill}>
                {TASK_DETAILS_STRINGS.badges.recurring}:{" "}
                {task.recurrence.frequency === "WEEKLY"
                  ? TASK_DETAILS_STRINGS.metadata.recurrenceWeekly
                  : TASK_DETAILS_STRINGS.metadata.recurrenceMonthly}
              </span>
            )}
            {task.allowSelfClaim && task.status === "PENDING" && (
              <span className={styles.globalScopePill}>
                {TASK_DETAILS_STRINGS.badges.selfClaim}
              </span>
            )}
            <TaskStatusBadge status={task.status} />
            <TaskPriorityBadge priority={task.priority} />
            {task.isOverdue && (
              <span className={styles.overduePill}>{TASK_DETAILS_STRINGS.badges.overdue}</span>
            )}
          </div>
        </div>

        <div className={styles.headerActions}>
          {canAssignTask(viewer, task) && task.status === "PENDING" && (
            <button
              type="button"
              className={styles.primaryActionButton}
              onClick={() => setAssignmentOpen(true)}
            >
              {TASK_DETAILS_STRINGS.actions.assignTask}
            </button>
          )}
          {canClaimTask(viewer, task) && (
            <button
              type="button"
              className={styles.primaryActionButton}
              onClick={handleClaim}
              disabled={claimPending}
            >
              {claimPending
                ? TASK_DETAILS_STRINGS.actions.claiming
                : TASK_DETAILS_STRINGS.actions.claimTask}
            </button>
          )}
          {canEnableLegacyGlobalSelfClaim && (
            <button
              type="button"
              className={styles.primaryActionButton}
              onClick={handleEnableSelfClaim}
              disabled={selfClaimPending}
            >
              {selfClaimPending
                ? TASK_DETAILS_STRINGS.actions.enablingSelfClaim
                : TASK_DETAILS_STRINGS.actions.enableSelfClaim}
            </button>
          )}
          {canStartTask(viewer, task) && (
            <TaskStartButton
              pending={startPending}
              onStart={handleStart}
              className={styles.primaryActionButton}
            />
          )}
          {canDirectCompleteTask(viewer, task) && (
            <button
              type="button"
              className={styles.primaryActionButton}
              onClick={() => setCompleteOpen(true)}
            >
              {TASK_DETAILS_STRINGS.actions.completeTask}
            </button>
          )}
        </div>
      </header>

      {startError && <div className={styles.errorAlert}>{startError}</div>}
      {assignmentError && <div className={styles.errorAlert}>{assignmentError}</div>}
      {claimError && <div className={styles.errorAlert}>{claimError}</div>}
      {completeError && <div className={styles.errorAlert}>{completeError}</div>}

      {/* Interactive Lifecycle Workflow Stepper */}
      <div className={styles.stepperCard}>
        <div className={styles.stepperHeader}>
          <h2 className={styles.stepperTitle}>{TASK_DETAILS_STRINGS.stepper.title}</h2>
          {task.status === "CANCELLED" && (
            <span className={styles.cancelledBadge}>
              {TASK_DETAILS_STRINGS.stepper.stages.cancelled}
            </span>
          )}
        </div>
        <div className={styles.stepperTrack}>
          {workflowSteps.map((step, idx) => (
            <div key={step.id} className={`${styles.stepItem} ${styles[`step_${step.state}`]}`}>
              <div className={styles.stepIndicatorWrapper}>
                <div className={styles.stepNode}>
                  {step.state === "completed" ? (
                    <CheckCircleIcon size={16} />
                  ) : (
                    <span className={styles.stepNumber}>{idx + 1}</span>
                  )}
                </div>
                {idx < workflowSteps.length - 1 && (
                  <div
                    className={`${styles.stepConnector} ${
                      step.state === "completed" ? styles.stepConnectorFilled : ""
                    }`}
                  />
                )}
              </div>
              <div className={styles.stepContent}>
                <span className={styles.stepLabel}>{step.label}</span>
                <span className={styles.stepSubtitle}>{step.subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Responsive Workspace Grid */}
      <div className={styles.contentGrid}>
        {/* Left Column: Overview & Interactive Workspace */}
        <div className={styles.mainColumn}>
          {/* Overview Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{TASK_DETAILS_STRINGS.sections.overview}</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.contentSection}>
                <h3 className={styles.sectionSubtitle}>
                  {TASK_DETAILS_STRINGS.sections.description}
                </h3>
                <p className={styles.descriptionText}>
                  {task.description ? (
                    task.description
                  ) : (
                    <span className={styles.emptyText}>
                      {TASK_DETAILS_STRINGS.metadata.noDescription}
                    </span>
                  )}
                </p>
              </div>

              <div className={styles.remarksSection}>
                <h3 className={styles.sectionSubtitle}>{TASK_DETAILS_STRINGS.sections.remarks}</h3>
                {task.remarks ? (
                  <div className={styles.remarksCallout}>
                    <p>{task.remarks}</p>
                  </div>
                ) : (
                  <p className={styles.emptyText}>{TASK_DETAILS_STRINGS.metadata.noRemarks}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tabbed Workspace Card */}
          <div className={styles.workspaceCard}>
            <div
              className={styles.tabBar}
              role="tablist"
              aria-label={TASK_DETAILS_STRINGS.sections.workspace}
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "submissions"}
                className={`${styles.tabButton} ${
                  activeTab === "submissions" ? styles.tabButtonActive : ""
                }`}
                onClick={() => setActiveTab("submissions")}
              >
                <SendIcon size={16} />
                <span>{TASK_DETAILS_STRINGS.tabs.submissions}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "attachments"}
                className={`${styles.tabButton} ${
                  activeTab === "attachments" ? styles.tabButtonActive : ""
                }`}
                onClick={() => setActiveTab("attachments")}
              >
                <FileDocIcon size={16} />
                <span>{TASK_DETAILS_STRINGS.tabs.attachments}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "history"}
                className={`${styles.tabButton} ${
                  activeTab === "history" ? styles.tabButtonActive : ""
                }`}
                onClick={() => setActiveTab("history")}
              >
                <HistoryIcon size={16} />
                <span>{TASK_DETAILS_STRINGS.tabs.history}</span>
              </button>
            </div>

            <div className={styles.tabContent}>
              {activeTab === "submissions" && (
                <TaskSubmissions task={task} onWorkflowRefresh={refreshTaskAndHistory} />
              )}
              {activeTab === "attachments" && (
                <TaskAttachments task={task} onTaskRefresh={refresh} />
              )}
              {activeTab === "history" && (
                <TaskHistory taskId={task.id} refreshKey={historyRefreshKey} />
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Metadata & Lifecycle Sidebar */}
        <aside className={styles.sidebarColumn}>
          {/* Timeline & Dates Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{TASK_DETAILS_STRINGS.sections.lifecycle}</h2>
            </div>
            <dl className={styles.metaList}>
              <div className={styles.metaItemHighlight}>
                <div className={styles.metaLabelRow}>
                  <CalendarIcon size={14} className={styles.metaIcon} />
                  <dt className={styles.metaLabel}>{TASK_DETAILS_STRINGS.metadata.dueDate}</dt>
                </div>
                <dd className={styles.metaValueHighlight}>
                  {formatOptionalDate(task.dueAt)}
                  {task.isOverdue && (
                    <span className={styles.overdueInlineBadge}>
                      {TASK_DETAILS_STRINGS.badges.overdue}
                    </span>
                  )}
                </dd>
              </div>

              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>{TASK_DETAILS_STRINGS.metadata.startedAt}</dt>
                <dd className={styles.metaValue}>{formatOptionalDate(task.startedAt)}</dd>
              </div>

              {task.completedAt && (
                <div className={styles.metaItem}>
                  <dt className={styles.metaLabel}>{TASK_DETAILS_STRINGS.metadata.completedAt}</dt>
                  <dd className={styles.metaValue}>{formatOptionalDate(task.completedAt)}</dd>
                </div>
              )}

              {task.cancelledAt && (
                <div className={styles.metaItem}>
                  <dt className={styles.metaLabel}>{TASK_DETAILS_STRINGS.metadata.cancelledAt}</dt>
                  <dd className={styles.metaValueWarning}>
                    {formatOptionalDate(task.cancelledAt)}
                  </dd>
                </div>
              )}

              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>{TASK_DETAILS_STRINGS.metadata.createdAt}</dt>
                <dd className={styles.metaValue}>{formatDisplayDate(task.createdAt)}</dd>
              </div>

              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>{TASK_DETAILS_STRINGS.metadata.updatedAt}</dt>
                <dd className={styles.metaValue}>{formatDisplayDate(task.updatedAt)}</dd>
              </div>

              {task.recurrence && (
                <div className={styles.metaItem}>
                  <dt className={styles.metaLabel}>{TASK_DETAILS_STRINGS.metadata.recurrence}</dt>
                  <dd className={styles.metaValue}>
                    {task.recurrence.frequency === "WEEKLY"
                      ? TASK_DETAILS_STRINGS.metadata.recurrenceWeekly
                      : TASK_DETAILS_STRINGS.metadata.recurrenceMonthly}
                    {task.recurrence.nextOccurrenceAt && (
                      <span className={styles.distributionDateDetail}>
                        {TASK_DETAILS_STRINGS.metadata.nextOccurrence}:{" "}
                        {formatDisplayDate(task.recurrence.nextOccurrenceAt)}
                      </span>
                    )}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Context & Ownership Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>{TASK_DETAILS_STRINGS.sections.ownership}</h2>
            </div>
            <dl className={styles.metaList}>
              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>{TASK_DETAILS_STRINGS.metadata.assignedTo}</dt>
                <dd className={styles.metaValue}>
                  {task.responsible ? (
                    <span>{task.responsible.name}</span>
                  ) : (
                    <span>{TASK_DETAILS_STRINGS.metadata.unassigned}</span>
                  )}
                </dd>
              </div>

              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>{TASK_DETAILS_STRINGS.metadata.createdBy}</dt>
                <dd className={styles.metaValue}>
                  {task.owner?.name ?? obfuscateId(task.createdById, "USR")}
                </dd>
              </div>

              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>{TASK_DETAILS_STRINGS.metadata.scope}</dt>
                <dd className={styles.metaValue}>
                  {task.scope === "GLOBAL"
                    ? TASK_DETAILS_STRINGS.metadata.scopeGlobal
                    : TASK_DETAILS_STRINGS.metadata.scopeTeam}
                </dd>
              </div>

              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>{TASK_DETAILS_STRINGS.metadata.team}</dt>
                <dd className={`${styles.metaValue} ${task.team ? styles.mono : ""}`}>
                  {task.scope === "GLOBAL" || (!task.team && !task.teamId)
                    ? TASK_DETAILS_STRINGS.metadata.none
                    : (task.team?.name ?? TASK_DETAILS_STRINGS.metadata.none)}
                </dd>
              </div>

              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>{TASK_DETAILS_STRINGS.metadata.selfClaim}</dt>
                <dd className={styles.metaValue}>{getSelfClaimPolicyLabel(task)}</dd>
              </div>

              {task.completionMode && (
                <div className={styles.metaItem}>
                  <dt className={styles.metaLabel}>
                    {TASK_DETAILS_STRINGS.metadata.completionMode}
                  </dt>
                  <dd className={styles.metaValue}>
                    {task.completionMode === "DIRECT"
                      ? TASK_DETAILS_STRINGS.metadata.completionModeDirect
                      : TASK_DETAILS_STRINGS.metadata.completionModeReview}
                  </dd>
                </div>
              )}

              {task.completionNote && (
                <div className={styles.metaItem}>
                  <dt className={styles.metaLabel}>
                    {TASK_DETAILS_STRINGS.metadata.completionNote}
                  </dt>
                  <dd className={styles.metaValue}>{task.completionNote}</dd>
                </div>
              )}

              {task.distribution && (
                <div className={styles.metaItem}>
                  <dt className={styles.metaLabel}>{TASK_DETAILS_STRINGS.metadata.distribution}</dt>
                  <dd className={styles.metaValue}>
                    {task.distribution.status === "SENT" ? (
                      <>
                        {TASK_DETAILS_STRINGS.metadata.distributionSent}
                        {task.distribution.sentAt && (
                          <span className={styles.distributionDateDetail}>
                            {TASK_DETAILS_STRINGS.distributionManagement.sentAtLabel}:{" "}
                            {formatDisplayDate(task.distribution.sentAt)}
                          </span>
                        )}
                      </>
                    ) : task.distribution.status === "CANCELLED" ? (
                      TASK_DETAILS_STRINGS.metadata.distributionCancelled
                    ) : (
                      <>
                        {TASK_DETAILS_STRINGS.metadata.distributionPending}
                        <span className={styles.distributionDateDetail}>
                          {TASK_DETAILS_STRINGS.distributionManagement.scheduledAtLabel}:{" "}
                          {formatDisplayDate(task.distribution.scheduledAt)}
                        </span>
                        {task.distribution.leadMinutes && (
                          <span className={styles.distributionDateDetail}>
                            {TASK_DETAILS_STRINGS.distributionManagement.leadMinutesLabel}:{" "}
                            {task.distribution.leadMinutes >= 1440
                              ? `${Math.round(task.distribution.leadMinutes / 1440)}d`
                              : `${task.distribution.leadMinutes}m`}
                          </span>
                        )}
                      </>
                    )}
                  </dd>

                  {/* Distribution Management Actions */}
                  {canManageDistribution(viewer) && task.distribution.status === "PENDING" && (
                    <div className={styles.distributionActions}>
                      {distributionError && (
                        <p className={styles.distributionErrorText}>{distributionError}</p>
                      )}

                      {rescheduleOpen ? (
                        <div className={styles.rescheduleInline}>
                          <input
                            type="datetime-local"
                            value={rescheduleDate}
                            onChange={(event) => setRescheduleDate(event.target.value)}
                            className={styles.rescheduleInput}
                          />
                          <div className={styles.rescheduleButtonRow}>
                            <button
                              type="button"
                              className={styles.distributionActionButton}
                              onClick={handleRescheduleDistribution}
                              disabled={distributionPending || !rescheduleDate}
                            >
                              {distributionPending
                                ? TASK_CREATE_STRINGS.actions.submitting
                                : TASK_DETAILS_STRINGS.distributionManagement.reschedule}
                            </button>
                            <button
                              type="button"
                              className={styles.distributionCancelButton}
                              onClick={() => {
                                setRescheduleOpen(false);
                                setRescheduleDate("");
                              }}
                              disabled={distributionPending}
                            >
                              {TASK_CREATE_STRINGS.actions.cancel}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className={styles.distributionButtonRow}>
                          <button
                            type="button"
                            className={styles.distributionActionButton}
                            onClick={() => setRescheduleOpen(true)}
                            disabled={distributionPending}
                          >
                            {TASK_DETAILS_STRINGS.distributionManagement.reschedule}
                          </button>
                          <button
                            type="button"
                            className={styles.distributionCancelButton}
                            onClick={() => setCancelConfirmOpen(true)}
                            disabled={distributionPending}
                          >
                            {TASK_DETAILS_STRINGS.distributionManagement.cancelDistribution}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Deadline Reminder */}
              {task.reminderLeadMinutes != null && (
                <div className={styles.metaItem}>
                  <dt className={styles.metaLabel}>{TASK_DETAILS_STRINGS.metadata.reminder}</dt>
                  <dd className={styles.metaValue}>
                    {TASK_DETAILS_STRINGS.metadata.reminderScheduled}
                    {task.reminderScheduledAt && (
                      <span className={styles.distributionDateDetail}>
                        {formatDisplayDate(task.reminderScheduledAt)}
                      </span>
                    )}
                    <span className={styles.distributionDateDetail}>
                      {task.reminderLeadMinutes >= 1440
                        ? `${Math.round(task.reminderLeadMinutes / 1440)}d before deadline`
                        : task.reminderLeadMinutes >= 60
                          ? `${Math.round(task.reminderLeadMinutes / 60)}h before deadline`
                          : `${task.reminderLeadMinutes}m before deadline`}
                    </span>
                  </dd>
                </div>
              )}

              <div className={styles.metaItem}>
                <dt className={styles.metaLabel}>{TASK_DETAILS_STRINGS.metadata.category}</dt>
                <dd className={`${styles.metaValue} ${styles.mono}`}>
                  {task.categoryId
                    ? obfuscateId(task.categoryId, "CAT")
                    : TASK_DETAILS_STRINGS.metadata.notApplicable}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {/* Task Assignment Dialog */}
      <TaskAssignmentDialog
        task={
          assignmentOpen && canAssignTask(viewer, task) && task.status === "PENDING" ? task : null
        }
        pending={assignmentPending}
        error={assignmentError}
        onSubmit={handleAssign}
        onClose={() => !assignmentPending && setAssignmentOpen(false)}
      />

      {/* Direct Completion Dialog */}
      <Modal
        open={completeOpen}
        title={TASK_DETAILS_STRINGS.directCompletionDialog.title}
        description={TASK_DETAILS_STRINGS.directCompletionDialog.description}
        onClose={() => !completePending && setCompleteOpen(false)}
      >
        <form className={styles.completeForm} onSubmit={handleComplete}>
          <label className={styles.completeField}>
            <span>{TASK_DETAILS_STRINGS.directCompletionDialog.noteLabel}</span>
            <textarea
              value={completeNote}
              maxLength={2000}
              onChange={(event) => setCompleteNote(event.target.value)}
              placeholder={TASK_DETAILS_STRINGS.directCompletionDialog.notePlaceholder}
              rows={4}
            />
          </label>
          {completeError && <p className={styles.distributionErrorText}>{completeError}</p>}
          <div className={styles.dialogActions}>
            <button
              type="button"
              className={styles.dialogCancelButton}
              onClick={() => setCompleteOpen(false)}
              disabled={completePending}
            >
              {TASK_DETAILS_STRINGS.directCompletionDialog.cancelButton}
            </button>
            <button type="submit" className={styles.primaryActionButton} disabled={completePending}>
              {completePending
                ? TASK_DETAILS_STRINGS.actions.completing
                : TASK_DETAILS_STRINGS.directCompletionDialog.submitButton}
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Distribution Confirmation Dialog */}
      {cancelConfirmOpen && (
        <div
          className={styles.confirmationOverlay}
          onClick={() => !distributionPending && setCancelConfirmOpen(false)}
          role="presentation"
        >
          <div
            className={styles.confirmationDialog}
            role="alertdialog"
            aria-labelledby="cancel-dist-title"
            aria-describedby="cancel-dist-desc"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="cancel-dist-title" className={styles.confirmationTitle}>
              {TASK_DETAILS_STRINGS.distributionManagement.confirmCancelTitle}
            </h3>
            <p id="cancel-dist-desc" className={styles.confirmationMessage}>
              {TASK_DETAILS_STRINGS.distributionManagement.confirmCancelMessage}
            </p>
            {distributionError && (
              <p className={styles.distributionErrorText}>{distributionError}</p>
            )}
            <div className={styles.confirmationActions}>
              <button
                type="button"
                className={styles.confirmationDismiss}
                onClick={() => setCancelConfirmOpen(false)}
                disabled={distributionPending}
              >
                {TASK_DETAILS_STRINGS.distributionManagement.confirmCancelDismiss}
              </button>
              <button
                type="button"
                className={styles.confirmationDestructive}
                onClick={handleCancelDistribution}
                disabled={distributionPending}
              >
                {distributionPending
                  ? TASK_CREATE_STRINGS.actions.submitting
                  : TASK_DETAILS_STRINGS.distributionManagement.confirmCancelAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
