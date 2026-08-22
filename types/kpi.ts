/**
 * Key Performance Indicator (KPI) Types
 */

export type KpiCardId =
  | "total_admins"
  | "total_members"
  | "total_tasks"
  | "completed_tasks"
  | "pending_tasks"
  | "in_progress_tasks"
  | "overdue_tasks"
  | "completion_rate";

export type KpiCategory = "all" | "team" | "tasks" | "efficiency";

export type KpiColorTheme =
  | "emerald"
  | "blue"
  | "purple"
  | "amber"
  | "rose"
  | "indigo"
  | "teal"
  | "cyan";

export interface KpiCardData {
  id: KpiCardId;
  title: string;
  value: string | number;
  formattedValue?: string;
  change: string;
  isPositive: boolean;
  period: string; // e.g. "vs last 30 days"
  category: KpiCategory;
  colorTheme: KpiColorTheme;
  description: string;
  sparklineData?: number[];
  progressPercentage?: number; // for completion rate or task ratios
  unit?: string; // e.g. "%" or ""
}

export interface KpiTaskDistributionItem {
  id: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface KpiOverviewData {
  kpiCards: KpiCardData[];
  taskDistribution: KpiTaskDistributionItem[];
  totalTasksCount: number;
  overallRate: number;
}
