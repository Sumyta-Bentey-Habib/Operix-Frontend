import { isOperixApiError } from "@/lib/api";

/**
 * AI review failures never block manual review, so every message repeats the
 * manual escape hatch. `FORBIDDEN` is deliberately not a provider message: it
 * means review authority itself was lost.
 */
const MESSAGES: Record<string, string> = {
  AI_DISABLED:
    "AI review is turned off for this workspace. You can still review this Submission manually.",
  AI_PROVIDER_UNAVAILABLE:
    "The AI service is unavailable right now. You can still review this Submission manually.",
  AI_GENERATION_FAILED:
    "The AI could not produce a usable analysis. You can still review this Submission manually.",
  AI_RESPONSE_INVALID:
    "The AI returned an unusable analysis. You can still review this Submission manually.",
  AI_RATE_LIMITED:
    "The AI provider is rate limited. Wait a minute and try again, or review this Submission manually.",
  RATE_LIMITED:
    "You have reached the AI review limit. Wait a minute and try again, or review this Submission manually.",
  FORBIDDEN:
    "You no longer have permission to analyze this submission. Refresh the submission and try again.",
  SUBMISSION_NOT_FOUND: "Submission unavailable. Refresh the Submission and try again.",
  REVIEW_NOT_ALLOWED:
    "This Submission can no longer be analyzed. Refresh the Submission and try again.",
  NETWORK_ERROR: "Unable to reach the AI service. You can still review this Submission manually.",
};

const FALLBACK_MESSAGE = "The AI analysis failed. You can still review this Submission manually.";

export const getSubmissionAiReviewErrorMessage = (error: unknown): string => {
  if (!isOperixApiError(error)) {
    return FALLBACK_MESSAGE;
  }

  return MESSAGES[error.code] ?? FALLBACK_MESSAGE;
};
