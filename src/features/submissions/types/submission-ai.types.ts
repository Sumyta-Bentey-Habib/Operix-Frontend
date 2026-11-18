/**
 * Mirrors the advisory payload of `POST /submissions/:submissionId/ai-review`.
 *
 * Nothing in this shape is a workflow command. The reviewer still uses the
 * normal Review form, and the backend only accepts a Review through the
 * existing review endpoint.
 */
export type SubmissionAiSuggestedDecision = "APPROVE" | "REQUEST_REVISION" | "MANUAL_REVIEW";

export type SubmissionAiCoverageStatus = "COVERED" | "PARTIAL" | "MISSING";

export type SubmissionAiIssueSeverity = "LOW" | "MEDIUM" | "HIGH";

export interface SubmissionAiCoverageItem {
  requirement: string;
  status: SubmissionAiCoverageStatus;
  evidence: string;
}

export interface SubmissionAiIssue {
  severity: SubmissionAiIssueSeverity;
  finding: string;
  rationale: string;
}

export interface SubmissionAiReviewMeta {
  provider: string;
  model: string;
  attempts: number;
  latencyMs: number;
}

export interface SubmissionAiReviewResponse {
  summary: string;
  requirementCoverage: SubmissionAiCoverageItem[];
  issues: SubmissionAiIssue[];
  questionsForReviewer: string[];
  suggestedDecision: SubmissionAiSuggestedDecision;
  suggestedFeedback: string;
  /** Server-owned caveats. Never produced by the model. */
  limitations: string[];
  meta: SubmissionAiReviewMeta;
}
