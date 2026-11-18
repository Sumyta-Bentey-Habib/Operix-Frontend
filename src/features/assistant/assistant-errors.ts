import { isOperixApiError } from "@/lib/api";
import { ASSISTANT_STRINGS } from "./constants/assistant-strings";

/**
 * Ask Operix is read-only and stateless, so every failure message ends with the
 * same reassurance: the rest of Operix keeps working.
 */
const MESSAGES: Record<string, string> = {
  AI_DISABLED:
    "Ask Operix is turned off for this workspace. You can continue using Operix normally.",
  AI_TIMEOUT: "Ask Operix took too long to answer. Try a shorter question or ask again.",
  AI_PROVIDER_UNAVAILABLE: ASSISTANT_STRINGS.unavailable,
  AI_GENERATION_FAILED: ASSISTANT_STRINGS.unavailable,
  AI_RESPONSE_INVALID: "Ask Operix could not answer that reliably. Try rephrasing the question.",
  AI_RATE_LIMITED: "Ask Operix is rate limited. Wait a minute and try again.",
  RATE_LIMITED: "You have reached the Ask Operix limit. Wait a minute and try again.",
  NETWORK_ERROR: "Unable to reach Ask Operix. You can continue using Operix normally.",
};

export const getAskOperixErrorMessage = (error: unknown): string => {
  if (!isOperixApiError(error)) {
    return ASSISTANT_STRINGS.unavailable;
  }

  return MESSAGES[error.code] ?? ASSISTANT_STRINGS.unavailable;
};
