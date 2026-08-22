/**
 * Activity Feed & Audit Log Type Definitions
 */

export type ActivityCategory =
  | "all"
  | "tasks"
  | "approvals"
  | "users"
  | "operations"
  | "system";

export type ActivityEventType =
  // Task events
  | "task_created"
  | "task_assigned"
  | "task_reassigned"
  | "task_submitted"
  | "task_completed"
  // Approval / Rejection events
  | "approval_approved"
  | "approval_rejected"
  | "approval_requested"
  // User events
  | "user_created"
  | "user_updated"
  | "user_role_changed"
  | "user_deactivated"
  // Operational events
  | "operational_settlement"
  | "batch_processed"
  | "compliance_audit"
  // System activity events
  | "system_backup"
  | "security_alert"
  | "webhook_triggered"
  | "config_updated";

export type ActivitySeverity = "info" | "success" | "warning" | "critical";

export interface ActivityActor {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  isSystem?: boolean;
}

export interface ActivityTarget {
  id: string;
  title: string;
  type: "task" | "user" | "report" | "payment" | "system" | "contract";
  href?: string;
}

export interface ActivityMetadata {
  previousValue?: string;
  newValue?: string;
  assigneeFrom?: string;
  assigneeTo?: string;
  amount?: number;
  currency?: string;
  reason?: string;
  ipAddress?: string;
  location?: string;
  batchCount?: number;
  priority?: "low" | "medium" | "high" | "urgent";
  tags?: string[];
}

export interface ActivityItem {
  id: string;
  type: ActivityEventType;
  category: ActivityCategory;
  title: string;
  description: string;
  timestamp: string; // ISO string
  formattedDate: string;
  formattedTime: string;
  relativeTime: string;
  groupDate: "today" | "yesterday" | "earlier";
  severity: ActivitySeverity;
  actor: ActivityActor;
  target?: ActivityTarget;
  metadata?: ActivityMetadata;
  badgeLabel?: string;
}

export interface ActivitySummaryMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  iconType: "activity" | "tasks" | "approvals" | "system";
}

export interface ActivityCategoryFilter {
  id: ActivityCategory;
  label: string;
  count: number;
}
