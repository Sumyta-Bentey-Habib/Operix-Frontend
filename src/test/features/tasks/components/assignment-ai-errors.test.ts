import { describe, expect, it } from "vitest";
import { OperixApiError } from "@/lib/api";
import { getAssignmentAiErrorMessage } from "@/features/tasks/components/assignment-ai-errors";

const FALLBACK =
  "AI recommendations are temporarily unavailable. You can continue assigning this Task manually.";

const apiError = (code: string, status = 503) =>
  new OperixApiError("backend detail", { status, code, details: null });

describe("getAssignmentAiErrorMessage", () => {
  it("distinguishes a timeout from a provider outage", () => {
    expect(getAssignmentAiErrorMessage(apiError("AI_TIMEOUT"))).toBe(
      "The AI recommendation request timed out. You can continue assigning this Task manually.",
    );
    expect(getAssignmentAiErrorMessage(apiError("AI_PROVIDER_UNAVAILABLE"))).toBe(FALLBACK);
  });

  it("keeps a provider rejection and an unusable response actionable", () => {
    expect(getAssignmentAiErrorMessage(apiError("AI_GENERATION_FAILED", 502))).toBe(
      "The AI could not produce usable recommendations. You can continue assigning this Task manually.",
    );
    expect(getAssignmentAiErrorMessage(apiError("AI_RESPONSE_INVALID", 502))).toBe(
      "The AI returned unusable recommendations. You can continue assigning this Task manually.",
    );
  });

  it("explains an empty candidate pool without calling it an outage", () => {
    expect(
      getAssignmentAiErrorMessage(apiError("TASK_ASSIGNMENT_RECOMMENDATIONS_UNAVAILABLE", 409)),
    ).toBe("No eligible alternative Members are currently available. Choose a Member manually.");
  });

  it("reports Task-level conflicts through their own copy", () => {
    expect(getAssignmentAiErrorMessage(apiError("TASK_NOT_ASSIGNABLE", 409))).toBe(
      "This Task can no longer be assigned.",
    );
    expect(getAssignmentAiErrorMessage(apiError("TASK_NOT_FOUND", 404))).toBe(
      "This Task is no longer available. Refresh and try again.",
    );
    expect(getAssignmentAiErrorMessage(apiError("FORBIDDEN", 403))).toBe(
      "You do not have permission to assign this Task.",
    );
  });

  it("maps a transport failure to a network message", () => {
    expect(getAssignmentAiErrorMessage(apiError("NETWORK_ERROR", 0))).toBe(
      "Unable to reach the AI service. You can continue assigning this Task manually.",
    );
  });

  it("always leaves manual assignment available on unknown failures", () => {
    expect(getAssignmentAiErrorMessage(apiError("UNEXPECTED", 500))).toBe(FALLBACK);
    expect(getAssignmentAiErrorMessage(new Error("provider internals"))).toBe(FALLBACK);
    expect(getAssignmentAiErrorMessage(null)).toBe(FALLBACK);
    expect(FALLBACK).toContain("manually");
  });
});
