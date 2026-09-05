import { describe, expect, it } from "vitest";
import {
  buildActivityListQuery,
  validateActivityDateRange,
} from "@/features/activities/types/activity.types";

describe("buildActivityListQuery", () => {
  const filters = {
    action: " TASK_SUBMITTED ",
    entityType: " TASK ",
    actorId: " user-1 ",
    from: "2026-08-23T18:30",
    to: "2026-08-23T19:30",
  };

  it("allows SUPER_ADMIN and ADMIN actorId filters", () => {
    expect(
      buildActivityListQuery({ viewerRole: "SUPER_ADMIN", filters, page: 1, limit: 20 }),
    ).toMatchObject({
      page: 1,
      limit: 20,
      action: "TASK_SUBMITTED",
      entityType: "TASK",
      actorId: "user-1",
    });
    expect(
      buildActivityListQuery({ viewerRole: "ADMIN", filters, page: 1, limit: 20 }),
    ).toMatchObject({
      actorId: "user-1",
    });
  });

  it("strips stale actorId for MEMBER before the API call", () => {
    expect(
      buildActivityListQuery({ viewerRole: "MEMBER", filters, page: 1, limit: 20 }),
    ).not.toHaveProperty("actorId");
  });

  it("omits blank filters", () => {
    expect(
      buildActivityListQuery({
        viewerRole: "ADMIN",
        filters: { action: "", entityType: "", actorId: "", from: "", to: "" },
        page: 2,
        limit: 20,
      }),
    ).toEqual({ page: 2, limit: 20 });
  });

  it("validates date ranges locally", () => {
    expect(
      validateActivityDateRange({
        action: "",
        entityType: "",
        actorId: "",
        from: "2026-08-24T19:30",
        to: "2026-08-23T19:30",
      }),
    ).toBe("From must be earlier than or equal to To.");
  });
});
