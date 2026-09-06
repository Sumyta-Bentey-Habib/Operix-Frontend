/**
 * Centralized color constants for Dashboard KPI cards, metric dots, and charts.
 * Avoids hardcoded hex colors in components and adheres to design system rules.
 */
export const DASHBOARD_METRIC_COLORS = {
  blue: "#3B82F6",
  emerald: "#10B981",
  red: "#EF4444",
  amber: "#F59E0B",
  purple: "#8B5CF6",
  indigo: "#6366F1",
  pink: "#EC4899",
  gray: "#6B7280",
  mutedGray: "#9CA3AF",
  cyan: "#06B6D4",
} as const;

export const DASHBOARD_METRIC_ITEM_COLORS = {
  totalTasks: DASHBOARD_METRIC_COLORS.blue,
  completedTasks: DASHBOARD_METRIC_COLORS.emerald,
  overdueTasks: DASHBOARD_METRIC_COLORS.red,
  cancelledTasks: DASHBOARD_METRIC_COLORS.gray,
  reviewQueue: DASHBOARD_METRIC_COLORS.purple,
  scopedTeams: DASHBOARD_METRIC_COLORS.emerald,
  totalTeams: DASHBOARD_METRIC_COLORS.emerald,
  totalAdmins: DASHBOARD_METRIC_COLORS.indigo,
  activeTasks: DASHBOARD_METRIC_COLORS.blue,
  dueSoon: DASHBOARD_METRIC_COLORS.amber,
  revisionRequired: DASHBOARD_METRIC_COLORS.red,
  onTimeRate: DASHBOARD_METRIC_COLORS.blue,
  averageCompletion: DASHBOARD_METRIC_COLORS.mutedGray,
  reportsNeedingRevision: DASHBOARD_METRIC_COLORS.amber,
  revisionRequiredTasks: DASHBOARD_METRIC_COLORS.red,
  draftReports: DASHBOARD_METRIC_COLORS.mutedGray,
} as const;
