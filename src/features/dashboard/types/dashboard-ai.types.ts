export type DashboardAiPeriod = "TODAY" | "LAST_7_DAYS" | "LAST_14_DAYS" | "LAST_30_DAYS";

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

export interface DashboardAiBriefContent {
  headline: string;
  executiveSummary: string;
  priorities: DashboardAiPriority[];
  workloadObservations: DashboardAiWorkloadObservation[];
  trendSummary: string;
  reportingSummary: string | null;
  nextActions: string[];
  confidence: DashboardAiConfidence;
  limitations: string[];
}

export interface DashboardAiBriefResponse {
  snapshot: {
    period: DashboardAiPeriod;
    periodStart: string;
    asOf: string;
    activeTasks: number;
    overdueTasks: number;
    reviewQueueTasks: number;
    revisionRequiredTasks: number;
    completedInPeriod: number;
  };
  brief: DashboardAiBriefContent;
  meta: {
    provider: string;
    model: string;
    attempts: number;
    latencyMs: number;
    period: DashboardAiPeriod;
    days: number;
    asOf: string;
  };
}
