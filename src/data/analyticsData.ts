import {
  StatusDistributionPoint,
  CompletionTrendPoint,
  AdminWorkloadItem,
  MemberWorkloadItem,
  MemberPerformanceScore,
  CompletedVsPendingPoint,
  OverdueTrendPoint,
  WeeklyDayProductivity,
  MonthlyProductivityPoint,
} from "@/types/analytics";

// 1. Task Status Distribution
export const TASK_STATUS_DISTRIBUTION: StatusDistributionPoint[] = [
  {
    id: "completed",
    label: "Completed Tasks",
    count: 1180,
    percentage: 83.1,
    color: "#10b981", // Emerald
  },
  {
    id: "in_progress",
    label: "In Progress",
    count: 128,
    percentage: 9.0,
    color: "#3b82f6", // Blue
  },
  {
    id: "pending",
    label: "Pending Review",
    count: 96,
    percentage: 6.8,
    color: "#f59e0b", // Amber
  },
  {
    id: "overdue",
    label: "Overdue",
    count: 16,
    percentage: 1.1,
    color: "#ef4444", // Rose/Red
  },
];

// 2. Task Completion Trend (6-Month Horizon)
export const TASK_COMPLETION_TREND: CompletionTrendPoint[] = [
  { period: "Mar", completed: 860, target: 800, rate: 107.5 },
  { period: "Apr", completed: 940, target: 900, rate: 104.4 },
  { period: "May", completed: 1010, target: 980, rate: 103.1 },
  { period: "Jun", completed: 1090, target: 1050, rate: 103.8 },
  { period: "Jul", completed: 1140, target: 1120, rate: 101.8 },
  { period: "Aug", completed: 1180, target: 1150, rate: 102.6 },
];

// 3. Workload by Admin
export const WORKLOAD_BY_ADMIN: AdminWorkloadItem[] = [
  {
    id: "adm-1",
    name: "Sujon",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    role: "Super Admin",
    assignedTasks: 420,
    completedTasks: 378,
    pendingTasks: 42,
    completionRate: 90.0,
  },
  {
    id: "adm-2",
    name: "Alex Morgan",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    role: "Operations Lead",
    assignedTasks: 380,
    completedTasks: 334,
    pendingTasks: 46,
    completionRate: 87.9,
  },
  {
    id: "adm-3",
    name: "Elena Rostova",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    role: "Regional Admin",
    assignedTasks: 340,
    completedTasks: 289,
    pendingTasks: 51,
    completionRate: 85.0,
  },
  {
    id: "adm-4",
    name: "Marcus Vance",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    role: "Compliance Officer",
    assignedTasks: 280,
    completedTasks: 245,
    pendingTasks: 35,
    completionRate: 87.5,
  },
];

// 4. Workload by Member
export const WORKLOAD_BY_MEMBER: MemberWorkloadItem[] = [
  {
    id: "mem-1",
    name: "Sarah Chen",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    department: "Finance & Accounting",
    activeTasks: 28,
    maxCapacity: 30,
    utilizationRate: 93.3,
  },
  {
    id: "mem-2",
    name: "Liam O'Connor",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    department: "Backend Engineering",
    activeTasks: 24,
    maxCapacity: 28,
    utilizationRate: 85.7,
  },
  {
    id: "mem-3",
    name: "David Kim",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    department: "Risk & Settlement",
    activeTasks: 22,
    maxCapacity: 25,
    utilizationRate: 88.0,
  },
  {
    id: "mem-4",
    name: "Priya Patel",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    department: "Compliance & Legal",
    activeTasks: 19,
    maxCapacity: 25,
    utilizationRate: 76.0,
  },
  {
    id: "mem-5",
    name: "Michael Chang",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80",
    department: "Treasury Operations",
    activeTasks: 18,
    maxCapacity: 24,
    utilizationRate: 75.0,
  },
  {
    id: "mem-6",
    name: "Emily Watson",
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80",
    department: "Audit & Reporting",
    activeTasks: 17,
    maxCapacity: 22,
    utilizationRate: 77.3,
  },
];

// 5. Member Performance Scorecard & Leaderboard
export const MEMBER_PERFORMANCE_SCORES: MemberPerformanceScore[] = [
  {
    id: "perf-1",
    name: "Sarah Chen",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    department: "Finance & Accounting",
    tasksCompleted: 248,
    slaAdherence: 99.2,
    avgTurnaroundDays: 1.4,
    qualityRating: 4.95,
    performanceBadge: "Top Performer",
  },
  {
    id: "perf-2",
    name: "Liam O'Connor",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
    department: "Backend Engineering",
    tasksCompleted: 215,
    slaAdherence: 98.6,
    avgTurnaroundDays: 1.8,
    qualityRating: 4.9,
    performanceBadge: "High Velocity",
  },
  {
    id: "perf-3",
    name: "David Kim",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    department: "Risk & Settlement",
    tasksCompleted: 198,
    slaAdherence: 97.4,
    avgTurnaroundDays: 2.1,
    qualityRating: 4.82,
    performanceBadge: "Consistent",
  },
  {
    id: "perf-4",
    name: "Priya Patel",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    department: "Compliance & Legal",
    tasksCompleted: 174,
    slaAdherence: 96.8,
    avgTurnaroundDays: 2.4,
    qualityRating: 4.78,
    performanceBadge: "On Track",
  },
];

// 6. Completed vs Pending Work (6-Month Horizon)
export const COMPLETED_VS_PENDING_DATA: CompletedVsPendingPoint[] = [
  { month: "Mar", completed: 180, pending: 65 },
  { month: "Apr", completed: 210, pending: 58 },
  { month: "May", completed: 245, pending: 52 },
  { month: "Jun", completed: 260, pending: 46 },
  { month: "Jul", completed: 290, pending: 38 },
  { month: "Aug", completed: 310, pending: 32 },
];

// 7. Overdue Trend (Weekly SLA Breach Reduction)
export const OVERDUE_TREND_DATA: OverdueTrendPoint[] = [
  { week: "Wk 1", overdueCount: 48, resolvedOverdue: 32 },
  { week: "Wk 2", overdueCount: 39, resolvedOverdue: 35 },
  { week: "Wk 3", overdueCount: 31, resolvedOverdue: 28 },
  { week: "Wk 4", overdueCount: 24, resolvedOverdue: 22 },
  { week: "Wk 5", overdueCount: 19, resolvedOverdue: 18 },
  { week: "Wk 6", overdueCount: 16, resolvedOverdue: 15 },
];

// 8. Weekly Productivity (Day-by-Day Throughput)
export const WEEKLY_PRODUCTIVITY_DATA: WeeklyDayProductivity[] = [
  { day: "Mon", tasksResolved: 48, hoursLogged: 38.5 },
  { day: "Tue", tasksResolved: 64, hoursLogged: 42.0 },
  { day: "Wed", tasksResolved: 76, hoursLogged: 44.5, isPeakDay: true },
  { day: "Thu", tasksResolved: 68, hoursLogged: 41.0 },
  { day: "Fri", tasksResolved: 55, hoursLogged: 36.0 },
  { day: "Sat", tasksResolved: 18, hoursLogged: 12.0 },
  { day: "Sun", tasksResolved: 12, hoursLogged: 8.5 },
];

// 9. Monthly Productivity Growth Index
export const MONTHLY_PRODUCTIVITY_DATA: MonthlyProductivityPoint[] = [
  { month: "Mar", outputScore: 78, growthPercentage: "+4.2%", isPositive: true },
  { month: "Apr", outputScore: 83, growthPercentage: "+6.4%", isPositive: true },
  { month: "May", outputScore: 87, growthPercentage: "+4.8%", isPositive: true },
  { month: "Jun", outputScore: 91, growthPercentage: "+4.6%", isPositive: true },
  { month: "Jul", outputScore: 95, growthPercentage: "+4.4%", isPositive: true },
  { month: "Aug", outputScore: 99, growthPercentage: "+4.2%", isPositive: true },
];
