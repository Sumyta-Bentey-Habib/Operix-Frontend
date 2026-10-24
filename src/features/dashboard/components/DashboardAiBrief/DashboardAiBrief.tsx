"use client";

import type { ReactNode } from "react";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import type { DashboardAiBriefResponse } from "../../types/dashboard-ai.types";
import type { DashboardTrendDays } from "../../types/dashboard.types";
import styles from "./DashboardAiBrief.module.css";

export interface DashboardAiBriefProps {
  brief: DashboardAiBriefResponse | null;
  days: DashboardTrendDays;
  pending: boolean;
  error: string | null;
  onGenerate: () => void;
}

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
  brief,
  days,
  pending,
  error,
  onGenerate,
}: DashboardAiBriefProps) => {
  const copy = DASHBOARD_STRINGS.aiBrief;

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
          <p className={styles.period}>{copy.period(days)}</p>
        </div>
        <button
          type="button"
          className={styles.generateButton}
          onClick={onGenerate}
          disabled={pending}
        >
          {pending ? copy.generating : brief ? copy.refresh : copy.generate}
        </button>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {!brief && !error && (
        <div className={styles.empty}>
          <strong>{copy.emptyTitle}</strong>
          <span>{copy.emptyMessage}</span>
        </div>
      )}

      {brief && (
        <div className={styles.result} aria-live="polite">
          <div className={styles.summary}>
            <h3>{brief.headline}</h3>
            <p>{brief.executiveSummary}</p>
          </div>

          {brief.priorities.length > 0 && (
            <BriefSection title={copy.priorities}>
              <ul className={styles.gridList}>
                {brief.priorities.map((priority, index) => (
                  <li className={styles.priority} key={`${priority.title}-${index}`}>
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

          <div className={styles.twoColumn}>
            <BriefSection title={copy.trends}>
              <p>{brief.trendSummary}</p>
            </BriefSection>
            {brief.reportingSummary && (
              <BriefSection title={copy.reporting}>
                <p>{brief.reportingSummary}</p>
              </BriefSection>
            )}
          </div>

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
            <time dateTime={brief.meta.asOf}>{formatAsOf(brief.meta.asOf)}</time>
          </p>
        </div>
      )}
    </section>
  );
};

const BriefSection = ({
  title,
  muted = false,
  children,
}: {
  title: string;
  muted?: boolean;
  children: ReactNode;
}) => (
  <section className={muted ? styles.mutedSection : styles.section}>
    <h3>{title}</h3>
    {children}
  </section>
);

function formatAsOf(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
