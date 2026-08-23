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
  MEMBER_NOT_ELIGIBLE_FOR_TASK:
    "The selected Member is not eligible for this Task. Choose an active Member assigned to the Task's Team.",
  MEMBER_NOT_TASK_ASSIGNEE: "You are not the active assignee for this Task.",
  FORBIDDEN: "You do not have permission to perform this action.",
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

  if (view.code === "INVALID_TASK_TRANSITION") {
    return "This Task can no longer be assigned in its current status.";
  }

  return view.message;
};

export const getTaskStartErrorMessage = (error: unknown): string => {
  const view = getTaskErrorView(error);

  if (view.code === "INVALID_TASK_TRANSITION") {
    return "This Task can no longer be started in its current status. Refresh and try again.";
  }

  return view.message;
};
