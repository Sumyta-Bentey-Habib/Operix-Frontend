"use client";

import type { ReactNode } from "react";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import type { DashboardAiBriefResponse, DashboardAiPeriod } from "../../types/dashboard-ai.types";
import styles from "./DashboardAiBrief.module.css";

export interface DashboardAiBriefProps {
  brief: DashboardAiBriefResponse | null;
  period: DashboardAiPeriod;
  pending: boolean;
  error: string | null;
  onPeriodChange: (period: DashboardAiPeriod) => void;
  onGenerate: () => void;
}

const PERIOD_OPTIONS: { value: DashboardAiPeriod; label: string }[] = [
  { value: "TODAY", label: "Today" },
  { value: "LAST_7_DAYS", label: "Last 7 days" },
  { value: "LAST_14_DAYS", label: "Last 14 days" },
  { value: "LAST_30_DAYS", label: "Last 30 days" },
];

const CATEGORY_LABELS = {
  OVERDUE: "Overdue",
  REVIEW_QUEUE: "Review queue",
  REVISION: "Revision",
  WORKLOAD: "Workload",
  COMPLETION_TREND: "Completion trend",
  MANAGEMENT_REPORTS: "Management reports",
  ACTIVITY: "Activity",
} as const;

export const DashboardAiBrief = ({
  brief: response,
  period,
  pending,
  error,
  onPeriodChange,
  onGenerate,
}: DashboardAiBriefProps) => {
  const copy = DASHBOARD_STRINGS.aiBrief;
  const brief = response?.brief ?? null;

  return (
    <section className={styles.card} aria-labelledby="dashboard-ai-brief-title">
      <header className={styles.header}>
        <div className={styles.headingGroup}>
          <div className={styles.titleRow}>
            <h2 id="dashboard-ai-brief-title" className={styles.title}>
              {copy.title}
            </h2>
            <span className={styles.advisory}>{copy.advisory}</span>
          </div>
          <p className={styles.subtitle}>{copy.subtitle}</p>
        </div>
        <div className={styles.controls}>
          <div className={styles.periodControl}>
            <span>Brief period</span>
            <div className={styles.periodSelector} role="radiogroup" aria-label="Brief period">
              {PERIOD_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={period === option.value}
                  className={period === option.value ? styles.periodSelected : undefined}
                  onClick={() => onPeriodChange(option.value)}
                  disabled={pending}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className={styles.generateButton}
            onClick={onGenerate}
            disabled={pending}
          >
            {pending ? copy.generating : response ? copy.refresh : copy.generate}
          </button>
        </div>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {!response && !error && (
        <div className={styles.empty}>
          <strong>{copy.emptyTitle}</strong>
          <span>Select a period, then generate a read-only operational summary.</span>
        </div>
      )}

      {response && brief && (
        <div className={styles.result} aria-live="polite">
          <div className={styles.snapshot} aria-label="Operations snapshot">
            <SnapshotMetric label="Active" value={response.snapshot.activeTasks} />
            <SnapshotMetric label="Overdue" value={response.snapshot.overdueTasks} />
            <SnapshotMetric label="Review queue" value={response.snapshot.reviewQueueTasks} />
            <SnapshotMetric label="Revision" value={response.snapshot.revisionRequiredTasks} />
            <SnapshotMetric label="Completed" value={response.snapshot.completedInPeriod} />
          </div>

          <div className={styles.summary}>
            <h3>{brief.headline}</h3>
            <p>{brief.executiveSummary}</p>
          </div>

          {brief.priorities.length > 0 && (
            <BriefSection title={copy.priorities} open>
              <ul className={styles.gridList}>
                {brief.priorities.map((priority, index) => (
                  <li
                    className={styles.priority}
                    data-severity={priority.severity}
                    key={`${priority.title}-${index}`}
                  >
                    <div className={styles.itemHeader}>
                      <strong>{priority.title}</strong>
                      <div className={styles.badges}>
                        <span className={styles.category}>
                          {CATEGORY_LABELS[priority.category]}
                        </span>
                        <span className={styles.severity} data-severity={priority.severity}>
                          {priority.severity}
                        </span>
                      </div>
                    </div>
                    <p>{priority.evidence}</p>
                    <p className={styles.action}>{priority.suggestedAction}</p>
                  </li>
                ))}
              </ul>
            </BriefSection>
          )}

          {brief.workloadObservations.length > 0 && (
            <BriefSection title={copy.workload}>
              <ul className={styles.gridList}>
                {brief.workloadObservations.map((observation, index) => (
                  <li className={styles.observation} key={`${observation.subject}-${index}`}>
                    <strong>{observation.subject}</strong>
                    <span className={styles.subjectType}>{observation.subjectType}</span>
                    <p>{observation.observation}</p>
                    <p className={styles.evidence}>{observation.evidence}</p>
                  </li>
                ))}
              </ul>
            </BriefSection>
          )}

          <BriefSection title={copy.trends}>
            <p>{brief.trendSummary}</p>
          </BriefSection>

          {brief.reportingSummary && (
            <BriefSection title={copy.reporting}>
              <p>{brief.reportingSummary}</p>
            </BriefSection>
          )}

          {brief.nextActions.length > 0 && (
            <BriefSection title={copy.nextActions}>
              <ol className={styles.numberedList}>
                {brief.nextActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ol>
            </BriefSection>
          )}

          {brief.limitations.length > 0 && (
            <BriefSection title={copy.limitations} muted>
              <ul className={styles.limitations}>
                {brief.limitations.map((limitation) => (
                  <li key={limitation}>{limitation}</li>
                ))}
              </ul>
            </BriefSection>
          )}

          <p className={styles.meta}>
            {copy.confidence}: {brief.confidence} · {copy.generated}:{" "}
            <time dateTime={response.meta.asOf}>{formatAsOf(response.meta.asOf)}</time>
          </p>
        </div>
      )}
    </section>
  );
};

const SnapshotMetric = ({ label, value }: { label: string; value: number }) => (
  <div className={styles.snapshotMetric}>
    <strong>{value}</strong>
    <span>{label}</span>
  </div>
);

const BriefSection = ({
  title,
  muted = false,
  open = false,
  children,
}: {
  title: string;
  muted?: boolean;
  open?: boolean;
  children: ReactNode;
}) => (
  <details className={muted ? styles.mutedSection : styles.section} open={open}>
    <summary>{title}</summary>
    <div className={styles.sectionBody}>{children}</div>
  </details>
);

function formatAsOf(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
