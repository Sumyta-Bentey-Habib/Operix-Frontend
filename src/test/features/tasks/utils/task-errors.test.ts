import { describe, expect, it } from "vitest";
import { OperixApiError } from "@/lib/api";
import {
  getDistributionErrorMessage,
  getTaskClaimErrorMessage,
  getTaskCompleteErrorMessage,
  getTaskErrorView,
} from "@/features/tasks/components/task-errors";

describe("getTaskErrorView", () => {
  it("maps DISTRIBUTION_NOT_FOUND to user-friendly message", () => {
    const error = new OperixApiError("Not found", {
      status: 404,
      code: "DISTRIBUTION_NOT_FOUND",
      details: null,
    });
    const view = getTaskErrorView(error);
    expect(view.code).toBe("DISTRIBUTION_NOT_FOUND");
    expect(view.message).toBe("No distribution found for this task.");
  });

  it("maps DISTRIBUTION_ALREADY_SENT to user-friendly message", () => {
    const error = new OperixApiError("Conflict", {
      status: 409,
      code: "DISTRIBUTION_ALREADY_SENT",
      details: null,
    });
    const view = getTaskErrorView(error);
    expect(view.code).toBe("DISTRIBUTION_ALREADY_SENT");
    expect(view.message).toBe(
      "Distribution has already been sent and cannot be modified.",
    );
  });

  it("maps DISTRIBUTION_ALREADY_CANCELLED to user-friendly message", () => {
    const error = new OperixApiError("Conflict", {
      status: 409,
      code: "DISTRIBUTION_ALREADY_CANCELLED",
      details: null,
    });
    const view = getTaskErrorView(error);
    expect(view.code).toBe("DISTRIBUTION_ALREADY_CANCELLED");
    expect(view.message).toBe("Distribution was already cancelled.");
  });

  it("maps GLOBAL_TASK_FORBIDDEN to user-friendly message", () => {
    const error = new OperixApiError("Forbidden", {
      status: 403,
      code: "GLOBAL_TASK_FORBIDDEN",
      details: null,
    });
    const view = getTaskErrorView(error);
    expect(view.code).toBe("GLOBAL_TASK_FORBIDDEN");
    expect(view.message).toBe("Only a Super Admin may create a global task.");
  });

  it("falls back to generic message for non-Error values", () => {
    const view = getTaskErrorView("something unexpected");
    expect(view.code).toBe("UNKNOWN_ERROR");
    expect(view.message).toBe("Something went wrong while loading Task data.");
  });
});

describe("getDistributionErrorMessage", () => {
  it("returns a tailored message for DISTRIBUTION_ALREADY_SENT", () => {
    const error = new OperixApiError("Conflict", {
      status: 409,
      code: "DISTRIBUTION_ALREADY_SENT",
      details: null,
    });
    expect(getDistributionErrorMessage(error)).toBe(
      "This distribution has already been sent and can no longer be modified.",
    );
  });

  it("returns a tailored message for DISTRIBUTION_ALREADY_CANCELLED", () => {
    const error = new OperixApiError("Conflict", {
      status: 409,
      code: "DISTRIBUTION_ALREADY_CANCELLED",
      details: null,
    });
    expect(getDistributionErrorMessage(error)).toBe(
      "This distribution was already cancelled.",
    );
  });

  it("falls back to the standard mapped message for other codes", () => {
    const error = new OperixApiError("Not found", {
      status: 404,
      code: "DISTRIBUTION_NOT_FOUND",
      details: null,
    });
    expect(getDistributionErrorMessage(error)).toBe(
      "No distribution found for this task.",
    );
  });

  it("falls back to API message for unknown error codes", () => {
    const error = new OperixApiError("Something broke", {
      status: 500,
      code: "INTERNAL_ERROR",
      details: null,
    });
    expect(getDistributionErrorMessage(error)).toBe("Something broke");
  });
});

describe("getTaskClaimErrorMessage", () => {
  it("returns tailored message for TASK_CLAIM_CONFLICT", () => {
    const error = new OperixApiError("Conflict", {
      status: 409,
      code: "TASK_CLAIM_CONFLICT",
      details: null,
    });
    expect(getTaskClaimErrorMessage(error)).toBe(
      "This task has already been claimed or assigned by someone else.",
    );
  });
});

describe("getTaskCompleteErrorMessage", () => {
  it("returns tailored message for TASK_ALREADY_COMPLETED", () => {
    const error = new OperixApiError("Conflict", {
      status: 409,
      code: "TASK_ALREADY_COMPLETED",
      details: null,
    });
    expect(getTaskCompleteErrorMessage(error)).toBe(
      "This task has already been completed.",
    );
  });
});

