import type { CompletionTrendPoint } from "../../types/dashboard.types";
import { formatDashboardNumber } from "../../utils/dashboard-format";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";

export const calculateTrendMetrics = (points: readonly CompletionTrendPoint[]) => {
  const maxValue = Math.max(0, ...points.map((point) => point.completedTasks));
  const totalCompleted = points.reduce((sum, point) => sum + point.completedTasks, 0);
  return { maxValue, totalCompleted };
};

export const calculateBarHeight = (
  completedTasks: number,
  maxValue: number,
  maxBarHeight = 130
): number => {
  const ratio = maxValue === 0 ? 0 : completedTasks / maxValue;
  return Math.max(4, Math.round(ratio * maxBarHeight));
};

export const getTrendSubtitle = (totalCompleted: number): string => {
  return totalCompleted > 0
    ? `${formatDashboardNumber(totalCompleted)} ${DASHBOARD_STRINGS.charts.tasksCompletedWindow}`
    : DASHBOARD_STRINGS.charts.completionTrendsSubtitle;
};
