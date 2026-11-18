import { isOperixApiError } from "@/lib/api";

/**
 * Assignment recommendations are advisory. A failure never blocks manual
 * assignment, so every message keeps that escape hatch.
 */
const MESSAGES: Record<string, string> = {
  AI_DISABLED:
    "AI recommendations are turned off for this workspace. You can continue assigning this Task manually.",
  AI_TIMEOUT:
    "The AI recommendation request timed out. You can continue assigning this Task manually.",
  AI_PROVIDER_UNAVAILABLE:
    "AI recommendations are temporarily unavailable. You can continue assigning this Task manually.",
  AI_GENERATION_FAILED:
    "The AI could not produce usable recommendations. You can continue assigning this Task manually.",
  AI_RESPONSE_INVALID:
    "The AI returned unusable recommendations. You can continue assigning this Task manually.",
  AI_RATE_LIMITED:
    "The AI provider is rate limited. Wait a minute and try again, or assign manually.",
  RATE_LIMITED:
    "You have reached the AI recommendation limit. Wait a minute and try again, or assign manually.",
  TASK_ASSIGNMENT_RECOMMENDATIONS_UNAVAILABLE:
    "No eligible alternative Members are currently available. Choose a Member manually.",
  TASK_NOT_ASSIGNABLE: "This Task can no longer be assigned.",
  TASK_NOT_FOUND: "This Task is no longer available. Refresh and try again.",
  FORBIDDEN: "You do not have permission to assign this Task.",
  NETWORK_ERROR: "Unable to reach the AI service. You can continue assigning this Task manually.",
};

const FALLBACK =
  "AI recommendations are temporarily unavailable. You can continue assigning this Task manually.";

export const getAssignmentAiErrorMessage = (error: unknown): string => {
  if (!isOperixApiError(error)) {
    return FALLBACK;
  }

  return MESSAGES[error.code] ?? FALLBACK;
};
