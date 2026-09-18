import { OperixApiError } from "@/lib/api";

export interface TaskErrorView {
  message: string;
  code: string;
}

const TASK_ERROR_MESSAGES: Record<string, string> = {
  TASK_NOT_FOUND: "Task unavailable.",
  TASK_NOT_ASSIGNABLE: "This Task cannot be assigned.",
  TASK_ALREADY_ASSIGNED:
    "This Task already has an active assignment. Refresh the Task and try again.",
  INVALID_TASK_TRANSITION: "Task state changed. Refresh and try again.",
  TASK_INVALID_STATUS_TRANSITION: "Task state changed. Refresh and try again.",
  MEMBER_NOT_ELIGIBLE_FOR_TASK:
    "The selected Member is not eligible for this Task. Choose an active Member assigned to the Task's Team.",
  MEMBER_NOT_TASK_ASSIGNEE: "You are not the active assignee for this Task.",
  FORBIDDEN: "You do not have permission to perform this action.",
  DISTRIBUTION_NOT_FOUND: "No distribution found for this task.",
  DISTRIBUTION_ALREADY_SENT: "Distribution has already been sent and cannot be modified.",
  DISTRIBUTION_ALREADY_CANCELLED: "Distribution was already cancelled.",
  GLOBAL_TASK_FORBIDDEN: "Only a Super Admin may create a global task.",
  TASK_SELF_CLAIM_DISABLED: "Self-claiming is disabled for this task.",
  TASK_CLAIM_CONFLICT: "This task has already been claimed or assigned to another member.",
  TASK_SELF_CLAIM_NOT_ALLOWED_FOR_RECURRING_TASK:
    "Self-claim is not permitted for recurring tasks.",
  TASK_RECURRENCE_NOT_FOUND: "Task recurrence schedule not found.",
  INVALID_TASK_RECURRENCE: "Invalid task recurrence configuration.",
  TASK_ALREADY_COMPLETED: "This task has already been completed.",
  TASK_DIRECT_COMPLETION_NOT_ALLOWED: "Direct completion is not permitted for this task.",
  TASK_DIRECT_COMPLETION_REQUIRED: "This task requires direct completion.",
};

export const getTaskErrorView = (error: unknown): TaskErrorView => {
  if (error instanceof OperixApiError) {
    return {
      code: error.code,
      message: TASK_ERROR_MESSAGES[error.code] ?? error.message,
    };
  }

  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "Something went wrong while loading Task data.",
  };
};

export const getTaskAssignmentErrorMessage = (error: unknown): string => {
  const view = getTaskErrorView(error);

  if (view.code === "INVALID_TASK_TRANSITION" || view.code === "TASK_INVALID_STATUS_TRANSITION") {
    return "This Task can no longer be assigned in its current status.";
  }

  return view.message;
};

export const getTaskClaimErrorMessage = (error: unknown): string => {
  const view = getTaskErrorView(error);

  if (view.code === "TASK_CLAIM_CONFLICT") {
    return "This task has already been claimed or assigned by someone else.";
  }

  if (view.code === "INVALID_TASK_TRANSITION" || view.code === "TASK_INVALID_STATUS_TRANSITION") {
    return "This task is no longer available to claim.";
  }

  return view.message;
};

export const getTaskStartErrorMessage = (error: unknown): string => {
  const view = getTaskErrorView(error);

  if (view.code === "INVALID_TASK_TRANSITION" || view.code === "TASK_INVALID_STATUS_TRANSITION") {
    return "This Task can no longer be started in its current status. Refresh and try again.";
  }

  return view.message;
};

export const getTaskCompleteErrorMessage = (error: unknown): string => {
  const view = getTaskErrorView(error);

  if (view.code === "TASK_ALREADY_COMPLETED") {
    return "This task has already been completed.";
  }

  if (view.code === "INVALID_TASK_TRANSITION" || view.code === "TASK_INVALID_STATUS_TRANSITION") {
    return "This task cannot be completed in its current status.";
  }

  return view.message;
};

export const getDistributionErrorMessage = (error: unknown): string => {
  const view = getTaskErrorView(error);

  if (view.code === "DISTRIBUTION_ALREADY_SENT") {
    return "This distribution has already been sent and can no longer be modified.";
  }

  if (view.code === "DISTRIBUTION_ALREADY_CANCELLED") {
    return "This distribution was already cancelled.";
  }

  return view.message;
};


