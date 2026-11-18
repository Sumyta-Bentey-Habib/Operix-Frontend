import { isOperixApiError } from "@/lib/api";

/**
 * The AI Operations Brief never blocks the Dashboard, so every message repeats
 * that the canonical metrics remain available.
 */
export const DASHBOARD_AI_UNAVAILABLE_MESSAGE =
  "AI Operations Brief is temporarily unavailable. Your Dashboard data remains available.";

const MESSAGES: Record<string, string> = {
  AI_DISABLED:
    "AI Operations Brief is turned off for this workspace. Your Dashboard data remains available.",
  AI_TIMEOUT: "The AI brief request timed out. Try again, or keep using the Dashboard directly.",
  AI_PROVIDER_UNAVAILABLE: DASHBOARD_AI_UNAVAILABLE_MESSAGE,
  AI_GENERATION_FAILED: DASHBOARD_AI_UNAVAILABLE_MESSAGE,
  AI_RESPONSE_INVALID: "The AI returned an unusable brief. Try generating it again.",
  AI_RATE_LIMITED: "The AI provider is rate limited. Wait a minute and try again.",
  RATE_LIMITED: "You have reached the AI brief limit. Wait a minute and try again.",
  FORBIDDEN: "You do not have access to the AI Operations Brief.",
  NETWORK_ERROR: "Unable to reach the AI service. Your Dashboard data remains available.",
};

export const getDashboardAiErrorMessage = (error: unknown): string => {
  if (!isOperixApiError(error)) {
    return DASHBOARD_AI_UNAVAILABLE_MESSAGE;
  }

  return MESSAGES[error.code] ?? DASHBOARD_AI_UNAVAILABLE_MESSAGE;
};
