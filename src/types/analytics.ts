/**
 * Analytics & Reports Chart Data Types
 */

export interface StatusDistributionPoint {
  id: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CompletionTrendPoint {
  period: string; // e.g. "Mar", "Apr", "May"
  completed: number;
  target: number;
  rate: number; // percentage
}

export interface AdminWorkloadItem {
  id: string;
  name: string;
  avatarUrl: string;
  role: string;
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
}

export interface MemberWorkloadItem {
  id: string;
  name: string;
  avatarUrl: string;
  department: string;
  activeTasks: number;
  maxCapacity: number;
  utilizationRate: number; // percentage
}

export interface MemberPerformanceScore {
  id: string;
  name: string;
  avatarUrl: string;
  department: string;
  tasksCompleted: number;
  slaAdherence: number; // e.g. 98.5%
  avgTurnaroundDays: number;
  qualityRating: number; // out of 5.0
  performanceBadge: "Top Performer" | "High Velocity" | "Consistent" | "On Track";
}

export interface CompletedVsPendingPoint {
  month: string;
  completed: number;
  pending: number;
}

export interface OverdueTrendPoint {
  week: string;
  overdueCount: number;
  resolvedOverdue: number;
}

export interface WeeklyDayProductivity {
  day: string; // "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
  tasksResolved: number;
  hoursLogged: number;
  isPeakDay?: boolean;
}

export interface MonthlyProductivityPoint {
  month: string;
  outputScore: number;
  growthPercentage: string;
  isPositive: boolean;
}
