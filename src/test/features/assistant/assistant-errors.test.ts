import { describe, expect, it } from "vitest";
import { OperixApiError } from "@/lib/api";
import { getAskOperixErrorMessage } from "@/features/assistant/assistant-errors";
import { ASSISTANT_STRINGS } from "@/features/assistant/constants/assistant-strings";

const apiError = (code: string, status = 503) =>
  new OperixApiError("backend detail", { status, code, details: null });

describe("getAskOperixErrorMessage", () => {
  it("distinguishes a timeout from a provider outage", () => {
    expect(getAskOperixErrorMessage(apiError("AI_TIMEOUT"))).toBe(
      "Ask Operix took too long to answer. Try a shorter question or ask again.",
    );
    expect(getAskOperixErrorMessage(apiError("AI_PROVIDER_UNAVAILABLE"))).toBe(
      ASSISTANT_STRINGS.unavailable,
    );
  });

  it("keeps the feature-off message separate from an outage", () => {
    expect(getAskOperixErrorMessage(apiError("AI_DISABLED"))).toBe(
      "Ask Operix is turned off for this workspace. You can continue using Operix normally.",
    );
  });

  it("asks the user to rephrase when the answer was unusable", () => {
    expect(getAskOperixErrorMessage(apiError("AI_RESPONSE_INVALID", 502))).toBe(
      "Ask Operix could not answer that reliably. Try rephrasing the question.",
    );
  });

  it("explains a rate limit with the available wait", () => {
    expect(getAskOperixErrorMessage(apiError("AI_RATE_LIMITED", 429))).toBe(
      "Ask Operix is rate limited. Wait a minute and try again.",
    );
    expect(getAskOperixErrorMessage(apiError("RATE_LIMITED", 429))).toBe(
      "You have reached the Ask Operix limit. Wait a minute and try again.",
    );
  });

  it("maps a transport failure to a network message", () => {
    expect(getAskOperixErrorMessage(apiError("NETWORK_ERROR", 0))).toBe(
      "Unable to reach Ask Operix. You can continue using Operix normally.",
    );
  });

  it("falls back to the stable message without leaking backend detail", () => {
    expect(getAskOperixErrorMessage(apiError("UNEXPECTED", 500))).toBe(
      ASSISTANT_STRINGS.unavailable,
    );
    expect(getAskOperixErrorMessage(new Error("provider internals"))).toBe(
      ASSISTANT_STRINGS.unavailable,
    );
    expect(getAskOperixErrorMessage(null)).toBe(ASSISTANT_STRINGS.unavailable);
    expect(getAskOperixErrorMessage(apiError("AI_GENERATION_FAILED", 502))).not.toContain(
      "backend detail",
    );
  });
});
