import type { TaskStatus } from "@/features/tasks/types/task.types";
import { formatDashboardStatusLabel } from "../../utils/dashboard-format";
import { DASHBOARD_STRINGS } from "@/utils/dashboard-strings";
import { StatusPieChart } from "../KpiGrid/KpiGrid";
import type { PieSliceData } from "../KpiGrid/KpiGrid";
import {
  TASK_STATUSES,
  STATUS_COLOR_MAP,
  DEFAULT_FALLBACK_COLOR,
} from "./breakdown-cards.helpers";

export const TaskStatusBreakdown = ({ counts }: { counts: Record<TaskStatus, number> }) => {
  const pieItems: PieSliceData[] = TASK_STATUSES.map((status) => ({
    key: status,
    label: formatDashboardStatusLabel(status),
    count: counts[status] ?? 0,
    color: STATUS_COLOR_MAP[status] ?? DEFAULT_FALLBACK_COLOR,
  }));

  return (
    <StatusPieChart
      items={pieItems}
      title={DASHBOARD_STRINGS.charts.taskStatusDistribution}
      subtitle={DASHBOARD_STRINGS.charts.taskStatusSubtitle}
    />
  );
};
