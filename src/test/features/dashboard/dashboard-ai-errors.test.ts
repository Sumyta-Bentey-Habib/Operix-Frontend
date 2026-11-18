import { describe, expect, it } from "vitest";
import { OperixApiError } from "@/lib/api";
import {
  DASHBOARD_AI_UNAVAILABLE_MESSAGE,
  getDashboardAiErrorMessage,
} from "@/features/dashboard/dashboard-ai-errors";

const apiError = (code: string, status = 503) =>
  new OperixApiError("backend detail", { status, code, details: null });

describe("getDashboardAiErrorMessage", () => {
  it("distinguishes a timeout from a provider outage", () => {
    expect(getDashboardAiErrorMessage(apiError("AI_TIMEOUT"))).toBe(
      "The AI brief request timed out. Try again, or keep using the Dashboard directly.",
    );
    expect(getDashboardAiErrorMessage(apiError("AI_PROVIDER_UNAVAILABLE"))).toBe(
      DASHBOARD_AI_UNAVAILABLE_MESSAGE,
    );
  });

  it("explains when the feature is turned off", () => {
    expect(getDashboardAiErrorMessage(apiError("AI_DISABLED"))).toBe(
      "AI Operations Brief is turned off for this workspace. Your Dashboard data remains available.",
    );
  });

  it("keeps the invalid-response and rate-limit copy actionable", () => {
    expect(getDashboardAiErrorMessage(apiError("AI_RESPONSE_INVALID"))).toBe(
      "The AI returned an unusable brief. Try generating it again.",
    );
    expect(getDashboardAiErrorMessage(apiError("RATE_LIMITED", 429))).toBe(
      "You have reached the AI brief limit. Wait a minute and try again.",
    );
  });

  it("reports a permission failure instead of an outage", () => {
    expect(getDashboardAiErrorMessage(apiError("FORBIDDEN", 403))).toBe(
      "You do not have access to the AI Operations Brief.",
    );
  });

  it("maps a transport failure to a network message", () => {
    expect(getDashboardAiErrorMessage(apiError("NETWORK_ERROR", 0))).toBe(
      "Unable to reach the AI service. Your Dashboard data remains available.",
    );
  });

  it("falls back to the stable message for unknown codes and raw errors", () => {
    expect(getDashboardAiErrorMessage(apiError("SOMETHING_ELSE", 502))).toBe(
      DASHBOARD_AI_UNAVAILABLE_MESSAGE,
    );
    expect(getDashboardAiErrorMessage(new Error("provider internals"))).toBe(
      DASHBOARD_AI_UNAVAILABLE_MESSAGE,
    );
    expect(getDashboardAiErrorMessage(undefined)).toBe(DASHBOARD_AI_UNAVAILABLE_MESSAGE);
  });

  it("never surfaces the backend message", () => {
    const message = getDashboardAiErrorMessage(apiError("AI_GENERATION_FAILED", 502));

    expect(message).not.toContain("backend detail");
    expect(message).toBe(DASHBOARD_AI_UNAVAILABLE_MESSAGE);
  });
});
