import { describe, expect, it } from "vitest";
import { resolveActivityTargetHref } from "./activity-target";

describe("resolveActivityTargetHref", () => {
  it("links only implemented entity routes", () => {
    expect(resolveActivityTargetHref({ entityType: "TASK", entityId: "task-1" })).toBe(
      "/tasks/task-1",
    );
    expect(resolveActivityTargetHref({ entityType: "TEAM", entityId: "team-1" })).toBe(
      "/teams/team-1",
    );
    expect(resolveActivityTargetHref({ entityType: "REPORT", entityId: "report-1" })).toBe(
      "/reports/report-1",
    );
    expect(resolveActivityTargetHref({ entityType: "USER", entityId: "user-1" })).toBeNull();
    expect(resolveActivityTargetHref({ entityType: "TASK", entityId: null })).toBeNull();
  });
});
