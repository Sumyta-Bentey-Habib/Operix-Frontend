import type { DashboardTrendDays } from "./dashboard.types";

export type DashboardAiSeverity = "HIGH" | "MEDIUM" | "LOW";

export type DashboardAiCategory =
  | "OVERDUE"
  | "REVIEW_QUEUE"
  | "REVISION"
  | "WORKLOAD"
  | "COMPLETION_TREND"
  | "MANAGEMENT_REPORTS"
  | "ACTIVITY";

export type DashboardAiConfidence = "LOW" | "MEDIUM" | "HIGH";

export interface DashboardAiPriority {
  severity: DashboardAiSeverity;
  category: DashboardAiCategory;
  title: string;
  evidence: string;
  suggestedAction: string;
}

export interface DashboardAiWorkloadObservation {
  subjectType: "TEAM" | "MEMBER";
  subject: string;
  observation: string;
  evidence: string;
}

export interface DashboardAiBriefResponse {
  headline: string;
  executiveSummary: string;
  priorities: DashboardAiPriority[];
  workloadObservations: DashboardAiWorkloadObservation[];
  trendSummary: string;
  reportingSummary: string | null;
  nextActions: string[];
  confidence: DashboardAiConfidence;
  limitations: string[];
  meta: {
    provider: string;
    model: string;
    attempts: number;
    latencyMs: number;
    days: DashboardTrendDays;
    asOf: string;
  };
}
