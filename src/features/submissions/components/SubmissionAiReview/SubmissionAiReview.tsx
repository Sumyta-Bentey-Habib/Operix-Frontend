"use client";

import { useEffect, useRef, useState } from "react";
import { isAbortError } from "@/lib/api";
import { reviewApi } from "../../api/review.api";
import type {
  SubmissionAiCoverageStatus,
  SubmissionAiIssueSeverity,
  SubmissionAiReviewResponse,
  SubmissionAiSuggestedDecision,
} from "../../types/submission-ai.types";
import { getSubmissionAiReviewErrorMessage } from "../submission-ai-errors";
import styles from "./SubmissionAiReview.module.css";

/**
 * Every user-facing string lives here so tests can assert copy without
 * duplicating literals. Nothing in this panel is a workflow command.
 */
export const SUBMISSION_AI_REVIEW_STRINGS = {
  sectionTitle: "AI Review Assistant",
  sectionSubtitle:
    "Advisory analysis of this Submission version. You remain the reviewer of record.",
  advisoryBadge: "Advisory only",
  analyze: "Analyze Submission",
  analyzing: "Analyzing...",
  analyzeHint:
    "The AI reviews this Submission and may analyze supported attached documents. Unsupported or unreadable content is reported under Limitations. It cannot approve, reject, or change the Task.",
  errorTitle: "AI analysis unavailable",
  summaryTitle: "Summary",
  decisionTitle: "Suggested decision",
  decisionNote:
    "Suggestion only. Set the Decision below yourself — nothing is applied automatically.",
  coverageTitle: "Requirement coverage",
  issuesTitle: "Issues",
  questionsTitle: "Questions for the reviewer",
  suggestedFeedbackTitle: "Suggested feedback",
  useSuggestedFeedback: "Use Suggested Feedback",
  feedbackApplied: "Suggested feedback copied into Feedback. Review and edit it before saving.",
  limitationsTitle: "Limitations",
  metaLabel: "AI run",
} as const;

export const SUBMISSION_AI_DECISION_LABELS: Record<SubmissionAiSuggestedDecision, string> = {
  APPROVE: "Suggests approval",
  REQUEST_REVISION: "Suggests requesting a revision",
  MANUAL_REVIEW: "Manual review needed",
};

export const SUBMISSION_AI_COVERAGE_LABELS: Record<SubmissionAiCoverageStatus, string> = {
  COVERED: "Covered",
  PARTIAL: "Partial",
  MISSING: "Missing",
};

export const SUBMISSION_AI_SEVERITY_LABELS: Record<SubmissionAiIssueSeverity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const decisionTone: Record<SubmissionAiSuggestedDecision, string> = {
  APPROVE: "positive",
  REQUEST_REVISION: "warning",
  MANUAL_REVIEW: "neutral",
};

const coverageTone: Record<SubmissionAiCoverageStatus, string> = {
  COVERED: "positive",
  PARTIAL: "warning",
  MISSING: "negative",
};

const severityTone: Record<SubmissionAiIssueSeverity, string> = {
  LOW: "neutral",
  MEDIUM: "warning",
  HIGH: "negative",
};

export interface SubmissionAiReviewProps {
  submissionId: string;
  /** Fills the review Feedback field. Never submits, and never sets the Decision. */
  onUseSuggestedFeedback: (feedback: string) => void;
}

export const SubmissionAiReview = ({
  submissionId,
  onUseSuggestedFeedback,
}: SubmissionAiReviewProps) => {
  const [analysis, setAnalysis] = useState<SubmissionAiReviewResponse | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      requestRef.current?.abort();
    },
    [],
  );

  const handleAnalyze = async () => {
    if (pending) return;

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    setPending(true);
    setError(null);
    setApplied(false);

    try {
      const result = await reviewApi.analyze(submissionId, controller.signal);
      if (controller.signal.aborted) return;
      setAnalysis(result);
    } catch (analysisError) {
      if (controller.signal.aborted || isAbortError(analysisError)) return;
      setAnalysis(null);
      setError(getSubmissionAiReviewErrorMessage(analysisError));
    } finally {
      if (!controller.signal.aborted) setPending(false);
    }
  };

  const suggestedFeedback = analysis?.suggestedFeedback.trim() ?? "";

  return (
    <section className={styles.panel} aria-label={SUBMISSION_AI_REVIEW_STRINGS.sectionTitle}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{SUBMISSION_AI_REVIEW_STRINGS.sectionTitle}</h3>
            <span className={styles.advisoryBadge}>
              {SUBMISSION_AI_REVIEW_STRINGS.advisoryBadge}
            </span>
          </div>
          <p className={styles.subtitle}>{SUBMISSION_AI_REVIEW_STRINGS.sectionSubtitle}</p>
        </div>
        <button
          type="button"
          className={styles.analyzeButton}
          onClick={() => void handleAnalyze()}
          disabled={pending}
        >
          {pending ? SUBMISSION_AI_REVIEW_STRINGS.analyzing : SUBMISSION_AI_REVIEW_STRINGS.analyze}
        </button>
      </header>

      <p className={styles.hint}>{SUBMISSION_AI_REVIEW_STRINGS.analyzeHint}</p>

      {error && (
        <div className={styles.error} role="alert">
          <strong>{SUBMISSION_AI_REVIEW_STRINGS.errorTitle}</strong>
          <span>{error}</span>
        </div>
      )}

      {analysis && (
        <div className={styles.result} aria-live="polite">
          <div>
            <h4 className={styles.sectionTitle}>{SUBMISSION_AI_REVIEW_STRINGS.decisionTitle}</h4>
            <span className={styles.chip} data-tone={decisionTone[analysis.suggestedDecision]}>
              {SUBMISSION_AI_DECISION_LABELS[analysis.suggestedDecision]}
            </span>
            <p className={styles.note}>{SUBMISSION_AI_REVIEW_STRINGS.decisionNote}</p>
          </div>

          <div>
            <h4 className={styles.sectionTitle}>{SUBMISSION_AI_REVIEW_STRINGS.summaryTitle}</h4>
            <p className={styles.summary}>{analysis.summary}</p>
          </div>

          {analysis.requirementCoverage.length > 0 && (
            <div>
              <h4 className={styles.sectionTitle}>{SUBMISSION_AI_REVIEW_STRINGS.coverageTitle}</h4>
              <ul className={styles.list}>
                {analysis.requirementCoverage.map((item, index) => (
                  <li className={styles.item} key={`${item.requirement}-${index}`}>
                    <div className={styles.itemHead}>
                      <span className={styles.itemTitle}>{item.requirement}</span>
                      <span className={styles.chip} data-tone={coverageTone[item.status]}>
                        {SUBMISSION_AI_COVERAGE_LABELS[item.status]}
                      </span>
                    </div>
                    <p className={styles.itemBody}>{item.evidence}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.issues.length > 0 && (
            <div>
              <h4 className={styles.sectionTitle}>{SUBMISSION_AI_REVIEW_STRINGS.issuesTitle}</h4>
              <ul className={styles.list}>
                {analysis.issues.map((issue, index) => (
                  <li className={styles.item} key={`${issue.finding}-${index}`}>
                    <div className={styles.itemHead}>
                      <span className={styles.itemTitle}>{issue.finding}</span>
                      <span className={styles.chip} data-tone={severityTone[issue.severity]}>
                        {SUBMISSION_AI_SEVERITY_LABELS[issue.severity]}
                      </span>
                    </div>
                    <p className={styles.itemBody}>{issue.rationale}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.questionsForReviewer.length > 0 && (
            <div>
              <h4 className={styles.sectionTitle}>{SUBMISSION_AI_REVIEW_STRINGS.questionsTitle}</h4>
              <ul className={styles.list}>
                {analysis.questionsForReviewer.map((question, index) => (
                  <li className={styles.itemBody} key={`${question}-${index}`}>
                    {question}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {suggestedFeedback && (
            <div>
              <h4 className={styles.sectionTitle}>
                {SUBMISSION_AI_REVIEW_STRINGS.suggestedFeedbackTitle}
              </h4>
              <p className={styles.feedback}>{suggestedFeedback}</p>
              <button
                type="button"
                className={styles.useFeedbackButton}
                onClick={() => {
                  onUseSuggestedFeedback(suggestedFeedback);
                  setApplied(true);
                }}
              >
                {SUBMISSION_AI_REVIEW_STRINGS.useSuggestedFeedback}
              </button>
              {applied && (
                <p className={styles.applied} role="status">
                  {SUBMISSION_AI_REVIEW_STRINGS.feedbackApplied}
                </p>
              )}
            </div>
          )}

          {analysis.limitations.length > 0 && (
            <div>
              <h4 className={styles.sectionTitle}>
                {SUBMISSION_AI_REVIEW_STRINGS.limitationsTitle}
              </h4>
              <ul className={styles.list}>
                {analysis.limitations.map((limitation) => (
                  <li className={styles.itemBody} key={limitation}>
                    {limitation}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className={styles.meta}>
            {SUBMISSION_AI_REVIEW_STRINGS.metaLabel}: {analysis.meta.provider} ·{" "}
            {analysis.meta.model} · {analysis.meta.latencyMs} ms
          </p>
        </div>
      )}
    </section>
  );
};
